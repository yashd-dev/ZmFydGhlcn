from collections import defaultdict
from contextlib import contextmanager
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Iterator

import psycopg
from psycopg_pool import ConnectionPool

from .config import require_db_url, settings
from .domain import Actual, Forecast


class Repository:
    def __init__(self) -> None:
        self.schema_path = Path(__file__).resolve().parents[1] / "schema" / "schema.sql"
        self.pool: ConnectionPool | None = None

    def _pool(self) -> ConnectionPool:
        if self.pool is None:
            self.pool = ConnectionPool(
                require_db_url(), min_size=1, max_size=10, open=True
            )
        return self.pool

    @contextmanager
    def connection(self) -> Iterator[psycopg.Connection]:
        with self._pool().connection() as connection:
            yield connection

    def close(self) -> None:
        if self.pool is not None:
            self.pool.close()

    def initialize(self) -> None:
        schema = self.schema_path.read_text(encoding="utf-8")
        with self.connection() as connection:
            connection.execute(schema)

    def seed_if_empty(self) -> None:
        from .bmrs import fetch_seed_data

        with self.connection() as connection:
            connection.execute(
                "SELECT pg_advisory_xact_lock(hashtext('wind-intelligence-seed'))"
            )
            (
                actual_count,
                forecast_count,
                prior_actual_count,
                prior_forecast_count,
            ) = connection.execute(
                """
                SELECT
                    (SELECT count(*) FROM actuals),
                    (SELECT count(*) FROM forecasts),
                    (SELECT count(*) FROM actuals WHERE settlement_date = %s),
                    (SELECT count(DISTINCT start_time) FROM forecasts WHERE start_time::date = %s)
                """,
                (
                    date.fromisoformat(settings.evaluation_from) - timedelta(days=1),
                    date.fromisoformat(settings.evaluation_from) - timedelta(days=1),
                ),
            ).fetchone()
            if (
                actual_count
                and forecast_count
                and prior_actual_count >= 48
                and prior_forecast_count >= 24
            ):
                return
            actuals, forecasts = fetch_seed_data()
            with connection.cursor() as cursor:
                cursor.executemany(
                    """
                    INSERT INTO actuals
                        (start_time, settlement_date, settlement_period, mw, publish_time)
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT (start_time) DO UPDATE SET
                        settlement_date = EXCLUDED.settlement_date,
                        settlement_period = EXCLUDED.settlement_period,
                        mw = EXCLUDED.mw,
                        publish_time = EXCLUDED.publish_time
                    """,
                    [
                        (
                            row["startTime"],
                            row["settlementDate"],
                            row["settlementPeriod"],
                            row["generation"],
                            row["publishTime"],
                        )
                        for row in actuals
                    ],
                )
                cursor.executemany(
                    """
                    INSERT INTO forecasts (start_time, publish_time, mw)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (start_time, publish_time) DO UPDATE SET
                        mw = EXCLUDED.mw
                    """,
                    [
                        (row["startTime"], row["publishTime"], row["generation"])
                        for row in forecasts
                    ],
                )

    def counts(self) -> tuple[int, int]:
        with self.connection() as connection:
            actual_count = connection.execute(
                "SELECT count(*) FROM actuals"
            ).fetchone()[0]
            forecast_count = connection.execute(
                "SELECT count(*) FROM forecasts"
            ).fetchone()[0]
        return actual_count, forecast_count

    def actuals_between(self, start: datetime, end: datetime) -> dict[datetime, Actual]:
        with self.connection() as connection:
            rows = connection.execute(
                "SELECT start_time, mw FROM actuals WHERE start_time >= %s AND start_time < %s",
                (start, end),
            ).fetchall()
        return {start_time: Actual(start_time, mw) for start_time, mw in rows}

    def forecasts_between(
        self, start: datetime, end: datetime
    ) -> dict[datetime, list[Forecast]]:
        with self.connection() as connection:
            rows = connection.execute(
                """
                SELECT start_time, publish_time, mw
                FROM forecasts
                WHERE start_time >= %s AND start_time < %s
                ORDER BY start_time, publish_time
                """,
                (start, end),
            ).fetchall()
        grouped: dict[datetime, list[Forecast]] = defaultdict(list)
        for start_time, publish_time, mw in rows:
            grouped[start_time].append(Forecast(start_time, publish_time, mw))
        return dict(grouped)


repository = Repository()
