from datetime import date, datetime, time, timezone
from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from .config import settings
from .repository import repository
from .schemas import (
    AccuracyResponse,
    ForecastResponse,
    IntervalResponse,
    PolicyResponse,
)
from .services import evaluate_period, parse_cutoff, summarize

router = APIRouter(prefix="/api/v1")


def validate_period(start: date, end: date) -> None:
    configured_start = date.fromisoformat(settings.evaluation_from)
    configured_end = date.fromisoformat(settings.evaluation_to)
    if start > end or start < configured_start or end > configured_end:
        raise HTTPException(
            status_code=422,
            detail="date range is outside the configured evaluation period",
        )
    if (end - start).days >= 31:
        raise HTTPException(
            status_code=422, detail="date range must be shorter than 31 days"
        )


@router.get("/health")
def health() -> dict[str, object]:
    actual_count, forecast_count = repository.counts()
    return {
        "status": "ok",
        "service": "wind-intelligence",
        "database": "postgresql",
        "actual_count": actual_count,
        "forecast_count": forecast_count,
    }


@router.get("/accuracy", response_model=AccuracyResponse)
def accuracy(
    start_date: date = Query(...),
    end_date: date = Query(...),
    cutoff: str = Query(settings.default_cutoff),
    alignment: Literal["hour_mean", "hour_start_point"] = Query("hour_mean"),
) -> AccuracyResponse:
    validate_period(start_date, end_date)
    try:
        parse_cutoff(cutoff, start_date)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    results = evaluate_period(repository, start_date, end_date, cutoff, alignment)
    metric_values, exclusions = summarize(results)
    return AccuracyResponse(
        period={"start_date": start_date, "end_date": end_date},
        policy=PolicyResponse(
            cutoff=cutoff, timezone=settings.timezone, alignment=alignment
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
    cutoff: str = Query(settings.default_cutoff),
) -> list[ForecastResponse]:
    validate_period(start_date, end_date)
    try:
        cutoff_time = parse_cutoff(cutoff, start_date)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
    values = repository.forecasts_between(
        datetime.combine(start_date, time.min, timezone.utc),
        datetime.combine(end_date, time.min, timezone.utc),
    )
    return [
        ForecastResponse(
            start_time=item.start_time,
            publish_time=item.publish_time,
            forecast_mw=item.mw,
            eligible=item.publish_time <= cutoff_time,
        )
        for items in values.values()
        for item in items
    ]
