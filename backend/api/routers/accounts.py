from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.api.dependencies import get_db
from backend.models.database import Account
from backend.schemas.account import AccountCreate, AccountUpdate, AccountResponse
from backend.crud.account import AccountCRUD

router = APIRouter()

@router.post("/", response_model=AccountResponse)
def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    """Create a new account"""
    db_account = AccountCRUD.get_by_email(db, email=account.email)
    if db_account:
        raise HTTPException(status_code=400, detail="Email already registered")
    return AccountCRUD.create(db=db, obj_in=account)

@router.get("/", response_model=List[AccountResponse])
def list_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all accounts"""
    accounts = AccountCRUD.get_multi(db, skip=skip, limit=limit)
    return accounts

@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    """Get a specific account by ID"""
    db_account = AccountCRUD.get(db, id=account_id)
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return db_account

@router.put("/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, account: AccountUpdate, db: Session = Depends(get_db)):
    """Update an account"""
    db_account = AccountCRUD.get(db, id=account_id)
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    return AccountCRUD.update(db=db, db_obj=db_account, obj_in=account)

@router.delete("/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    """Delete an account"""
    db_account = AccountCRUD.get(db, id=account_id)
    if db_account is None:
        raise HTTPException(status_code=404, detail="Account not found")
    AccountCRUD.delete(db=db, id=account_id)
    return {"status": "success"} 