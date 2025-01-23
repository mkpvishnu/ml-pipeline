from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.api.dependencies import get_db
from backend.crud.canvas import CanvasCRUD
from backend.schemas.canvas import (
    Canvas,
    CanvasCreate,
    CanvasUpdate,
    CanvasModuleVersion,
    CanvasModuleVersionCreate
)

router = APIRouter()

@router.post("", response_model=Canvas)
def create_canvas(
    canvas_in: CanvasCreate,
    account_id: int,
    db: Session = Depends(get_db)
):
    """Create a new canvas."""
    canvas = CanvasCRUD.create(db=db, account_id=account_id, canvas_in=canvas_in)
    if not canvas:
        raise HTTPException(status_code=400, detail="Failed to create canvas")
    return canvas

@router.get("", response_model=List[Canvas])
def get_canvases(
    account_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all canvases for an account."""
    canvases = CanvasCRUD.get_by_account(db=db, account_id=account_id, skip=skip, limit=limit)
    return canvases

@router.get("/{canvas_id}", response_model=Canvas)
def get_canvas(
    canvas_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific canvas by ID."""
    canvas = CanvasCRUD.get(db=db, canvas_id=canvas_id)
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return canvas

@router.put("/{canvas_id}", response_model=Canvas)
def update_canvas(
    canvas_id: str,
    canvas_in: CanvasUpdate,
    db: Session = Depends(get_db)
):
    """Update a canvas."""
    canvas = CanvasCRUD.update(db=db, canvas_id=canvas_id, canvas_in=canvas_in)
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return canvas

@router.delete("/{canvas_id}")
def delete_canvas(
    canvas_id: str,
    db: Session = Depends(get_db)
):
    """Delete a canvas."""
    success = CanvasCRUD.delete(db=db, canvas_id=canvas_id)
    if not success:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return {"status": "success", "canvas_id": canvas_id}

@router.post("/{canvas_id}/modules", response_model=CanvasModuleVersion)
def add_module_to_canvas(
    canvas_id: str,
    module_in: CanvasModuleVersionCreate,
    db: Session = Depends(get_db)
):
    """Add a module version to a canvas."""
    module_version = CanvasCRUD.add_module_version(
        db=db,
        canvas_id=canvas_id,
        module_id=module_in.module_id,
        version=module_in.version,
        position_x=module_in.position_x,
        position_y=module_in.position_y,
        config=module_in.config
    )
    if not module_version:
        raise HTTPException(status_code=400, detail="Failed to add module to canvas")
    return module_version 