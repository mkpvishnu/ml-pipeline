from typing import List, Optional, Dict, Any, Union
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from backend.models.run import Run
from backend.schemas.run import RunCreate, RunUpdate, RunStatus


async def create(
    db: AsyncSession,
    *,
    canvas_id: str,
    account_id: str
) -> Run:
    """Create new run with account_id and canvas_id"""
    db_obj = Run(
        account_id=account_id,
        canvas_id=canvas_id,
        status=RunStatus.PENDING,
        started_at=datetime.utcnow()
    )
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def get(
    db: AsyncSession,
    *,
    id: str
) -> Optional[Run]:
    """Get run by ID"""
    result = await db.execute(select(Run).filter(Run.id == id))
    return result.scalar_one_or_none()

async def get_multi(
    db: AsyncSession,
    *,
    skip: int = 0,
    limit: int = 100
) -> List[Run]:
    """Get multiple runs"""
    result = await db.execute(select(Run).offset(skip).limit(limit))
    return result.scalars().all()

async def get_multi_by_account(
    db: AsyncSession,
    *,
    account_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Run]:
    """Get runs by account ID"""
    result = await db.execute(
        select(Run)
        .filter(Run.account_id == account_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_multi_by_canvas(
    db: AsyncSession,
    *,
    canvas_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Run]:
    """Get runs by canvas ID"""
    result = await db.execute(
        select(Run)
        .filter(Run.canvas_id == canvas_id)
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_by_account_and_id(
    db: AsyncSession,
    *,
    account_id: str,
    run_id: str
) -> Optional[Run]:
    """Get run by account ID and run ID"""
    result = await db.execute(
        select(Run)
        .filter(Run.account_id == account_id, Run.id == run_id)
    )
    return result.scalar_one_or_none()

async def update(
    db: AsyncSession,
    *,
    db_obj: Run,
    obj_in: Union[RunUpdate, Dict[str, Any]]
) -> Run:
    """Update run"""
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

async def update_status(
    db: AsyncSession,
    *,
    run_id: str,
    status: RunStatus,
    results: Optional[Dict] = None,
    error: Optional[Dict] = None
) -> Optional[Run]:
    """Update run status with optional results or error"""
    if run := await get(db, id=run_id):
        run.status = status
        if results is not None:
            run.results = results
        if error is not None:
            run.error = error
        if status in [RunStatus.COMPLETED, RunStatus.FAILED, RunStatus.CANCELLED]:
            run.completed_at = datetime.utcnow()
        
        db.add(run)
        await db.commit()
        await db.refresh(run)
        return run
    return None

async def delete(
    db: AsyncSession,
    *,
    id: str
) -> Optional[Run]:
    """Delete run"""
    if run := await get(db, id=id):
        await db.delete(run)
        await db.commit()
        return run
    return None 