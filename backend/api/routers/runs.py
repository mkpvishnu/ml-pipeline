from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.api.dependencies import get_db
from backend.models.database import CanvasRun
from backend.schemas.run import (
    CanvasRunCreate, 
    CanvasRunUpdate, 
    CanvasRunResponse,
    RunStatus,
    ModuleRunStats
)
from backend.crud.run import RunCRUD

router = APIRouter()

@router.post("/", response_model=CanvasRunResponse)
def create_run(run: CanvasRunCreate, db: Session = Depends(get_db)):
    """Create a new canvas run"""
    return RunCRUD.create(db=db, obj_in=run)

@router.get("/", response_model=List[CanvasRunResponse])
def list_runs(
    canvas_id: Optional[str] = None,
    status: Optional[RunStatus] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """List all runs with optional filtering"""
    runs = RunCRUD.get_multi(
        db, 
        canvas_id=canvas_id,
        status=status,
        skip=skip, 
        limit=limit
    )
    return runs

@router.get("/{run_id}", response_model=CanvasRunResponse)
def get_run(run_id: str, db: Session = Depends(get_db)):
    """Get a specific run by ID"""
    db_run = RunCRUD.get_by_run_id(db, run_id=run_id)
    if db_run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return db_run

@router.put("/{run_id}", response_model=CanvasRunResponse)
def update_run(run_id: str, run: CanvasRunUpdate, db: Session = Depends(get_db)):
    """Update a run"""
    db_run = RunCRUD.get_by_run_id(db, run_id=run_id)
    if db_run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return RunCRUD.update(db=db, db_obj=db_run, obj_in=run)

@router.delete("/{run_id}")
def delete_run(run_id: str, db: Session = Depends(get_db)):
    """Delete a run"""
    db_run = RunCRUD.get_by_run_id(db, run_id=run_id)
    if db_run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    RunCRUD.delete(db=db, id=db_run.id)
    return {"status": "success"}

@router.post("/{run_id}/cancel")
def cancel_run(run_id: str, db: Session = Depends(get_db)):
    """Cancel a running canvas"""
    db_run = RunCRUD.get_by_run_id(db, run_id=run_id)
    if db_run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    
    if db_run.status not in [RunStatus.PENDING, RunStatus.RUNNING]:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot cancel run with status {db_run.status}"
        )
    
    return RunCRUD.update(
        db=db, 
        db_obj=db_run, 
        obj_in={"status": RunStatus.CANCELLED}
    )

@router.get("/modules/{module_id}/stats", response_model=ModuleRunStats)
def get_module_stats(
    module_id: str,
    canvas_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get run statistics for a specific module"""
    return RunCRUD.get_module_stats(
        db, module_id=module_id, canvas_id=canvas_id
    ) 