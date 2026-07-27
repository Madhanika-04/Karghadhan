"""
app/config.py
Centralised settings loaded from environment variables / .env file.
Uses Pydantic v2 BaseSettings for strict type-checking and validation.
"""
from functools import lru_cache
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ------------------------------------------------------------------
    # Supabase
    # ------------------------------------------------------------------
    SUPABASE_URL: str
    SUPABASE_KEY: str                       # anon / public key
    SUPABASE_SERVICE_ROLE_KEY: str          # service-role secret (bypasses RLS)
    DATABASE_URL: str = ""                  # PostgreSQL connection string


    # ------------------------------------------------------------------
    # AI / LLM
    # ------------------------------------------------------------------
    GEMINI_API_KEY: str
    OPENAI_API_KEY: str = ""                # optional fallback

    # ------------------------------------------------------------------
    # Application
    # ------------------------------------------------------------------
    APP_ENV: str = "development"
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    LOG_LEVEL: str = "INFO"

    @field_validator("APP_ENV")
    @classmethod
    def validate_env(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v not in allowed:
            raise ValueError(f"APP_ENV must be one of {allowed}")
        return v


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()  # type: ignore[call-arg]
