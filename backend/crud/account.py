from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.crud.base import CRUDBase
from backend.models.account import Account
from backend.schemas.account import AccountCreate, AccountUpdate


class CRUDAccount(CRUDBase[Account, AccountCreate, AccountUpdate]):
    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[Account]:
        """Get an account by email"""
        result = await db.execute(select(Account).filter(Account.email == email))
        return result.scalar_one_or_none()

    async def get_multi_by_type(
        self,
        db: AsyncSession,
        *,
        account_type: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[Account]:
        """Get accounts by type"""
        result = await db.execute(
            select(Account)
            .filter(Account.account_type == account_type)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()


account = CRUDAccount(Account)

async def get_account_by_id(db: AsyncSession, account_id: str) -> Optional[Account]:
    """Get account by ID"""
    result = await db.execute(select(Account).filter(Account.id == account_id))
    return result.scalar_one_or_none()

async def get_accounts(
    db: AsyncSession,
    skip: int = 0,
    limit: int = 100
) -> List[Account]:
    """Get multiple accounts"""
    result = await db.execute(select(Account).offset(skip).limit(limit))
    return result.scalars().all()

async def create_account(
    db: AsyncSession,
    account_in: AccountCreate
) -> Account:
    """Create new account"""
    account = Account(**account_in.model_dump())
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account

async def update_account(
    db: AsyncSession,
    db_obj: Account,
    obj_in: AccountUpdate
) -> Account:
    """Update account"""
    update_data = obj_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete_account(db: AsyncSession, account_id: str) -> bool:
    """Delete account"""
    account = await get_account_by_id(db, account_id)
    if account:
        await db.delete(account)
        await db.commit()
        return True
    return False 