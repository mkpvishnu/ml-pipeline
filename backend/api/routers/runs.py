from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query
from sqlalchemy.orm import Session

from backend.api.dependencies import get_db
from backend.models.database import Canvas
from backend.schemas.run import (
    CanvasRun,
    CanvasRunCreate,
    CanvasRunUpdate,
    CanvasRunResponse,
    RunStatus,
    ModuleRunStats,
    ModuleRunResult
)
from backend.crud.run import RunCRUD
from backend.crud.canvas import CanvasCRUD
from backend.core.executor import CanvasExecutor

router = APIRouter()

async def execute_canvas_background(
    canvas: Canvas,
    run_id: str,
    db: Session
) -> None:
    """Execute canvas in background"""
    executor = CanvasExecutor(canvas)
    
    try:
        # Execute all modules
        results = await executor.execute()
        
        # Update run status
        final_status = RunStatus.COMPLETED
        if any(r.status == RunStatus.FAILED for r in results.values()):
            final_status = RunStatus.FAILED
        
        run_update = CanvasRunUpdate(
            status=final_status,
            module_runs=results
        )
        
        db_run = RunCRUD.get_by_run_id(db, run_id=run_id)
        if db_run:
            RunCRUD.update(db=db, db_obj=db_run, obj_in=run_update)
            
    except Exception as e:
        # Update run status to failed
        run_update = CanvasRunUpdate(
            status=RunStatus.FAILED,
            error={"error": str(e)}
        )
        db_run = RunCRUD.get_by_run_id(db, run_id=run_id)
        if db_run:
            RunCRUD.update(db=db, db_obj=db_run, obj_in=run_update)

@router.post("/canvas/{canvas_id}/run", response_model=CanvasRunResponse)
def create_canvas_run(
    canvas_id: str,
    db: Session = Depends(get_db)
):
    """Create a new canvas run."""
    run = RunCRUD.create_run(db=db, canvas_id=canvas_id)
    if not run:
        raise HTTPException(status_code=404, detail="Failed to create run")
    return run

@router.post("/{run_id}/execute", response_model=CanvasRunResponse)
async def execute_run(
    run_id: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Execute a specific run."""
    run = RunCRUD.get_run(db=db, run_id=run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")

    canvas = CanvasCRUD.get(db=db, canvas_id=run.canvas_id)
    if not canvas:
        raise HTTPException(status_code=404, detail="Canvas not found")

    # Start execution in background
    background_tasks.add_task(
        execute_canvas_background,
        canvas=canvas,
        run_id=run_id,
        db=db
    )

    return run

@router.get("/canvas/{canvas_id}/runs", response_model=List[CanvasRunResponse])
def get_canvas_runs(
    canvas_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all runs for a canvas."""
    runs = RunCRUD.get_runs_by_canvas(db=db, canvas_id=canvas_id, skip=skip, limit=limit)
    return runs

@router.get("/{run_id}", response_model=CanvasRunResponse)
def get_run(
    run_id: str,
    db: Session = Depends(get_db)
):
    """Get a specific run by ID."""
    run = RunCRUD.get_run(db=db, run_id=run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run

@router.get("/{run_id}/modules", response_model=List[ModuleRunResult])
def get_module_results(
    run_id: str,
    db: Session = Depends(get_db)
):
    """Get all module results for a run."""
    results = RunCRUD.get_module_results(db=db, run_id=run_id)
    return results

@router.post("/{run_id}/status")
def update_run_status(
    run_id: str,
    status: str,
    db: Session = Depends(get_db)
):
    """Update the status of a run."""
    run = RunCRUD.update_run_status(db=db, run_id=run_id, status=status)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return {"status": "success", "run_id": run_id, "new_status": status}

@router.post("/{run_id}/modules/{module_id}/result")
def create_module_result(
    run_id: str,
    module_id: str,
    db: Session = Depends(get_db)
):
    """Create a new module run result."""
    result = RunCRUD.create_module_result(db=db, run_id=run_id, module_id=module_id)
    if not result:
        raise HTTPException(status_code=404, detail="Failed to create module result")
    return {"status": "success", "run_id": run_id, "module_id": module_id}

@router.put("/{run_id}/modules/{module_id}/result")
def update_module_result(
    run_id: str,
    module_id: str,
    status: str,
    metrics: Optional[dict] = None,
    cache_location: Optional[str] = None,
    error: Optional[dict] = None,
    db: Session = Depends(get_db)
):
    """Update a module run result."""
    result = RunCRUD.update_module_result(
        db=db,
        run_id=run_id,
        module_id=module_id,
        status=status,
        metrics=metrics,
        cache_location=cache_location,
        error=error
    )
    if not result:
        raise HTTPException(status_code=404, detail="Module result not found")
    return {"status": "success", "run_id": run_id, "module_id": module_id}

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