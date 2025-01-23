from typing import Generator
from fastapi import Depends
from sqlalchemy.orm import Session

from backend.models.database import SessionLocal

def get_db() -> Generator[Session, None, None]:
    """
    Dependency function that yields database sessions.
    Usage: 
        @app.get("/")
        def read_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 