from fastapi import APIRouter, Depends, Header, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated
import httpx
import asyncio
from datetime import datetime, timedelta

from backend.api.dependencies import get_db, validate_account_id
from backend.crud import run as crud_run
from backend.crud import canvas as crud_canvas
from backend.schemas import run as schemas
from backend.schemas.run import RunCreate, RunUpdate, RunResponse, RunStatus
from backend.core.config import get_settings

settings = get_settings()

router = APIRouter(tags=["runs"])

@router.post("/", response_model=RunResponse)
async def create_run(
    *,
    db: AsyncSession = Depends(get_db),
    run_in: RunCreate,
    account_id: Annotated[str, Header()]
):
    """Create new run"""
    return await crud_run.create(
        db=db,
        canvas_id=run_in.canvas_id,
        account_id=account_id
    )

@router.get("/", response_model=List[RunResponse])
async def list_runs(
    *,
    db: AsyncSession = Depends(get_db),
    account_id: Annotated[str, Header()],
    canvas_id: str = None,
    skip: int = 0,
    limit: int = 100
):
    """List runs with optional canvas filter"""
    if canvas_id:
        # Validate canvas belongs to account
        canvas = await crud_canvas.get(db, id=canvas_id)
        if not canvas or canvas.account_id != account_id:
            raise HTTPException(status_code=404, detail="Canvas not found")
        
        return await crud_run.get_multi_by_canvas(
            db,
            canvas_id=canvas_id,
            skip=skip,
            limit=limit
        )
    
    return await crud_run.get_multi_by_account(
        db,
        account_id=account_id,
        skip=skip,
        limit=limit
    )

@router.get("/{run_id}", response_model=RunResponse)
async def get_run(
    *,
    db: AsyncSession = Depends(get_db),
    run_id: str,
    account_id: Annotated[str, Header()]
):
    """Get specific run"""
    run = await crud_run.get_by_account_and_id(
        db,
        account_id=account_id,
        run_id=run_id
    )
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    # Validate run belongs to account through canvas
    canvas = await crud_canvas.get(db, id=run.canvas_id)
    if not canvas or canvas.account_id != account_id:
        raise HTTPException(status_code=404, detail="Run not found")
    
    return run

@router.post("/{run_id}/cancel")
async def cancel_run(
    *,
    db: AsyncSession = Depends(get_db),
    run_id: str,
    account_id: Annotated[str, Header()]
):
    """Cancel a run"""
    run = await crud_run.get_by_account_and_id(
        db,
        account_id=account_id,
        run_id=run_id
    )
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    if run.status not in [RunStatus.PENDING, RunStatus.RUNNING]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel run in {run.status} status"
        )
    
    # Update run status to cancelled
    await crud_run.update_status(
        db=db,
        run_id=run_id,
        status=RunStatus.CANCELLED,
        error={"message": "Run cancelled by user"}
    )
    
    # TODO: Notify external service to cancel the run
    
    return {"status": "success"}

@router.delete("/{run_id}")
async def delete_run(
    *,
    db: AsyncSession = Depends(get_db),
    run_id: str,
    account_id: Annotated[str, Header()]
):
    """Delete run"""
    run = await crud_run.get_by_account_and_id(
        db,
        account_id=account_id,
        run_id=run_id
    )
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    await crud_run.delete(db=db, id=run_id)
    return {"status": "success"}

@router.post("/{run_id}/status", response_model=schemas.RunResponse)
def update_run_status(
    *,
    db: AsyncSession = Depends(get_db),
    run_id: str,
    status_update: schemas.RunStatusUpdate
):
    """Update run status - Called by external service"""
    run = crud_run.get(db, id=run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    return crud_run.update_status(
        db=db,
        run_id=run_id,
        status=status_update.status,
        results=status_update.results,
        error=status_update.error
    )

@router.get("/{run_id}/status", response_model=schemas.RunStatusResponse)
def get_run_status(
    *,
    db: AsyncSession = Depends(get_db),
    run_id: str,
    account_id: Annotated[str, Header()]
):
    """Get run status"""
    run = crud_run.get(db, id=run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    # Validate run belongs to account through canvas
    canvas = crud_canvas.get(db, id=run.canvas_id)
    if not canvas or canvas.account_id != account_id:
        raise HTTPException(status_code=404, detail="Run not found")
    
    return {
        "status": run.status,
        "started_at": run.started_at,
        "completed_at": run.completed_at,
        "error": run.error
    } 