from contextlib import contextmanager
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from backend.config.settings import get_settings

settings = get_settings()

# Create MySQL database URL using PyMySQL
DATABASE_URL = f"mysql+pymysql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"

# Create engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_pre_ping=True,  # Enable connection health checks
    echo=settings.DB_ECHO,
    # MySQL specific settings
    pool_recycle=3600,  # Recycle connections after 1 hour
    connect_args={
        'charset': 'utf8mb4',
        'connect_timeout': 60,
        'ssl': {
            'ssl_disabled': True  # Disable SSL for local development
        }
    }
)

# Create sessionmaker
SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

@contextmanager
def get_db() -> Generator[Session, None, None]:
    """Get database session with automatic closing."""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def get_db_session() -> Session:
    """Get a new database session."""
    return SessionLocal()