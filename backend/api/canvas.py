from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
import httpx
import json
from datetime import datetime

from .. import crud, schemas
from ..dependencies import get_db
from ..config import settings

router = APIRouter(
    prefix="/canvas",
    tags=["canvas"]
)

@router.post("/", response_model=schemas.Canvas)
def create_canvas(canvas: schemas.CanvasCreate, db: Session = Depends(get_db)):
    return crud.create_canvas(db=db, canvas=canvas)

@router.get("/account/{account_id}", response_model=List[schemas.Canvas])
def read_account_canvases(account_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    canvases = crud.get_canvases_by_account(db, account_id=account_id, skip=skip, limit=limit)
    return canvases

@router.get("/{canvas_id}", response_model=schemas.Canvas)
def read_canvas(canvas_id: int, db: Session = Depends(get_db)):
    db_canvas = crud.get_canvas(db, canvas_id=canvas_id)
    if db_canvas is None:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return db_canvas

@router.put("/{canvas_id}", response_model=schemas.Canvas)
def update_canvas(canvas_id: int, canvas: schemas.CanvasCreate, db: Session = Depends(get_db)):
    db_canvas = crud.update_canvas(db, canvas_id=canvas_id, canvas=canvas)
    if db_canvas is None:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return db_canvas

@router.delete("/{canvas_id}")
def delete_canvas(canvas_id: int, db: Session = Depends(get_db)):
    success = crud.delete_canvas(db, canvas_id=canvas_id)
    if not success:
        raise HTTPException(status_code=404, detail="Canvas not found")
    return {"detail": "Canvas deleted"}

async def execute_canvas_async(execution_id: int, canvas_id: int, db: Session):
    # Update execution status to running
    crud.update_canvas_execution_status(db, execution_id, "running")
    
    try:
        # Get canvas with all its nodes
        canvas = crud.get_canvas(db, canvas_id)
        if not canvas:
            raise ValueError("Canvas not found")

        # Prepare execution payload
        execution_config = {
            "canvas_id": canvas.id,
            "nodes": []
        }

        # Sort nodes by execution order
        sorted_nodes = sorted(canvas.nodes, key=lambda x: x.execution_order)
        
        for node in sorted_nodes:
            node_config = {
                "id": node.id,
                "component_type": node.component.type,
                "module": {
                    "id": node.module.id,
                    "name": node.module.name,
                    "type": node.module.type,
                    "module_type": node.module.module_type,
                    "code": node.module.code,
                    "config_schema": node.module.config_schema
                },
                "config": node.config,
                "position": {
                    "x": node.position_x,
                    "y": node.position_y
                },
                "execution_order": node.execution_order
            }
            execution_config["nodes"].append(node_config)

        # Send execution request to execution service
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.EXECUTION_SERVICE_URL}/execute",
                json=execution_config
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Execution service error: {response.text}"
                )
            
            result = response.json()
            
            # Update execution status to completed
            crud.update_canvas_execution_status(
                db, 
                execution_id, 
                "completed",
                result=result
            )

    except Exception as e:
        # Update execution status to failed
        crud.update_canvas_execution_status(
            db, 
            execution_id, 
            "failed",
            error=str(e)
        )
        raise

@router.post("/{canvas_id}/execute", response_model=schemas.CanvasExecution)
async def execute_canvas(
    canvas_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    # Create execution record
    execution = crud.create_canvas_execution(
        db=db,
        execution=schemas.CanvasExecutionCreate(canvas_id=canvas_id)
    )
    
    # Add execution task to background tasks
    background_tasks.add_task(
        execute_canvas_async,
        execution_id=execution.id,
        canvas_id=canvas_id,
        db=db
    )
    
    return execution

@router.get("/{canvas_id}/executions", response_model=List[schemas.CanvasExecution])
def read_canvas_executions(
    canvas_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    executions = crud.get_canvas_executions(db, canvas_id=canvas_id, skip=skip, limit=limit)
    return executions

@router.get("/executions/{execution_id}", response_model=schemas.CanvasExecution)
def read_execution(execution_id: int, db: Session = Depends(get_db)):
    execution = crud.get_canvas_execution(db, execution_id=execution_id)
    if execution is None:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution 