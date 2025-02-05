from fastapi import APIRouter, Depends, Header, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated
import httpx

from backend.api.dependencies import (
    get_db, validate_account_id, validate_group, validate_module
)
from backend.crud import module as crud_module
from backend.crud import run as crud_run
from backend.schemas.module import (
    ModuleCreate, ModuleUpdate, ModuleResponse,
    ModuleCodeUpdate, ModuleConfigSchemaUpdate, ModuleUserConfigUpdate,
    CustomModuleCreate, ModuleType, ModuleStatus
)
from backend.core.config import get_settings

settings = get_settings()
router = APIRouter()

@router.post("/", response_model=ModuleResponse)
async def create_module(
    *,
    db: AsyncSession = Depends(get_db),
    module_in: ModuleCreate,
    group_id: Annotated[str, Header()],
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(validate_group)
):
    """Create new module"""
    try:
        return await crud_module.create(
            db=db,
            obj_in=module_in.model_dump(),
            account_id=account_id,
            group_id=group_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[ModuleResponse])
async def list_modules(
    *,
    db: AsyncSession = Depends(get_db),
    group_id: Annotated[str, Header()],
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(validate_group),
    skip: int = 0,
    limit: int = 100
):
    """List all modules for a group"""
    return await crud_module.get_multi_by_group(
        db,
        group_id=group_id,
        skip=skip,
        limit=limit
    )

@router.get("/{module_id}", response_model=ModuleResponse)
async def get_module(
    *,
    db: AsyncSession = Depends(get_db),
    module_id: str,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    
    #__: str = Depends(validate_module(module_id, account_id))
):
    """Get specific module"""
    return await crud_module.get_by_account_and_id(
        db,
        account_id=account_id,
        module_id=module_id
    )

@router.put("/{module_id}", response_model=ModuleResponse)
async def update_module(
    *,
    db: AsyncSession = Depends(get_db),
    module_id: str,
    module_in: ModuleUpdate,
    group_id: Annotated[str, Header()],
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
):
    """Update module"""
    module = await crud_module.get_by_account_and_id(
        db,
        account_id=account_id,
        module_id=module_id
    )
    try:
        return await crud_module.update(
            db=db,
            db_obj=module,
            obj_in=module_in.model_dump(exclude_unset=True)
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{module_id}/code", response_model=ModuleResponse)
async def update_module_code(
    *,
    db: AsyncSession = Depends(get_db),
    module_id: str,
    code_update: ModuleCodeUpdate,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(lambda x: validate_module(module_id, account_id, x))
):
    """Update module code"""
    module = await crud_module.get_by_account_and_id(
        db,
        account_id=account_id,
        module_id=module_id
    )
    return await crud_module.update_code(
        db=db,
        db_obj=module,
        code=code_update.code
    )

@router.patch("/{module_id}/config-schema", response_model=ModuleResponse)
async def update_module_config_schema(
    *,
    db: AsyncSession = Depends(get_db),
    module_id: str,
    config_update: ModuleConfigSchemaUpdate,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(lambda x: validate_module(module_id, account_id, x))
):
    """Update module config schema"""
    module = await crud_module.get_by_account_and_id(
        db,
        account_id=account_id,
        module_id=module_id
    )
    return await crud_module.update_config_schema(
        db=db,
        db_obj=module,
        config_schema=config_update.config_schema
    )

@router.patch("/{module_id}/user-config", response_model=ModuleResponse)
async def update_module_user_config(
    *,
    db: AsyncSession = Depends(get_db),
    module_id: str,
    config_update: ModuleUserConfigUpdate,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(lambda x: validate_module(module_id, account_id, x))
):
    """Update module user config"""
    module = await crud_module.get_by_account_and_id(
        db,
        account_id=account_id,
        module_id=module_id
    )
    return await crud_module.update_user_config(
        db=db,
        db_obj=module,
        user_config=config_update.user_config
    )

@router.post("/{module_id}/run")
async def run_module(
    *,
    db: AsyncSession = Depends(get_db),
    module_id: str,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(lambda x: validate_module(module_id, account_id, x)),
    background_tasks: BackgroundTasks
):
    """Run a module"""
    module = await crud_module.get_by_account_and_id(
        db,
        account_id=account_id,
        module_id=module_id
    )
    
    # Create run record
    run = await crud_run.create(
        db=db,
        account_id=account_id,
        module_id=module_id
    )
    
    # Trigger external service
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{settings.freshflow}/execute",
                json={
                    "run_id": run.id,
                    "module_id": module_id,
                    "user_config": module.user_config
                }
            )
            response.raise_for_status()
        except httpx.HTTPError as e:
            # Update run status to error
            await crud_run.update_status(
                db=db,
                db_obj=run,
                status="ERROR",
                error={"message": str(e)}
            )
            raise HTTPException(
                status_code=500,
                detail=f"Failed to trigger external service: {str(e)}"
            )
    
    return run

@router.delete("/{module_id}")
async def delete_module(
    *,
    db: AsyncSession = Depends(get_db),
    module_id: str,
    account_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(lambda x: validate_module(module_id, account_id, x))
):
    """Delete module"""
    module = await crud_module.get_by_account_and_id(
        db,
        account_id=account_id,
        module_id=module_id
    )
    try:
        await crud_module.delete(db=db, db_obj=module)
        return {"status": "success"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/custom", response_model=ModuleResponse)
async def create_custom_module(
    *,
    db: AsyncSession = Depends(get_db),
    module_in: CustomModuleCreate,
    group_id: Annotated[str, Header()],
    account_id: Annotated[str, Header()],
    module_id: Annotated[str, Header()],
    _: str = Depends(validate_account_id),
    __: str = Depends(validate_group)
):
    """Create a custom module based on an existing default module"""
    # First, get the parent module
    parent_module = await crud_module.get(db, id=module_id)
    if not parent_module:
        raise HTTPException(
            status_code=404,
            detail="Parent module not found"
        )
    
    # Verify parent module is a default module
    if parent_module.type != ModuleType.DEFAULT:
        raise HTTPException(
            status_code=400,
            detail="Custom modules can only be created from default modules"
        )
    
    # Create custom module object
    module_data = {
        "name": module_in.name,
        "description": module_in.description,
        "identifier": parent_module.identifier, # Inherit from parent
        "type": ModuleType.CUSTOM,
        "status": ModuleStatus.PUBLISHED,  # Custom modules also start as draft
        "parent_module_id": module_id,
        "config_schema": parent_module.config_schema,  # Inherit from parent
        "output_schema": parent_module.output_schema,  # Inherit from parent
        "user_config": module_in.user_config,  # Copy user_config from parent
        "code": parent_module.code,  # Inherit from parent
        "icon_url": parent_module.icon_url
    }
    
    try:
        return await crud_module.create(
            db=db,
            obj_in=module_data,
            account_id=account_id,
            group_id=group_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) 