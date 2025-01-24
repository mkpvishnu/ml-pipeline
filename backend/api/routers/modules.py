from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from typing import List, Annotated

from backend.api.dependencies import get_db, validate_account_id
from backend.crud import module as crud_module
from backend.crud import component as crud_component
from backend.schemas import module as schemas

router = APIRouter(prefix="/components/{component_id}/modules", tags=["modules"])

@router.post("/", response_model=schemas.ModuleResponse)
def create_module(
    *,
    db: Session = Depends(get_db),
    component_id: str,
    module_in: schemas.ModuleCreate,
    account_id: Annotated[str, Header()]
):
    """Create new module for a component"""
    # Validate component exists and belongs to account
    component = crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    
    return crud_module.create(
        db=db,
        obj_in=module_in,
        component_id=component_id,
        account_id=account_id
    )

@router.get("/", response_model=List[schemas.ModuleResponse])
def list_modules(
    *,
    db: Session = Depends(get_db),
    component_id: str,
    account_id: Annotated[str, Header()],
    skip: int = 0,
    limit: int = 100
):
    """List all modules for a component"""
    # Validate component exists and belongs to account
    component = crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    
    return crud_module.get_multi_by_component(
        db,
        component_id=component_id,
        skip=skip,
        limit=limit
    )

@router.get("/{module_id}", response_model=schemas.ModuleResponse)
def get_module(
    *,
    db: Session = Depends(get_db),
    component_id: str,
    module_id: str,
    account_id: Annotated[str, Header()]
):
    """Get specific module"""
    module = crud_module.get(db, id=module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Validate component belongs to account
    component = crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    
    return module

@router.patch("/{module_id}/code", response_model=schemas.ModuleResponse)
def update_module_code(
    *,
    db: Session = Depends(get_db),
    component_id: str,
    module_id: str,
    code_update: schemas.ModuleCodeUpdate,
    account_id: Annotated[str, Header()]
):
    """Update module code"""
    module = crud_module.get(db, id=module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Validate component belongs to account
    component = crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    
    return crud_module.update_code(
        db=db,
        db_obj=module,
        code=code_update.code
    )

@router.patch("/{module_id}/config", response_model=schemas.ModuleResponse)
def update_module_config(
    *,
    db: Session = Depends(get_db),
    component_id: str,
    module_id: str,
    config_update: schemas.ModuleConfigUpdate,
    account_id: Annotated[str, Header()]
):
    """Update module config schema"""
    module = crud_module.get(db, id=module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Validate component belongs to account
    component = crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    
    return crud_module.update_config_schema(
        db=db,
        db_obj=module,
        config_schema=config_update.config_schema
    )

@router.patch("/{module_id}/name", response_model=schemas.ModuleResponse)
def update_module_name(
    *,
    db: Session = Depends(get_db),
    component_id: str,
    module_id: str,
    name_update: schemas.ModuleNameUpdate,
    account_id: Annotated[str, Header()]
):
    """Update module name"""
    module = crud_module.get(db, id=module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Validate component belongs to account
    component = crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    
    return crud_module.update_name(
        db=db,
        db_obj=module,
        name=name_update.name
    )

@router.delete("/{module_id}")
def delete_module(
    *,
    db: Session = Depends(get_db),
    component_id: str,
    module_id: str,
    account_id: Annotated[str, Header()]
):
    """Delete module"""
    module = crud_module.get(db, id=module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")
    
    # Validate component belongs to account
    component = crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    
    crud_module.remove(db=db, id=module_id)
    return {"status": "success"} 