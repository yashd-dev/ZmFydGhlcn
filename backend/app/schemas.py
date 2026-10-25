from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    code: str
    message: str


class ForecastResponse(BaseModel):
    start_time: datetime
    publish_time: datetime
    forecast_mw: float
    eligible: bool


class IntervalResponse(BaseModel):
    start_time: datetime
    publish_time: datetime | None = None
    forecast_mw: float | None = None
    actual_mw: float | None = None
    error_mw: float | None = None
    status: str
    reason: str | None = None


class PolicyResponse(BaseModel):
    cutoff: str
    timezone: str
    alignment: Literal["hour_mean", "hour_start_point"]
    unit: str = "MW"


class AccuracyResponse(BaseModel):
    period: dict[str, date]
    policy: PolicyResponse
    metrics: dict[str, float | int | None]
    excluded_count: int
    exclusions: dict[str, int]
    intervals: list[IntervalResponse] = Field(default_factory=list)
