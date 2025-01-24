from typing import Generator
from fastapi import Header, HTTPException, Depends
from sqlalchemy.orm import Session

from backend.db.session import SessionLocal
from backend.crud import account as crud_account

def get_db() -> Generator:
    """Database session dependency"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def validate_account_id(
    account_id: str = Header(...),
    db: Session = Depends(get_db)
) -> str:
    """Validate account_id from header"""
    account = crud_account.get(db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account_id 