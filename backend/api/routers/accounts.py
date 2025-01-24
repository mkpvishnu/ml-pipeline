from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from backend.api.dependencies import get_db
from backend.crud import account as crud_account
from backend.schemas import account as schemas

router = APIRouter(prefix="/accounts", tags=["accounts"])

@router.post("/", response_model=schemas.AccountResponse)
def create_account(
    *,
    db: Session = Depends(get_db),
    account_in: schemas.AccountCreate
):
    """Create new account"""
    db_account = crud_account.get_by_email(db, email=account_in.email)
    if db_account:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud_account.create(db=db, obj_in=account_in)

@router.get("/", response_model=List[schemas.AccountResponse])
def list_accounts(
    *,
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List all accounts"""
    return crud_account.get_multi(db, skip=skip, limit=limit)

@router.get("/{account_id}", response_model=schemas.AccountResponse)
def get_account(
    *,
    db: Session = Depends(get_db),
    account_id: str
):
    """Get specific account"""
    account = crud_account.get(db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/{account_id}", response_model=schemas.AccountResponse)
def update_account(
    *,
    db: Session = Depends(get_db),
    account_id: str,
    account_in: schemas.AccountUpdate
):
    """Update account"""
    account = crud_account.get(db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return crud_account.update(db=db, db_obj=account, obj_in=account_in)

@router.delete("/{account_id}")
def delete_account(
    *,
    db: Session = Depends(get_db),
    account_id: str
):
    """Delete account"""
    account = crud_account.get(db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    crud_account.remove(db=db, id=account_id)
    return {"status": "success"} 