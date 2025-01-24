from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..db.dependencies import get_db

router = APIRouter(
    prefix="/components",
    tags=["modules"]
)

@router.post("/{component_id}/modules", response_model=schemas.Module)
def create_module(
    component_id: int,
    module: schemas.ModuleCreate,
    db: Session = Depends(get_db)
):
    """Create a new module for a component"""
    # Ensure component exists
    db_component = crud.component.get(db, id=component_id)
    if db_component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    
    # Set component_id in module data
    module_data = module.dict()
    module_data["component_id"] = component_id
    return crud.module.create(db=db, obj_in=schemas.ModuleCreate(**module_data))

@router.get("/{component_id}/modules", response_model=List[schemas.Module])
def read_component_modules(
    component_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
    db: Session = Depends(get_db)
):
    """Get all modules for a specific component"""
    # Ensure component exists
    db_component = crud.component.get(db, id=component_id)
    if db_component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    
    return crud.module.get_by_component(
        db, 
        component_id=component_id,
        skip=skip,
        limit=limit
    )

@router.get("/{component_id}/modules/{module_id}", response_model=schemas.Module)
def read_module(
    component_id: int,
    module_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific module by ID"""
    db_module = crud.module.get(db, id=module_id)
    if db_module is None or db_module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")
    return db_module

@router.put("/{component_id}/modules/{module_id}", response_model=schemas.Module)
def update_module(
    component_id: int,
    module_id: int,
    module: schemas.ModuleUpdate,
    db: Session = Depends(get_db)
):
    """Update a module"""
    db_module = crud.module.get(db, id=module_id)
    if db_module is None or db_module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")
    return crud.module.update(db=db, db_obj=db_module, obj_in=module)

@router.delete("/{component_id}/modules/{module_id}")
def delete_module(
    component_id: int,
    module_id: int,
    db: Session = Depends(get_db)
):
    """Delete a module"""
    db_module = crud.module.get(db, id=module_id)
    if db_module is None or db_module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")
    crud.module.remove(db=db, id=module_id)
    return {"detail": "Module deleted"} 