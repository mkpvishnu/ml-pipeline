from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated

from backend.api.dependencies import get_db, validate_account_id
from backend.crud import component as crud_component
from backend.crud import module as crud_module
from backend.schemas import component as schemas

router = APIRouter(tags=["components"])

@router.post("/", response_model=schemas.ComponentResponse)
async def create_component(
    *,
    db: AsyncSession = Depends(get_db),
    component_in: schemas.ComponentCreate,
    account_id: Annotated[str, Header()]
):
    """Create new component"""
    return await crud_component.create(
        db=db,
        obj_in=component_in,
        account_id=account_id
    )

@router.get("/", response_model=List[schemas.ComponentResponse])
async def list_components(
    *,
    db: AsyncSession = Depends(get_db),
    account_id: Annotated[str, Header()],
    group_id: str = None,
    skip: int = 0,
    limit: int = 100
):
    """List components with optional group filter"""
    return await crud_component.get_multi_by_account(
        db, 
        account_id=account_id,
        group_id=group_id,
        skip=skip,
        limit=limit
    )

@router.get("/{component_id}", response_model=schemas.ComponentResponse)
async def get_component(
    *,
    db: AsyncSession = Depends(get_db),
    component_id: str,
    account_id: Annotated[str, Header()]
):
    """Get specific component"""
    component = await crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    return component

@router.patch("/{component_id}/title", response_model=schemas.ComponentResponse)
async def update_component_title(
    *,
    db: AsyncSession = Depends(get_db),
    component_id: str,
    title_update: schemas.ComponentTitleUpdate,
    account_id: Annotated[str, Header()]
):
    """Update component title"""
    component = await crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    return await crud_component.update_title(
        db=db, db_obj=component, title=title_update.title
    )

@router.post("/{component_id}/active", response_model=schemas.ComponentResponse)
async def set_active_module(
    *,
    db: AsyncSession = Depends(get_db),
    component_id: str,
    active_module: schemas.ComponentActiveModule,
    account_id: Annotated[str, Header()]
):
    """Set active module for component"""
    component = await crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    
    # Validate module exists and belongs to component
    module = await crud_module.get(db, id=active_module.module_id)
    if not module or module.component_id != component_id:
        raise HTTPException(status_code=404, detail="Module not found or not associated with component")
    
    return await crud_component.set_active_module(
        db=db,
        component_id=component_id,
        module_id=active_module.module_id
    )

@router.delete("/{component_id}")
async def delete_component(
    *,
    db: AsyncSession = Depends(get_db),
    component_id: str,
    account_id: Annotated[str, Header()]
):
    """Delete component"""
    component = await crud_component.get(db, id=component_id)
    if not component or component.account_id != account_id:
        raise HTTPException(status_code=404, detail="Component not found")
    await crud_component.remove(db=db, id=component_id)
    return {"status": "success"} 