from typing import AsyncGenerator
from fastapi import Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_async_session
from backend.crud.account import get_account_by_id

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database sessions"""
    async for session in get_async_session():
        yield session

async def validate_account_id(
    account_id: str,
    db: AsyncSession = Depends(get_db)
) -> str:
    """Validate account_id from header"""
    account = await get_account_by_id(db, account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    return account_id