from typing import List, Optional, Dict, Any, Union
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.group import Group
from backend.schemas.group import GroupCreate, GroupUpdate


async def create(
    db: AsyncSession,
    *,
    obj_in: GroupCreate,
    account_id: str
) -> Group:
    """Create new group with account_id"""
    obj_in_data = obj_in.model_dump()
    db_obj = Group(**obj_in_data, account_id=account_id)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get(
    db: AsyncSession,
    *,
    id: str
) -> Optional[Group]:
    """Get group by ID"""
    result = await db.execute(select(Group).filter(Group.id == id))
    return result.scalar_one_or_none()

async def get_multi(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 100
) -> List[Group]:
    """Get multiple groups"""
    result = await db.execute(select(Group).offset(skip).limit(limit))
    return result.scalars().all()

async def get_multi_by_account(
    db: AsyncSession,
    *,
    account_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Group]:
    """Get groups by account ID"""
    result = await db.execute(
        select(Group)
        .filter(Group.account_id == account_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_by_account_and_id(
    db: AsyncSession,
    *,
    account_id: str,
    group_id: str
) -> Optional[Group]:
    """Get group by account ID and group ID"""
    result = await db.execute(
        select(Group)
        .filter(Group.account_id == account_id, Group.id == group_id)
    )
    return result.scalar_one_or_none()

async def update(
    db: AsyncSession,
    *,
    db_obj: Group,
    obj_in: Union[GroupUpdate, Dict[str, Any]]
) -> Group:
    """Update group"""
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
) -> Optional[Group]:
    """Delete group"""
    if group := await get(db, id=id):
        await db.delete(group)
        await db.commit()
        return group
    return None 