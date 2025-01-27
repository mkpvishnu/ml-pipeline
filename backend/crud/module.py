from typing import List, Optional, Dict, Any, Union
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.models.module import Module
from backend.models.group import Group
from backend.schemas.module import ModuleCreate, ModuleUpdate


async def create(
    db: AsyncSession,
    *,
    obj_in: Dict[str, Any],
    account_id: str,
    group_id: str
) -> Module:
    """Create new module"""
    # Validate group exists and is active
    group = await db.execute(
        select(Group)
        .filter(Group.id == group_id, Group.status == 1)
    )
    if not group.scalar_one_or_none():
        raise ValueError("Group not found or inactive")

    # If parent_module_id is provided, validate it exists and set scope
    if parent_module_id := obj_in.get('parent_module_id'):
        parent = await db.execute(
            select(Module).filter(Module.id == parent_module_id)
        )
        if not parent.scalar_one_or_none():
            raise ValueError("Parent module not found")
        obj_in['scope'] = 'account'  # Force account scope for child modules

    db_obj = Module(
        **obj_in,
        account_id=account_id,
        group_id=group_id
    )
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

async def get_multi_by_group(
    db: AsyncSession,
    *,
    group_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Module]:
    """Get modules by group ID"""
    result = await db.execute(
        select(Module)
        .filter(Module.group_id == group_id)
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
    obj_in: Dict[str, Any]
) -> Module:
    """Update module"""
    # Prevent scope change to global for modules with parent
    if (
        obj_in.get('scope') == 'global' 
        and db_obj.parent_module_id is not None
    ):
        raise ValueError("Cannot change scope to global for child modules")

    for field, value in obj_in.items():
        setattr(db_obj, field, value)
    
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def update_code(
    db: AsyncSession,
    *,
    db_obj: Module,
    code: str
) -> Module:
    """Update module code"""
    db_obj.code = code
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def update_config_schema(
    db: AsyncSession,
    *,
    db_obj: Module,
    config_schema: Dict
) -> Module:
    """Update module config schema"""
    db_obj.config_schema = config_schema
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def update_user_config(
    db: AsyncSession,
    *,
    db_obj: Module,
    user_config: Dict
) -> Module:
    """Update module user config"""
    db_obj.user_config = user_config
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete(
    db: AsyncSession,
    *,
    db_obj: Module
) -> Module:
    """Delete module"""
    if db_obj.scope == 'global':
        raise ValueError("Cannot delete global scope modules")
    
    await db.delete(db_obj)
    await db.commit()
    return db_obj 