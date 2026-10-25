from collections import Counter
from datetime import date, datetime, time, timedelta
from zoneinfo import ZoneInfo

from .config import settings
from .domain import IntervalResult, evaluate_hour, metrics
from .repository import Repository


def parse_cutoff(value: str, decision_date: date) -> datetime:
    try:
        hour, minute = (int(part) for part in value.split(":", 1))
    except (ValueError, TypeError) as exc:
        raise ValueError("cutoff must use HH:MM") from exc
    if not 0 <= hour <= 23 or minute not in (0, 30):
        raise ValueError("cutoff must be on a 30-minute boundary")
    return datetime.combine(
        decision_date, time(hour, minute), ZoneInfo(settings.timezone)
    ).astimezone(ZoneInfo("UTC"))


def hourly_targets(start: date, end: date) -> list[datetime]:
    current = datetime.combine(start + timedelta(days=1), time.min, ZoneInfo("UTC"))
    finish = datetime.combine(end + timedelta(days=1), time.min, ZoneInfo("UTC"))
    targets: list[datetime] = []
    while current < finish:
        targets.append(current)
        current += timedelta(hours=1)
    return targets


def evaluate_period(
    repository: Repository,
    start: date,
    end: date,
    cutoff: str,
    alignment: str,
) -> list[IntervalResult]:
    targets = hourly_targets(start, end)
    if not targets:
        return []
    actuals = repository.actuals_between(targets[0], targets[-1] + timedelta(hours=1))
    forecasts = repository.forecasts_between(
        targets[0], targets[-1] + timedelta(hours=1)
    )
    return [
        evaluate_hour(
            target,
            forecasts.get(target, []),
            actuals,
            parse_cutoff(cutoff, target.date() - timedelta(days=1)),
            alignment,
        )
        for target in targets
    ]


def summarize(
    results: list[IntervalResult],
) -> tuple[dict[str, float | int | None], dict[str, int]]:
    exclusions = Counter(item.reason for item in results if item.status == "excluded")
    return metrics(results), {key: value for key, value in exclusions.items() if key}
