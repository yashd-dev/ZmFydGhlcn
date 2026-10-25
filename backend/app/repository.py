from collections import defaultdict
from contextlib import contextmanager
from datetime import datetime
from pathlib import Path
from typing import Iterator

import psycopg

from .config import require_db_url
from .domain import Actual, Forecast


class Repository:
    def __init__(self) -> None:
        self.schema_path = Path(__file__).resolve().parents[1] / "schema" / "schema.sql"

    @contextmanager
    def connection(self) -> Iterator[psycopg.Connection]:
        with psycopg.connect(require_db_url(), connect_timeout=10) as connection:
            yield connection

    def initialize(self) -> None:
        schema = self.schema_path.read_text(encoding="utf-8")
        with self.connection() as connection:
            connection.execute(schema)

    def seed_if_empty(self) -> None:
        from .bmrs import fetch_seed_data

        actual_count, forecast_count = self.counts()
        if actual_count and forecast_count:
            return
        actuals, forecasts = fetch_seed_data()
        with self.connection() as connection:
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
