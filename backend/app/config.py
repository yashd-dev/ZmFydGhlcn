from dataclasses import dataclass
import os


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


def require_db_url() -> str:
    if not settings.db_url:
        raise RuntimeError("DB_URL is required; refusing to start without PostgreSQL")
    return settings.db_url
