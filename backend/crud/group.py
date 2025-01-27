from typing import List, Optional, Dict, Any, Union
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from backend.models.group import Group
from backend.schemas.group import GroupCreate, GroupUpdate


async def create(
    db: AsyncSession,
    *,
    obj_in: Dict[str, Any],
    account_id: str
) -> Group:
    """Create new group"""
    db_obj = Group(
        **obj_in,
        account_id=account_id,
        status=1
    )
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
    result = await db.execute(
        select(Group)
        .filter(Group.id == id, Group.status == 1)
    )
    return result.scalar_one_or_none()

async def get_multi(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 100
) -> List[Group]:
    """Get multiple groups"""
    result = await db.execute(
        select(Group)
        .filter(Group.status == 1)
        .offset(skip)
        .limit(limit)
    )
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
        .filter(Group.account_id == account_id, Group.status == 1)
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
        .filter(
            Group.account_id == account_id,
            Group.id == group_id,
            Group.status == 1
        )
    )
    return result.scalar_one_or_none()

async def update(
    db: AsyncSession,
    *,
    db_obj: Group,
    obj_in: Dict[str, Any]
) -> Group:
    """Update group"""
    for field, value in obj_in.items():
        if field == "status" and value == 0:
            setattr(db_obj, "deleted_at", datetime.utcnow())
        setattr(db_obj, field, value)
    
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def soft_delete(
    db: AsyncSession,
    *,
    db_obj: Group
) -> Group:
    """Soft delete group"""
    db_obj.status = 0
    db_obj.deleted_at = datetime.utcnow()
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