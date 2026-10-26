from collections import defaultdict
from contextlib import contextmanager
from datetime import UTC, date, datetime, time, timedelta
from pathlib import Path
from typing import Iterator
from zoneinfo import ZoneInfo

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

        start = date.fromisoformat(settings.evaluation_from) - timedelta(days=1)
        end = date.fromisoformat(settings.evaluation_to) + timedelta(days=1)
        timezone = ZoneInfo(settings.timezone)
        start_time = datetime.combine(start, time.min, timezone).astimezone(UTC)
        end_time = datetime.combine(end, time.min, timezone).astimezone(UTC)
        with self.connection() as connection:
            connection.execute(
                "SELECT pg_advisory_xact_lock(hashtext('wind-intelligence-seed'))"
            )
            expected_hours = int((end_time - start_time).total_seconds() / 3600)
            expected_actuals = expected_hours * 2
            actual_count, forecast_hours = connection.execute(
                """
                SELECT
                    (SELECT count(*) FROM actuals WHERE start_time >= %s AND start_time < %s),
                    (SELECT count(DISTINCT start_time) FROM forecasts WHERE start_time >= %s AND start_time < %s)
                """,
                (start_time, end_time, start_time, end_time),
            ).fetchone()
            if actual_count >= expected_actuals and forecast_hours >= expected_hours:
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

    def check_connection(self) -> None:
        with self.connection() as connection:
            connection.execute("SELECT 1")

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
