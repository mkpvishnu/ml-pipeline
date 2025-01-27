from typing import List, Optional, Dict, Any, Union
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from backend.models.canvas import Canvas
from backend.schemas.canvas import CanvasCreate, CanvasUpdate


async def create(
    db: AsyncSession,
    *,
    obj_in: Dict[str, Any],
    account_id: str
) -> Canvas:
    """Create new canvas"""
    db_obj = Canvas(
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
) -> Optional[Canvas]:
    """Get canvas by ID"""
    result = await db.execute(
        select(Canvas)
        .filter(Canvas.id == id, Canvas.status == 1)
    )
    return result.scalar_one_or_none()

async def get_multi(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 100
) -> List[Canvas]:
    """Get multiple canvases"""
    result = await db.execute(
        select(Canvas)
        .filter(Canvas.status == 1)
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
) -> List[Canvas]:
    """Get canvases by account ID"""
    result = await db.execute(
        select(Canvas)
        .filter(Canvas.account_id == account_id, Canvas.status == 1)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_by_account_and_id(
    db: AsyncSession,
    *,
    account_id: str,
    canvas_id: str
) -> Optional[Canvas]:
    """Get canvas by account ID and canvas ID"""
    result = await db.execute(
        select(Canvas)
        .filter(
            Canvas.account_id == account_id,
            Canvas.id == canvas_id,
            Canvas.status == 1
        )
    )
    return result.scalar_one_or_none()

async def update(
    db: AsyncSession,
    *,
    db_obj: Canvas,
    obj_in: Dict[str, Any]
) -> Canvas:
    """Update canvas"""
    for field, value in obj_in.items():
        if field == "status" and value == 0:
            setattr(db_obj, "deleted_at", datetime.utcnow())
        setattr(db_obj, field, value)
    
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def update_module_config(
    db: AsyncSession,
    *,
    db_obj: Canvas,
    module_config: Dict
) -> Canvas:
    """Update canvas module configuration"""
    db_obj.module_config = module_config
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def soft_delete(
    db: AsyncSession,
    *,
    db_obj: Canvas
) -> Canvas:
    """Soft delete canvas"""
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
) -> Optional[Canvas]:
    """Delete canvas"""
    if canvas := await get(db, id=id):
        await db.delete(canvas)
        await db.commit()
        return canvas
    return None 