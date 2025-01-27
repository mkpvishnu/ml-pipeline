from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated

from backend.api.dependencies import get_db, validate_account_id
from backend.crud import group as crud
from backend.schemas.group import GroupCreate, GroupUpdate, GroupResponse

router = APIRouter()

@router.post("/", response_model=GroupResponse)
async def create_group(
    *,
    db: AsyncSession = Depends(get_db),
    group_in: GroupCreate,
    account_id: Annotated[str, Header()]
):
    """Create new group"""
    return await crud.create(
        db=db,
        obj_in=group_in.model_dump(),
        account_id=account_id
    )

@router.get("/", response_model=List[GroupResponse])
async def list_groups(
    *,
    db: AsyncSession = Depends(get_db),
    account_id: Annotated[str, Header()],
    skip: int = 0,
    limit: int = 100
):
    """List all active groups for an account"""
    return await crud.get_multi_by_account(
        db,
        account_id=account_id,
        skip=skip,
        limit=limit
    )

@router.get("/{group_id}", response_model=GroupResponse)
async def get_group(
    *,
    db: AsyncSession = Depends(get_db),
    group_id: str,
    account_id: Annotated[str, Header()]
):
    """Get specific active group"""
    group = await crud.get_by_account_and_id(
        db,
        account_id=account_id,
        group_id=group_id
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@router.patch("/{group_id}", response_model=GroupResponse)
async def update_group(
    *,
    db: AsyncSession = Depends(get_db),
    group_id: str,
    group_in: GroupUpdate,
    account_id: Annotated[str, Header()]
):
    """Update group"""
    group = await crud.get_by_account_and_id(
        db,
        account_id=account_id,
        group_id=group_id
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    return await crud.update(
        db=db,
        db_obj=group,
        obj_in=group_in.model_dump(exclude_unset=True)
    )

@router.delete("/{group_id}")
async def delete_group(
    *,
    db: AsyncSession = Depends(get_db),
    group_id: str,
    account_id: Annotated[str, Header()]
):
    """Soft delete group"""
    group = await crud.get_by_account_and_id(
        db,
        account_id=account_id,
        group_id=group_id
    )
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    await crud.soft_delete(db=db, db_obj=group)
    return {"status": "success"} 