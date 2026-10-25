from dataclasses import dataclass
from datetime import date
import os
from pathlib import Path
from zoneinfo import ZoneInfo


def _load_local_env() -> None:
    path = Path(__file__).resolve().parents[1] / ".env"
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        key, separator, value = line.partition("=")
        if separator and key and not key.startswith("#"):
            os.environ.setdefault(key.strip(), value.strip().strip("\"'"))


_load_local_env()


@dataclass(frozen=True)
class Settings:
    app_env: str = os.getenv("APP_ENV", "development")
    db_url: str | None = os.getenv("DB_URL")
    allowed_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    )
    default_cutoff: str = os.getenv("DEFAULT_CUTOFF", "09:00")
    timezone: str = os.getenv("EVAL_TIMEZONE", "Europe/London")
    evaluation_from: str = os.getenv("EVAL_DECISION_FROM", "2026-01-01")
    evaluation_to: str = os.getenv("EVAL_DECISION_TO", "2026-01-31")


settings = Settings()


def validate_settings() -> None:
    if date.fromisoformat(settings.evaluation_from) > date.fromisoformat(
        settings.evaluation_to
    ):
        raise ValueError("EVAL_DECISION_FROM must be before EVAL_DECISION_TO")
    ZoneInfo(settings.timezone)
    hour, minute = (int(part) for part in settings.default_cutoff.split(":", 1))
    if not 0 <= hour <= 23 or minute not in (0, 30):
        raise ValueError("DEFAULT_CUTOFF must be on a 30-minute boundary")


def require_db_url() -> str:
    if not settings.db_url:
        raise RuntimeError("DB_URL is required; refusing to start without PostgreSQL")
    return settings.db_url
