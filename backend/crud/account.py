from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.account import Account


async def create(
    db: AsyncSession,
    *,
    obj_in: Dict[str, Any]
) -> Account:
    """Create new account"""
    db_obj = Account(**obj_in)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get(
    db: AsyncSession,
    *,
    id: str
) -> Optional[Account]:
    """Get account by ID"""
    result = await db.execute(select(Account).filter(Account.id == id))
    return result.scalar_one_or_none()

async def get_by_email(
    db: AsyncSession,
    *,
    email: str
) -> Optional[Account]:
    """Get account by email"""
    result = await db.execute(select(Account).filter(Account.email == email))
    return result.scalar_one_or_none()

async def get_multi(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 100
) -> List[Account]:
    """Get multiple accounts"""
    result = await db.execute(select(Account).offset(skip).limit(limit))
    return result.scalars().all()

async def get_multi_by_type(
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

async def update(
    db: AsyncSession,
    *,
    db_obj: Account,
    obj_in: Dict[str, Any]
) -> Account:
    """Update account"""
    for field, value in obj_in.items():
        setattr(db_obj, field, value)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete(
    db: AsyncSession,
    *,
    db_obj: Account
) -> Account:
    """Delete account"""
    await db.delete(db_obj)
    await db.commit()
    return db_obj 