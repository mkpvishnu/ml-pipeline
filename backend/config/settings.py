from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # Database settings
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_USER: str = "postgres"
    DB_PASSWORD: str = "postgres"
    DB_NAME: str = "ml_pipeline"
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    DB_POOL_TIMEOUT: int = 30
    DB_ECHO: bool = False  # Set to True for SQL query logging

    # Cache settings
    CACHE_BACKEND: str = "s3"  # s3 or local
    CACHE_S3_BUCKET: Optional[str] = "ml-pipeline-cache"
    CACHE_LOCAL_PATH: Optional[str] = "/tmp/ml-pipeline-cache"
    
    # AWS settings (if using S3 for cache)
    AWS_ACCESS_KEY_ID: Optional[str] = None
    AWS_SECRET_ACCESS_KEY: Optional[str] = None
    AWS_REGION: str = "us-east-1"

    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings() 