from typing import List, Optional, Dict, Any
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from backend.models.run import Run
from backend.models.canvas import Canvas
from backend.models.module import Module
from backend.schemas.run import RunStatus

async def create(
    db: AsyncSession,
    *,
    account_id: str,
    canvas_id: Optional[str] = None,
    module_id: Optional[str] = None,
    workflow_id: Optional[str] = None,
    status: Optional[str] = RunStatus.REQUESTED
) -> Run:
    """Create new run"""
    if canvas_id and module_id:
        raise ValueError("Cannot specify both canvas_id and module_id")
    if not canvas_id and not module_id:
        raise ValueError("Must specify either canvas_id or module_id")

    # Validate canvas/module exists
    if canvas_id:
        canvas = await db.execute(
            select(Canvas)
            .filter(Canvas.id == canvas_id, Canvas.status == 1)
        )
        if not canvas.scalar_one_or_none():
            raise ValueError("Canvas not found or deleted")
    
    if module_id:
        module = await db.execute(
            select(Module).filter(Module.id == module_id)
        )
        if not module.scalar_one_or_none():
            raise ValueError("Module not found")

    db_obj = Run(
        account_id=account_id,
        canvas_id=canvas_id,
        module_id=module_id,
        workflow_id=workflow_id,
        status=status,
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

async def get_multi_by_module(
    db: AsyncSession,
    *,
    module_id: str,
    skip: int = 0,
    limit: int = 100
) -> List[Run]:
    """Get runs by module ID"""
    result = await db.execute(
        select(Run)
        .filter(Run.module_id == module_id)
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

async def update_status(
    db: AsyncSession,
    *,
    db_obj: Run,
    status: RunStatus,
    results: Optional[Dict] = None,
    error: Optional[Dict] = None
) -> Run:
    """Update run status with optional results or error"""
    db_obj.status = status
    if results is not None:
        db_obj.results = results
    if error is not None:
        db_obj.error = error
    if status in [RunStatus.COMPLETED, RunStatus.ERROR]:
        db_obj.completed_at = datetime.utcnow()
    
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def delete(
    db: AsyncSession,
    *,
    db_obj: Run
) -> Run:
    """Delete run"""
    await db.delete(db_obj)
    await db.commit()
    return db_obj 