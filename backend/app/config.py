from dataclasses import dataclass
import os
from pathlib import Path

DEFAULT_CUTOFF = "09:00"
TIMEZONE = "Europe/London"
EVALUATION_FROM = "2026-01-02"
EVALUATION_TO = "2026-02-01"


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
    db_url: str | None = os.getenv("DB_URL")
    allowed_origins: tuple[str, ...] = tuple(
        origin.strip()
        for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
        if origin.strip()
    )


settings = Settings()


def require_db_url() -> str:
    if not settings.db_url:
        raise RuntimeError("DB_URL is required; refusing to start without PostgreSQL")
    return settings.db_url
