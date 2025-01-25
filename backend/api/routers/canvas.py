from fastapi import APIRouter, Depends, Header, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated
import httpx
import asyncio
from datetime import datetime, timedelta

from backend.api.dependencies import get_db, validate_account_id
from backend.crud import canvas as crud_canvas
from backend.crud import run as crud_run
from backend.schemas import canvas as schemas
from backend.schemas.run import RunStatus, RunResponse
from backend.core.config import get_settings

settings = get_settings()

router = APIRouter()

@router.post("/", response_model=schemas.CanvasResponse)
async def create_canvas(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_in: schemas.CanvasCreate,
    account_id: Annotated[str, Header()]
):
    """Create new canvas"""
    return await crud_canvas.create(
        db=db,
        obj_in=canvas_in,
        account_id=account_id
    )

@router.get("/", response_model=List[schemas.CanvasResponse])
async def list_canvases(
    *,
    db: AsyncSession = Depends(get_db),
    account_id: Annotated[str, Header()],
    skip: int = 0,
    limit: int = 100
):
    """List all canvases for an account"""
    return await crud_canvas.get_multi_by_account(
        db,
        account_id=account_id,
        skip=skip,
        limit=limit
    )

@router.get("/{canvas_id}", response_model=schemas.CanvasResponse)
async def get_canvas(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    account_id: Annotated[str, Header()]
):
    """Get specific canvas"""
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return canvas

@router.patch("/{canvas_id}/name", response_model=schemas.CanvasResponse)
async def update_canvas_name(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    name_update: schemas.CanvasNameUpdate,
    account_id: Annotated[str, Header()]
):
    """Update canvas name"""
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return await crud_canvas.update(
        db=db,
        db_obj=canvas,
        obj_in={"name": name_update.name}
    )

@router.patch("/{canvas_id}/module-config", response_model=schemas.CanvasResponse)
async def update_module_config(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    config_update: schemas.CanvasModuleConfigUpdate,
    account_id: Annotated[str, Header()]
):
    """Update canvas module configuration"""
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return await crud_canvas.update_module_config(
        db=db,
        db_obj=canvas,
        module_config=config_update.module_config
    )

@router.post("/{canvas_id}/run", response_model=RunResponse)
async def trigger_run(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    account_id: Annotated[str, Header()],
    background_tasks: BackgroundTasks
):
    """Trigger canvas execution"""
    # Validate canvas
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")
    
    # Create run record
    run = await crud_run.create(
        db=db,
        canvas_id=canvas_id,
        account_id=account_id
    )
    
    # Trigger external service
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.EXTERNAL_SERVICE_URL}/execute",
                json={
                    "run_id": run.id,
                    "module_config": canvas.module_config
                }
            )
            response.raise_for_status()
        except httpx.HTTPError as e:
            # Update run status to failed
            await crud_run.update_status(
                db=db,
                run_id=run.id,
                status=RunStatus.FAILED,
                error={"message": str(e)}
            )
            raise HTTPException(
                status_code=500,
                detail=f"Failed to trigger external service: {str(e)}"
            )
    
    return run

@router.delete("/{canvas_id}")
async def delete_canvas(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    account_id: Annotated[str, Header()]
):
    """Delete canvas"""
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")
    await crud_canvas.delete(db=db, id=canvas_id)
    return {"status": "success"} 