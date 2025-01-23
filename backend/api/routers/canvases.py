from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.api.dependencies import get_db
from backend.models.database import Canvas
from backend.schemas.canvas import (
    CanvasCreate, 
    CanvasUpdate, 
    CanvasResponse,
    ModuleConnection
)
from backend.crud.canvas import CanvasCRUD

router = APIRouter()

@router.post("/", response_model=CanvasResponse)
def create_canvas(canvas: CanvasCreate, db: Session = Depends(get_db)):
    """Create a new canvas"""
    return CanvasCRUD.create(db=db, obj_in=canvas)

@router.get("/", response_model=List[CanvasResponse])
def list_canvases(
    account_id: Optional[int] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """List all canvases, optionally filtered by account"""
    canvases = CanvasCRUD.get_multi(
        db, account_id=account_id, skip=skip, limit=limit
    )
    return canvases

@router.get("/{canvas_id}", response_model=CanvasResponse)
def get_canvas(canvas_id: str, db: Session = Depends(get_db)):
    """Get a specific canvas by ID"""
    db_canvas = CanvasCRUD.get_by_canvas_id(db, canvas_id=canvas_id)
    if db_canvas is None:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return db_canvas

@router.put("/{canvas_id}", response_model=CanvasResponse)
def update_canvas(canvas_id: str, canvas: CanvasUpdate, db: Session = Depends(get_db)):
    """Update a canvas"""
    db_canvas = CanvasCRUD.get_by_canvas_id(db, canvas_id=canvas_id)
    if db_canvas is None:
        raise HTTPException(status_code=404, detail="Canvas not found")
    
    # Validate module connections if they're being updated
    if canvas.connections is not None:
        db_canvas.connections = canvas.connections
        if not CanvasCRUD.validate_connections(db_canvas):
            raise HTTPException(
                status_code=400, 
                detail="Invalid module connections"
            )
    
    return CanvasCRUD.update(db=db, db_obj=db_canvas, obj_in=canvas)

@router.delete("/{canvas_id}")
def delete_canvas(canvas_id: str, db: Session = Depends(get_db)):
    """Delete a canvas"""
    db_canvas = CanvasCRUD.get_by_canvas_id(db, canvas_id=canvas_id)
    if db_canvas is None:
        raise HTTPException(status_code=404, detail="Canvas not found")
    CanvasCRUD.delete(db=db, id=db_canvas.id)
    return {"status": "success"}

@router.get("/{canvas_id}/execution-order", response_model=List[str])
def get_execution_order(canvas_id: str, db: Session = Depends(get_db)):
    """Get the execution order of modules in a canvas"""
    db_canvas = CanvasCRUD.get_by_canvas_id(db, canvas_id=canvas_id)
    if db_canvas is None:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return CanvasCRUD.get_execution_order(db_canvas)

@router.post("/{canvas_id}/validate")
def validate_canvas(canvas_id: str, db: Session = Depends(get_db)):
    """Validate a canvas configuration"""
    db_canvas = CanvasCRUD.get_by_canvas_id(db, canvas_id=canvas_id)
    if db_canvas is None:
        raise HTTPException(status_code=404, detail="Canvas not found")
    
    is_valid = CanvasCRUD.validate_connections(db_canvas)
    return {
        "is_valid": is_valid,
        "execution_order": CanvasCRUD.get_execution_order(db_canvas)
    } 