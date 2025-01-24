from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from typing import List, Annotated

from backend.api.dependencies import get_db, validate_account_id
from backend.crud import run as crud_run
from backend.crud import canvas as crud_canvas
from backend.schemas import run as schemas

router = APIRouter(prefix="/run", tags=["run"])

@router.get("/", response_model=List[schemas.RunResponse])
def list_runs(
    *,
    db: Session = Depends(get_db),
    account_id: Annotated[str, Header()],
    canvas_id: str = None,
    skip: int = 0,
    limit: int = 100
):
    """List all runs with optional canvas filter"""
    if canvas_id:
        # Validate canvas belongs to account
        canvas = crud_canvas.get(db, id=canvas_id)
        if not canvas or canvas.account_id != account_id:
            raise HTTPException(status_code=404, detail="Canvas not found")
        
        return crud_run.get_multi_by_canvas(
            db,
            canvas_id=canvas_id,
            skip=skip,
            limit=limit
        )
    
    return crud_run.get_multi_by_account(
        db,
        account_id=account_id,
        skip=skip,
        limit=limit
    )

@router.get("/{run_id}", response_model=schemas.RunResponse)
def get_run(
    *,
    db: Session = Depends(get_db),
    run_id: str,
    account_id: Annotated[str, Header()]
):
    """Get specific run"""
    run = crud_run.get(db, id=run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    
    # Validate run belongs to account through canvas
    canvas = crud_canvas.get(db, id=run.canvas_id)
    if not canvas or canvas.account_id != account_id:
        raise HTTPException(status_code=404, detail="Run not found")
    
    return run

@router.post("/{run_id}/status", response_model=schemas.RunResponse)
def update_run_status(
    *,
    db: Session = Depends(get_db),
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
    db: Session = Depends(get_db),
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