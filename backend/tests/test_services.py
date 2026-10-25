from datetime import UTC, date, datetime

from app.services import delivery_cutoff, hourly_targets


def test_hourly_targets_follow_local_day_length() -> None:
    assert len(hourly_targets(date(2026, 3, 29), date(2026, 3, 29))) == 23
    assert len(hourly_targets(date(2026, 10, 25), date(2026, 10, 25))) == 25


def test_delivery_cutoff_uses_local_delivery_date() -> None:
    delivery = datetime(2026, 1, 10, 23, tzinfo=UTC)

    assert delivery_cutoff("09:00", delivery).date().isoformat() == "2026-01-09"
