from dataclasses import dataclass
from datetime import datetime
from math import sqrt


@dataclass(frozen=True)
class Actual:
    start_time: datetime
    mw: float


@dataclass(frozen=True)
class Forecast:
    start_time: datetime
    publish_time: datetime
    mw: float


@dataclass(frozen=True)
class IntervalResult:
    start_time: datetime
    forecast: Forecast | None
    actual_mw: float | None
    status: str
    reason: str | None = None
    error_mw: float | None = None


def select_latest_forecast(
    forecasts: list[Forecast], cutoff: datetime
) -> Forecast | None:
    eligible = [item for item in forecasts if item.publish_time <= cutoff]
    return max(eligible, key=lambda item: item.publish_time, default=None)


def hourly_actual(
    actuals: dict[datetime, Actual], start_time: datetime, alignment: str
) -> float | None:
    first = actuals.get(start_time)
    if first is None:
        return None
    if alignment == "hour_start_point":
        return first.mw
    second = actuals.get(start_time.replace(minute=30))
    if second is None:
        return None
    return (first.mw + second.mw) / 2


def evaluate_hour(
    start_time: datetime,
    forecasts: list[Forecast],
    actuals: dict[datetime, Actual],
    cutoff: datetime,
    alignment: str = "hour_mean",
) -> IntervalResult:
    forecast = select_latest_forecast(forecasts, cutoff)
    if forecast is None:
        return IntervalResult(
            start_time, None, None, "excluded", "no_eligible_forecast"
        )

    actual_mw = hourly_actual(actuals, start_time, alignment)
    if actual_mw is None:
        return IntervalResult(start_time, forecast, None, "excluded", "missing_actual")

    return IntervalResult(
        start_time,
        forecast,
        actual_mw,
        "matched",
        error_mw=forecast.mw - actual_mw,
    )


def metrics(results: list[IntervalResult]) -> dict[str, float | int | None]:
    errors = [item.error_mw for item in results if item.status == "matched"]
    if not errors:
        return {"mae": None, "rmse": None, "bias": None, "matched_count": 0}
    return {
        "mae": sum(abs(error) for error in errors) / len(errors),
        "rmse": sqrt(sum(error * error for error in errors) / len(errors)),
        "bias": sum(errors) / len(errors),
        "matched_count": len(errors),
    }
