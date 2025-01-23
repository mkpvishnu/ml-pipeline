from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from backend.api.dependencies import get_db
from backend.models.database import Module, ModuleVersion
from backend.schemas.module import (
    ModuleCreate, 
    ModuleUpdate, 
    ModuleResponse,
    ModuleVersionCreate,
    ModuleVersionUpdate,
    ModuleVersionResponse
)
from backend.crud.module import ModuleCRUD

router = APIRouter()

# Module endpoints
@router.post("/", response_model=ModuleResponse)
def create_module(module: ModuleCreate, db: Session = Depends(get_db)):
    """Create a new module"""
    return ModuleCRUD.create(db=db, obj_in=module)

@router.get("/", response_model=List[ModuleResponse])
def list_modules(
    account_id: Optional[int] = None,
    module_type: Optional[str] = None,
    category: Optional[str] = None,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """List all modules with optional filtering"""
    filters = {
        "account_id": account_id,
        "type": module_type,
        "category": category
    }
    filters = {k: v for k, v in filters.items() if v is not None}
    
    modules = ModuleCRUD.get_multi(
        db, filters=filters, skip=skip, limit=limit
    )
    return modules

@router.get("/{module_id}", response_model=ModuleResponse)
def get_module(module_id: str, db: Session = Depends(get_db)):
    """Get a specific module by ID"""
    db_module = ModuleCRUD.get_by_module_id(db, module_id=module_id)
    if db_module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    return db_module

@router.put("/{module_id}", response_model=ModuleResponse)
def update_module(module_id: str, module: ModuleUpdate, db: Session = Depends(get_db)):
    """Update a module"""
    db_module = ModuleCRUD.get_by_module_id(db, module_id=module_id)
    if db_module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    return ModuleCRUD.update(db=db, db_obj=db_module, obj_in=module)

@router.delete("/{module_id}")
def delete_module(module_id: str, db: Session = Depends(get_db)):
    """Delete a module"""
    db_module = ModuleCRUD.get_by_module_id(db, module_id=module_id)
    if db_module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    ModuleCRUD.delete(db=db, id=db_module.id)
    return {"status": "success"}

# Module version endpoints
@router.post("/{module_id}/versions", response_model=ModuleVersionResponse)
def create_module_version(
    module_id: str, 
    version: ModuleVersionCreate, 
    db: Session = Depends(get_db)
):
    """Create a new version for a module"""
    db_module = ModuleCRUD.get_by_module_id(db, module_id=module_id)
    if db_module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return ModuleCRUD.create_version(db=db, module_id=module_id, obj_in=version)

@router.get("/{module_id}/versions", response_model=List[ModuleVersionResponse])
def list_module_versions(
    module_id: str,
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """List all versions of a module"""
    db_module = ModuleCRUD.get_by_module_id(db, module_id=module_id)
    if db_module is None:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return ModuleCRUD.get_versions(
        db, module_id=module_id, skip=skip, limit=limit
    )

@router.get(
    "/{module_id}/versions/{version}", 
    response_model=ModuleVersionResponse
)
def get_module_version(
    module_id: str,
    version: str,
    db: Session = Depends(get_db)
):
    """Get a specific version of a module"""
    db_version = ModuleCRUD.get_version(
        db, module_id=module_id, version=version
    )
    if db_version is None:
        raise HTTPException(status_code=404, detail="Module version not found")
    return db_version

@router.put(
    "/{module_id}/versions/{version}", 
    response_model=ModuleVersionResponse
)
def update_module_version(
    module_id: str,
    version: str,
    version_update: ModuleVersionUpdate,
    db: Session = Depends(get_db)
):
    """Update a specific version of a module"""
    db_version = ModuleCRUD.get_version(
        db, module_id=module_id, version=version
    )
    if db_version is None:
        raise HTTPException(status_code=404, detail="Module version not found")
    
    return ModuleCRUD.update_version(
        db=db, 
        db_obj=db_version, 
        obj_in=version_update
    ) 