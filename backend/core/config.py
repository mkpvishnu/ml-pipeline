from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = "mysql+pymysql://ml_user:your_password@localhost:3306/ml_pipeline"
    
    # Execution service settings
    EXECUTION_SERVICE_URL: str = "http://localhost:8001"
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "ML Pipeline API"
    
    # Security settings
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    class Config:
        env_file = ".env"

settings = Settings() 