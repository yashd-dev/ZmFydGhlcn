from datetime import date, timedelta
from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from .config import DEFAULT_CUTOFF, EVALUATION_FROM, EVALUATION_TO, TIMEZONE
from .repository import repository
from .schemas import (
    AccuracyResponse,
    ForecastResponse,
    IntervalResponse,
    PolicyResponse,
)
from .services import (
    delivery_cutoff,
    evaluate_period,
    parse_cutoff,
    period_bounds,
    summarize,
)

router = APIRouter(prefix="/api/v1")


def validate_period(start: date, end: date, *, allow_prior_day: bool = False) -> None:
    configured_start = date.fromisoformat(EVALUATION_FROM)
    configured_end = date.fromisoformat(EVALUATION_TO)
    minimum_start = (
        configured_start - timedelta(days=1) if allow_prior_day else configured_start
    )
    if start > end or start < minimum_start or end > configured_end:
        raise HTTPException(
            status_code=422,
            detail="date range is outside the configured evaluation period",
        )
    if (end - start).days > 31:
        raise HTTPException(
            status_code=422, detail="date range must span 31 days or fewer"
        )


@router.get("/health")
def health() -> dict[str, object]:
    repository.check_connection()
    return {
        "status": "ok",
        "service": "wind-intelligence",
        "database": "postgresql",
    }


@router.get("/accuracy", response_model=AccuracyResponse)
def accuracy(
    start_date: date = Query(...),
    end_date: date = Query(...),
    cutoff: str = Query(DEFAULT_CUTOFF),
    alignment: Literal["hour_mean", "hour_start_point"] = Query("hour_mean"),
) -> AccuracyResponse:
    validate_period(start_date, end_date, allow_prior_day=True)
    try:
        parse_cutoff(cutoff, start_date)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    results = evaluate_period(repository, start_date, end_date, cutoff, alignment)
    metric_values, exclusions = summarize(results)
    return AccuracyResponse(
        period={"start_date": start_date, "end_date": end_date},
        policy=PolicyResponse(
            cutoff=cutoff, timezone=TIMEZONE, alignment=alignment
        ),
        metrics=metric_values,
        excluded_count=sum(exclusions.values()),
        exclusions=exclusions,
        intervals=[
            IntervalResponse(
                start_time=item.start_time,
                publish_time=item.forecast.publish_time if item.forecast else None,
                forecast_mw=item.forecast.mw if item.forecast else None,
                actual_mw=item.actual_mw,
                error_mw=item.error_mw,
                status=item.status,
                reason=item.reason,
            )
            for item in results
        ],
    )


@router.get("/forecasts", response_model=list[ForecastResponse])
def forecasts(
    start_date: date = Query(...),
    end_date: date = Query(...),
    cutoff: str = Query(DEFAULT_CUTOFF),
) -> list[ForecastResponse]:
    validate_period(start_date, end_date)
    try:
        parse_cutoff(cutoff, start_date)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    values = repository.forecasts_between(*period_bounds(start_date, end_date))
    return [
        ForecastResponse(
            start_time=item.start_time,
            publish_time=item.publish_time,
            forecast_mw=item.mw,
            eligible=item.publish_time <= delivery_cutoff(cutoff, item.start_time),
        )
        for items in values.values()
        for item in items
    ]
