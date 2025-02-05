from fastapi import APIRouter, Depends, Header, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated
import httpx

from backend.api.dependencies import (
    get_db, validate_account_id, validate_canvas
)
from backend.crud import canvas as crud_canvas
from backend.crud import run as crud_run
from backend.schemas.canvas import (
    CanvasCreate, CanvasUpdate, CanvasResponse,
    CanvasNameUpdate, CanvasModuleConfigUpdate
)
from backend.core.config import get_settings

settings = get_settings()
router = APIRouter()

@router.post("/", response_model=CanvasResponse)
async def create_canvas(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_in: CanvasCreate,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id)
):
    """Create new canvas"""
    return await crud_canvas.create(
        db=db,
        obj_in=canvas_in.model_dump(),
        account_id=account_id
    )

@router.get("/", response_model=List[CanvasResponse])
async def list_canvases(
    *,
    db: AsyncSession = Depends(get_db),
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    skip: int = 0,
    limit: int = 100
):
    """List all active canvases for an account"""
    return await crud_canvas.get_multi_by_account(
        db,
        account_id=account_id,
        skip=skip,
        limit=limit
    )

@router.get("/{canvas_id}", response_model=CanvasResponse)
async def get_canvas(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(lambda x: validate_canvas(canvas_id, account_id, x))
):
    """Get specific active canvas"""
    return await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )

@router.patch("/{canvas_id}", response_model=CanvasResponse)
async def update_canvas(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    canvas_in: CanvasUpdate,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(lambda x: validate_canvas(canvas_id, account_id, x))
):
    """Update canvas"""
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    return await crud_canvas.update(
        db=db,
        db_obj=canvas,
        obj_in=canvas_in.model_dump(exclude_unset=True)
    )

@router.patch("/{canvas_id}/name", response_model=CanvasResponse)
async def update_canvas_name(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    name_update: CanvasNameUpdate,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(lambda x: validate_canvas(canvas_id, account_id, x))
):
    """Update canvas name"""
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    return await crud_canvas.update(
        db=db,
        db_obj=canvas,
        obj_in={"name": name_update.name}
    )

@router.patch("/{canvas_id}/module-config", response_model=CanvasResponse)
async def update_canvas_module_config(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    config_update: CanvasModuleConfigUpdate,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(lambda x: validate_canvas(canvas_id, account_id, x))
):
    """Update canvas module configuration"""
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    return await crud_canvas.update_module_config(
        db=db,
        db_obj=canvas,
        module_config=config_update.module_config
    )

@router.post("/{canvas_id}/run")
async def run_canvas(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(lambda x: validate_canvas(canvas_id, account_id, x))
):
    """Run a canvas"""
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    
    # Create run record
    run = await crud_run.create(
        db=db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    
    # Trigger external service
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.freshflow}/execute",
                json={
                    "run_id": run.id,
                    "module_config": canvas.module_config
                }
            )
            response.raise_for_status()
        except httpx.HTTPError as e:
            # Update run status to error
            await crud_run.update_status(
                db=db,
                db_obj=run,
                status="ERROR",
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
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(lambda x: validate_canvas(canvas_id, account_id, x))
):
    """Soft delete canvas"""
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    await crud_canvas.soft_delete(db=db, db_obj=canvas)
    return {"status": "success"} 