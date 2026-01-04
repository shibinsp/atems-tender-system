from pydantic_settings import BaseSettings
from typing import List, Optional
import os
import secrets
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "ATEMS"
    APP_VERSION: str = "1.1.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    # Database - Supports both PostgreSQL and SQLite
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "postgresql://atems:atems_secure_pwd@db:5432/atems"
    )

    # JWT Settings - CRITICAL: Must be set via environment variable in production
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "7"))

    # AI API Keys
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")

    # File Upload
    MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "25"))
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3838",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://185.215.166.90:3838",
    ]

    # Security Settings
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60

    # Email Settings (optional)
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASSWORD: Optional[str] = os.getenv("SMTP_PASSWORD")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM", "noreply@atems.gov")

    class Config:
        env_file = ".env"
        extra = "ignore"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Generate secure secret key if not provided
        if not self.SECRET_KEY:
            self.SECRET_KEY = secrets.token_urlsafe(64)
            logger.warning("SECRET_KEY not set! Generated temporary key. Set SECRET_KEY env var for production.")


settings = Settings()
