from typing import List, Optional, Dict, Any, Union
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.module import Module
from backend.schemas.module import ModuleCreate, ModuleUpdate


async def create(
    db: AsyncSession,
    *,
    obj_in: ModuleCreate,
    account_id: str,
    component_id: str
) -> Module:
    """Create new module with account_id and component_id"""
    obj_in_data = obj_in.model_dump()
    db_obj = Module(**obj_in_data, account_id=account_id, component_id=component_id)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get(
    db: AsyncSession,
    *,
    id: str
) -> Optional[Module]:
    """Get module by ID"""
    result = await db.execute(select(Module).filter(Module.id == id))
    return result.scalar_one_or_none()

async def get_multi(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 100
) -> List[Module]:
    """Get multiple modules"""
    result = await db.execute(select(Module).offset(skip).limit(limit))
    return result.scalars().all()

async def get_multi_by_account(
    db: AsyncSession,
    *,
    account_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Module]:
    """Get modules by account ID"""
    result = await db.execute(
        select(Module)
        .filter(Module.account_id == account_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_multi_by_component(
    db: AsyncSession,
    *,
    component_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Module]:
    """Get modules by component ID"""
    result = await db.execute(
        select(Module)
        .filter(Module.component_id == component_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_by_account_and_id(
    db: AsyncSession,
    *,
    account_id: str,
    module_id: str
) -> Optional[Module]:
    """Get module by account ID and module ID"""
    result = await db.execute(
        select(Module)
        .filter(Module.account_id == account_id, Module.id == module_id)
    )
    return result.scalar_one_or_none()

async def update(
    db: AsyncSession,
    *,
    db_obj: Module,
    obj_in: Union[ModuleUpdate, Dict[str, Any]]
) -> Module:
    """Update module"""
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
) -> Optional[Module]:
    """Delete module"""
    if module := await get(db, id=id):
        await db.delete(module)
        await db.commit()
        return module
    return None 