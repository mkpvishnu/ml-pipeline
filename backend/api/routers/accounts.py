from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated

from backend.api.dependencies import get_db
from backend.crud import account as crud_account
from backend.schemas.account import AccountCreate, AccountUpdate, AccountResponse

router = APIRouter()

@router.post("/", response_model=AccountResponse)
async def create_account(
    *,
    db: AsyncSession = Depends(get_db),
    account_in: AccountCreate
):
    """Create new account"""
    # Check if email already exists
    existing_account = await crud_account.get_by_email(db, email=account_in.email)
    if existing_account:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    return await crud_account.create(db=db, obj_in=account_in.model_dump())

@router.get("/", response_model=List[AccountResponse])
async def list_accounts(
    *,
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 100
):
    """List all accounts"""
    return await crud_account.get_multi(db=db, skip=skip, limit=limit)

@router.get("/{account_id}", response_model=AccountResponse)
async def get_account(
    *,
    db: AsyncSession = Depends(get_db),
    account_id: str
):
    """Get specific account"""
    account = await crud_account.get(db=db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.patch("/{account_id}", response_model=AccountResponse)
async def update_account(
    *,
    db: AsyncSession = Depends(get_db),
    account_id: str,
    account_in: AccountUpdate
):
    """Update account"""
    account = await crud_account.get(db=db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return await crud_account.update(
        db=db,
        db_obj=account,
        obj_in=account_in.model_dump(exclude_unset=True)
    )

@router.delete("/{account_id}")
async def delete_account(
    *,
    db: AsyncSession = Depends(get_db),
    account_id: str
):
    """Delete account"""
    account = await crud_account.get(db=db, id=account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    await crud_account.delete(db=db, db_obj=account)
    return {"status": "success"} 