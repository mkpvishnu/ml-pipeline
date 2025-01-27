from typing import AsyncGenerator, Annotated
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import get_async_session
from backend.crud import account as crud_account
from backend.crud import group as crud_group
from backend.crud import module as crud_module
from backend.crud import canvas as crud_canvas

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database sessions"""
    async for session in get_async_session():
        yield session

async def validate_account_id(
    account_id: Annotated[str, Header()],
    db: AsyncSession = Depends(get_db)
) -> str:
    """Validate account_id exists"""
    account = await crud_account.get(db, id=account_id)
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    return account_id

async def validate_group(
    group_id: Annotated[str, Header()],
    account_id: Annotated[str, Header()],
    db: AsyncSession = Depends(get_db)
) -> str:
    """Validate group exists and belongs to account"""
    group = await crud_group.get_by_account_and_id(
        db,
        account_id=account_id,
        group_id=group_id
    )
    if not group:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Group not found"
        )
    if group.status == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Group is deleted"
        )
    return group_id

async def validate_module(
    module_id: Annotated[str, Header()],
    account_id: Annotated[str, Header()],
    db: AsyncSession = Depends(get_db)
) -> str:
    """Validate module exists and belongs to account"""
    module = await crud_module.get_by_account_and_id(
        db,
        account_id=account_id,
        module_id=module_id
    )
    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found"
        )
    return module_id

async def validate_canvas(
    canvas_id: Annotated[str, Header(alias="Canvas-ID")],
    account_id: Annotated[str, Header()],
    db: AsyncSession = Depends(get_db)
) -> str:
    """Validate canvas exists and belongs to account"""
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    if not canvas:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Canvas not found"
        )
    if canvas.status == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Canvas is deleted"
        )
    return canvas_id