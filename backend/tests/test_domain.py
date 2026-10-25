from datetime import UTC, datetime

from app.domain import Actual, Forecast, evaluate_hour, metrics


def test_evaluate_hour_uses_latest_forecast_before_cutoff() -> None:
    start = datetime(2026, 1, 10, tzinfo=UTC)
    forecasts = [
        Forecast(start, datetime(2026, 1, 9, 8, tzinfo=UTC), 10),
        Forecast(start, datetime(2026, 1, 9, 9, tzinfo=UTC), 12),
        Forecast(start, datetime(2026, 1, 9, 10, tzinfo=UTC), 14),
    ]
    result = evaluate_hour(
        start,
        forecasts,
        {
            start: Actual(start, 10),
            start.replace(minute=30): Actual(start.replace(minute=30), 12),
        },
        datetime(2026, 1, 9, 9, tzinfo=UTC),
    )

    assert result.forecast == forecasts[1]
    assert result.error_mw == 1


def test_metrics_returns_empty_values_without_matches() -> None:
    assert metrics([]) == {"mae": None, "rmse": None, "bias": None, "matched_count": 0}
