from pydantic_settings import BaseSettings
from typing import List
import os
import secrets


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "ATEMS"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "False").lower() == "true"

    # Database
    DATABASE_URL: str = "sqlite:///./atems.db"

    # JWT Settings - CRITICAL: Must be set via environment variable in production
    SECRET_KEY: str = "default_dev_secret_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # AI API Keys - All keys MUST be set via environment variables
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    MISTRAL_API_KEY: str = os.getenv("MISTRAL_API_KEY", "")

    # File Upload
    MAX_FILE_SIZE_MB: int = 25
    UPLOAD_DIR: str = "uploads"

    # CORS - Configure via environment for production
    CORS_ORIGINS: List[str] = [
        "http://localhost",
        "http://localhost:3838",
        "http://localhost:5173",
        "http://localhost:3000"
    ]

    # Security Settings
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_PERIOD: int = 60  # seconds

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
