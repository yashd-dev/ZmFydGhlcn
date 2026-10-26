import json
from datetime import date, datetime, time, timedelta, timezone
from typing import Any
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from .config import settings

BMRS_BASE_URL = "https://data.elexon.co.uk/bmrs/api/v1/datasets"


def _fetch(dataset: str, params: dict[str, str]) -> list[dict[str, Any]]:
    url = f"{BMRS_BASE_URL}/{dataset}/stream?{urlencode(params)}"
    request = Request(url, headers={"Accept": "application/json"})
    with urlopen(request, timeout=120) as response:
        payload = json.load(response)
    if not isinstance(payload, list) or not all(
        isinstance(row, dict) for row in payload
    ):
        raise RuntimeError(f"BMRS returned an invalid {dataset} payload")
    return payload


def fetch_seed_data() -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    start = date.fromisoformat(settings.evaluation_from)
    end = date.fromisoformat(settings.evaluation_to)
    actuals = _fetch(
        "FUELHH",
        {
            "settlementDateFrom": (start - timedelta(days=1)).isoformat(),
            "settlementDateTo": (end + timedelta(days=1)).isoformat(),
            "fuelType": "WIND",
        },
    )
    forecasts = _fetch(
        "WINDFOR",
        {
            "publishDateTimeFrom": datetime.combine(
                start - timedelta(days=3), datetime.min.time(), timezone.utc
            )
            .isoformat()
            .replace("+00:00", "Z"),
            "publishDateTimeTo": datetime.combine(
                end + timedelta(days=1), time(23, 59, 59), timezone.utc
            )
            .isoformat()
            .replace("+00:00", "Z"),
        },
    )
    return actuals, forecasts
