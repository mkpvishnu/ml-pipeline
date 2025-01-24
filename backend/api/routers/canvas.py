from fastapi import APIRouter, Depends, Header, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Annotated
import httpx

from backend.api.dependencies import get_db, validate_account_id
from backend.crud import canvas as crud_canvas
from backend.crud import run as crud_run
from backend.schemas import canvas as schemas
from backend.core.config import get_settings

settings = get_settings()

router = APIRouter(prefix="/canvas", tags=["canvas"])

@router.post("/", response_model=schemas.CanvasResponse)
def create_canvas(
    *,
    db: Session = Depends(get_db),
    canvas_in: schemas.CanvasCreate,
    account_id: Annotated[str, Header()]
):
    """Create new canvas"""
    return crud_canvas.create(db=db, obj_in=canvas_in, account_id=account_id)

@router.get("/", response_model=List[schemas.CanvasResponse])
def list_canvases(
    *,
    db: Session = Depends(get_db),
    account_id: Annotated[str, Header()],
    skip: int = 0,
    limit: int = 100
):
    """List all canvases for an account"""
    return crud_canvas.get_multi_by_account(
        db,
        account_id=account_id,
        skip=skip,
        limit=limit
    )

@router.get("/{canvas_id}", response_model=schemas.CanvasResponse)
def get_canvas(
    *,
    db: Session = Depends(get_db),
    canvas_id: str,
    account_id: Annotated[str, Header()]
):
    """Get specific canvas"""
    canvas = crud_canvas.get(db, id=canvas_id)
    if not canvas or canvas.account_id != account_id:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return canvas

@router.patch("/{canvas_id}/name", response_model=schemas.CanvasResponse)
def update_canvas_name(
    *,
    db: Session = Depends(get_db),
    canvas_id: str,
    name_update: schemas.CanvasNameUpdate,
    account_id: Annotated[str, Header()]
):
    """Update canvas name"""
    canvas = crud_canvas.get(db, id=canvas_id)
    if not canvas or canvas.account_id != account_id:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return crud_canvas.update_name(
        db=db,
        db_obj=canvas,
        name=name_update.name
    )

@router.patch("/{canvas_id}/module-config", response_model=schemas.CanvasResponse)
def update_module_config(
    *,
    db: Session = Depends(get_db),
    canvas_id: str,
    config_update: schemas.CanvasModuleConfigUpdate,
    account_id: Annotated[str, Header()]
):
    """Update canvas module configuration"""
    canvas = crud_canvas.get(db, id=canvas_id)
    if not canvas or canvas.account_id != account_id:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return crud_canvas.update_module_config(
        db=db,
        db_obj=canvas,
        module_config=config_update.module_config
    )

@router.post("/{canvas_id}/run", response_model=schemas.RunResponse)
async def trigger_run(
    *,
    db: Session = Depends(get_db),
    canvas_id: str,
    account_id: Annotated[str, Header()],
    background_tasks: BackgroundTasks
):
    """Trigger canvas execution"""
    # Validate canvas
    canvas = crud_canvas.get(db, id=canvas_id)
    if not canvas or canvas.account_id != account_id:
        raise HTTPException(status_code=404, detail="Canvas not found")
    
    # Create run record
    run = crud_run.create(
        db=db,
        canvas_id=canvas_id,
        account_id=account_id
    )
    
    # Trigger external service in background
    async def trigger_external_service(run_id: str, module_config: dict):
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    settings.EXTERNAL_SERVICE_URL,
                    json={
                        "run_id": run_id,
                        "module_config": module_config
                    }
                )
                response.raise_for_status()
            except httpx.HTTPError as e:
                # Update run status to failed
                crud_run.update_status(
                    db=db,
                    run_id=run_id,
                    status="failed",
                    error=str(e)
                )
    
    background_tasks.add_task(
        trigger_external_service,
        run.id,
        canvas.module_config
    )
    
    return run

@router.delete("/{canvas_id}")
def delete_canvas(
    *,
    db: Session = Depends(get_db),
    canvas_id: str,
    account_id: Annotated[str, Header()]
):
    """Delete canvas"""
    canvas = crud_canvas.get(db, id=canvas_id)
    if not canvas or canvas.account_id != account_id:
        raise HTTPException(status_code=404, detail="Canvas not found")
    crud_canvas.remove(db=db, id=canvas_id)
    return {"status": "success"} 