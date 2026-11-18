import os
from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

# Automatically locate the .env file in the Backend root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    # Database connection (Supabase PostgreSQL via postgresql+psycopg://)
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/postgres"

    # JWT Authentication settings
    JWT_SECRET: str = "local-marketplace-jwt-secret-key-32-chars-minimum"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    @field_validator("DATABASE_URL", mode="after")
    @classmethod
    def normalize_database_url(cls, v: str) -> str:
        # Automatically use psycopg 3 driver for PostgreSQL
        if v.startswith("postgresql://"):
            v = "postgresql+psycopg://" + v[len("postgresql://"):]
        # Automatically ensure SSL mode for Supabase cloud hosts
        if "supabase.co" in v and "sslmode" not in v:
            delimiter = "&" if "?" in v else "?"
            v = f"{v}{delimiter}sslmode=require"
        return v

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH) if ENV_PATH.exists() else ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()

