from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from typing import List, Annotated

from backend.api.dependencies import get_db, validate_account_id
from backend.crud import component as crud_component
from backend.crud import module as crud_module
from backend.schemas import component as schemas

router = APIRouter(prefix="/components", tags=["components"])

@router.post("/", response_model=schemas.ComponentResponse)
def create_component(
    *,
    db: Session = Depends(get_db),
    component_in: schemas.ComponentCreate,
    account_id: Annotated[str, Header()]
):
    """Create new component"""
    return crud_component.create(db=db, obj_in=component_in, account_id=account_id)

@router.get("/", response_model=List[schemas.ComponentResponse])
def list_components(
    *,
    db: Session = Depends(get_db),
    account_id: Annotated[str, Header()],
    group_id: str = None,
    skip: int = 0,
    limit: int = 100
):
    """List components with optional group filter"""
    return crud_component.get_multi_by_account(
        db, 
        account_id=account_id,
        group_id=group_id,
        skip=skip,
        limit=limit
    )

@router.get("/{component_id}", response_model=schemas.ComponentResponse)
def get_component(
    *,
    db: Session = Depends(get_db),
    component_id: str,
    account_id: Annotated[str, Header()]
):
    """Get specific component"""
    component = crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    return component

@router.patch("/{component_id}/title", response_model=schemas.ComponentResponse)
def update_component_title(
    *,
    db: Session = Depends(get_db),
    component_id: str,
    title_update: schemas.ComponentTitleUpdate,
    account_id: Annotated[str, Header()]
):
    """Update component title"""
    component = crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    return crud_component.update_title(
        db=db, db_obj=component, title=title_update.title
    )

@router.post("/{component_id}/active", response_model=schemas.ComponentResponse)
def set_active_module(
    *,
    db: Session = Depends(get_db),
    component_id: str,
    active_module: schemas.ComponentActiveModule,
    account_id: Annotated[str, Header()]
):
    """Set active module for component"""
    component = crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    
    # Validate module exists and belongs to component
    module = crud_module.get(db, id=active_module.module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found or not associated with component")
    
    return crud_component.set_active_module(
        db=db,
        component_id=component_id,
        module_id=active_module.module_id
    )

@router.delete("/{component_id}")
def delete_component(
    *,
    db: Session = Depends(get_db),
    component_id: str,
    account_id: Annotated[str, Header()]
):
    """Delete component"""
    component = crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    crud_component.remove(db=db, id=component_id)
    return {"status": "success"} 