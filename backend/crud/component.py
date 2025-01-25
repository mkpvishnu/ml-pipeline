from typing import List, Optional, Dict, Any, Union
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.component import Component
from backend.schemas.component import ComponentCreate, ComponentUpdate


async def create(
    db: AsyncSession,
    *,
    obj_in: ComponentCreate,
    account_id: str
) -> Component:
    """Create new component with account_id"""
    obj_in_data = obj_in.model_dump()
    db_obj = Component(**obj_in_data, account_id=account_id)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get(
    db: AsyncSession,
    *,
    id: str
) -> Optional[Component]:
    """Get component by ID"""
    result = await db.execute(select(Component).filter(Component.id == id))
    return result.scalar_one_or_none()

async def get_multi(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 100
) -> List[Component]:
    """Get multiple components"""
    result = await db.execute(select(Component).offset(skip).limit(limit))
    return result.scalars().all()

async def get_multi_by_account(
    db: AsyncSession,
    *,
    account_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Component]:
    """Get components by account ID"""
    result = await db.execute(
        select(Component)
        .filter(Component.account_id == account_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_multi_by_group(
    db: AsyncSession,
    *,
    group_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Component]:
    """Get components by group ID"""
    result = await db.execute(
        select(Component)
        .filter(Component.group_id == group_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_by_account_and_id(
    db: AsyncSession,
    *,
    account_id: str,
    component_id: str
) -> Optional[Component]:
    """Get component by account ID and component ID"""
    result = await db.execute(
        select(Component)
        .filter(Component.account_id == account_id, Component.id == component_id)
    )
    return result.scalar_one_or_none()

async def update(
    db: AsyncSession,
    *,
    db_obj: Component,
    obj_in: Union[ComponentUpdate, Dict[str, Any]]
) -> Component:
    """Update component"""
    if isinstance(obj_in, dict):
        update_data = obj_in
    else:
        update_data = obj_in.model_dump(exclude_unset=True)
    
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete(
    db: AsyncSession,
    *,
    id: str
) -> Optional[Component]:
    """Delete component"""
    if component := await get(db, id=id):
        await db.delete(component)
        await db.commit()
        return component
    return None 