from datetime import date

import pytest
from fastapi import HTTPException

from app.api import validate_period


def test_accuracy_window_can_include_prior_delivery_day() -> None:
    validate_period(date(2026, 1, 1), date(2026, 1, 1), allow_prior_day=True)


def test_forecast_window_still_starts_at_configured_evaluation_date() -> None:
    with pytest.raises(HTTPException):
        validate_period(date(2026, 1, 1), date(2026, 1, 1))
