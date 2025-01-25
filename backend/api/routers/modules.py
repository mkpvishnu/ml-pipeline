from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated

from backend.api.dependencies import get_db, validate_account_id
from backend.crud import module as crud_module
from backend.crud import component as crud_component
from backend.schemas import module as schemas

router = APIRouter(tags=["modules"])

@router.post("/", response_model=schemas.ModuleResponse)
async def create_module(
    *,
    db: AsyncSession = Depends(get_db),
    component_id: str,
    module_in: schemas.ModuleCreate,
    account_id: Annotated[str, Header()]
):
    """Create new module for a component"""
    # Validate component exists and belongs to account
    component = await crud_component.get_by_account_and_id(
        db,
        account_id=account_id,
        component_id=component_id
    )
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    return await crud_module.create(
        db=db,
        obj_in=module_in,
        account_id=account_id,
        component_id=component_id
    )

@router.get("/", response_model=List[schemas.ModuleResponse])
async def list_modules(
    *,
    db: AsyncSession = Depends(get_db),
    component_id: str,
    account_id: Annotated[str, Header()],
    skip: int = 0,
    limit: int = 100
):
    """List all modules for a component"""
    # Validate component exists and belongs to account
    component = await crud_component.get_by_account_and_id(
        db,
        account_id=account_id,
        component_id=component_id
    )
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")
    
    return await crud_module.get_multi_by_component(
        db,
        component_id=component_id,
        skip=skip,
        limit=limit
    )

@router.get("/{module_id}", response_model=schemas.ModuleResponse)
async def get_module(
    *,
    db: AsyncSession = Depends(get_db),
    component_id: str,
    module_id: str,
    account_id: Annotated[str, Header()]
):
    """Get specific module"""
    # Validate component exists and belongs to account
    component = await crud_component.get_by_account_and_id(
        db,
        account_id=account_id,
        component_id=component_id
    )
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    module = await crud_module.get(db, id=module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")
    
    return module

@router.patch("/{module_id}/name", response_model=schemas.ModuleResponse)
async def update_module_name(
    *,
    db: AsyncSession = Depends(get_db),
    component_id: str,
    module_id: str,
    name_update: schemas.ModuleNameUpdate,
    account_id: Annotated[str, Header()]
):
    """Update module name"""
    # Validate component exists and belongs to account
    component = await crud_component.get_by_account_and_id(
        db,
        account_id=account_id,
        component_id=component_id
    )
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    module = await crud_module.get(db, id=module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")

    return await crud_module.update(
        db=db,
        db_obj=module,
        obj_in={"name": name_update.name}
    )

@router.patch("/{module_id}/code", response_model=schemas.ModuleResponse)
async def update_module_code(
    *,
    db: AsyncSession = Depends(get_db),
    component_id: str,
    module_id: str,
    code_update: schemas.ModuleCodeUpdate,
    account_id: Annotated[str, Header()]
):
    """Update module code"""
    # Validate component exists and belongs to account
    component = await crud_component.get_by_account_and_id(
        db,
        account_id=account_id,
        component_id=component_id
    )
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    module = await crud_module.get(db, id=module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")

    return await crud_module.update(
        db=db,
        db_obj=module,
        obj_in={"code": code_update.code}
    )

@router.patch("/{module_id}/config", response_model=schemas.ModuleResponse)
async def update_module_config(
    *,
    db: AsyncSession = Depends(get_db),
    component_id: str,
    module_id: str,
    config_update: schemas.ModuleConfigUpdate,
    account_id: Annotated[str, Header()]
):
    """Update module config schema"""
    # Validate component exists and belongs to account
    component = await crud_component.get_by_account_and_id(
        db,
        account_id=account_id,
        component_id=component_id
    )
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    module = await crud_module.get(db, id=module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")

    return await crud_module.update(
        db=db,
        db_obj=module,
        obj_in={"config_schema": config_update.config_schema}
    )

@router.delete("/{module_id}")
async def delete_module(
    *,
    db: AsyncSession = Depends(get_db),
    component_id: str,
    module_id: str,
    account_id: Annotated[str, Header()]
):
    """Delete module"""
    # Validate component exists and belongs to account
    component = await crud_component.get_by_account_and_id(
        db,
        account_id=account_id,
        component_id=component_id
    )
    if not component:
        raise HTTPException(status_code=404, detail="Component not found")

    module = await crud_module.get(db, id=module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found")

    await crud_module.delete(db=db, id=module_id)
    return {"status": "success"} 