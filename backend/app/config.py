"""Application configuration loaded from environment variables (.env)."""

from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Typed app settings. Values come from environment / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # App
    app_name: str = "HIMMAT"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = True

    # CORS
    allowed_origins: str = "http://localhost:3000"

    # Database
    database_url: str = ""

    # Supabase
    supabase_url: str = ""
    supabase_jwt_secret: str = ""

    # AI layer
    ai_provider: str = "none"  # groq | none
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-20b"
    gemini_api_key: str = ""
    openai_api_key: str = ""

    # Observability
    sentry_dsn: str = ""

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def _strip(cls, v: object) -> object:
        return v.strip() if isinstance(v, str) else v

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse the comma-separated ALLOWED_ORIGINS into a list."""
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Cached singleton access to settings."""
    return Settings()
