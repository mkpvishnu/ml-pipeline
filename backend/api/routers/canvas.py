from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated

from backend.api.dependencies import (
    get_db, validate_account_id, validate_canvas
)
from backend.crud import canvas as crud_canvas
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
    _: str = Depends(validate_account_id)
):
    """Get specific active canvas"""
    return await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )

@router.put("/{canvas_id}", response_model=CanvasResponse)
async def update_canvas(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    canvas_in: CanvasUpdate,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id)
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
    _: str = Depends(validate_account_id)
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
    _: str = Depends(validate_account_id)
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

@router.delete("/{canvas_id}")
async def delete_canvas(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id)
):
    """Soft delete canvas"""
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    await crud_canvas.soft_delete(db=db, db_obj=canvas)
    return {"status": "success"}

@router.post("/{canvas_id}/duplicate", response_model=CanvasResponse)
async def duplicate_canvas(
    *,
    db: AsyncSession = Depends(get_db),
    canvas_id: str,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id)
):
    """Create a duplicate of an existing canvas"""
    # Get the source canvas
    canvas = await crud_canvas.get_by_account_and_id(
        db,
        account_id=account_id,
        canvas_id=canvas_id
    )
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")
    
    # Create duplicate
    return await crud_canvas.duplicate(
        db=db,
        db_obj=canvas,
        account_id=account_id
    ) 