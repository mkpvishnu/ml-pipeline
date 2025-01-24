from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from typing import List, Annotated

from backend.api.dependencies import get_db, validate_account_id
from backend.crud import group as crud_group
from backend.schemas import group as schemas

router = APIRouter(prefix="/groups", tags=["groups"])

@router.post("/", response_model=schemas.GroupResponse)
def create_group(
    *,
    db: Session = Depends(get_db),
    group_in: schemas.GroupCreate,
    account_id: Annotated[str, Header()]
):
    """Create new group"""
    return crud_group.create(db=db, obj_in=group_in, account_id=account_id)

@router.get("/", response_model=List[schemas.GroupResponse])
def list_groups(
    *,
    db: Session = Depends(get_db),
    account_id: Annotated[str, Header()],
    skip: int = 0,
    limit: int = 100
):
    """List all groups for an account"""
    return crud_group.get_multi_by_account(
        db, account_id=account_id, skip=skip, limit=limit
    )

@router.get("/{group_id}", response_model=schemas.GroupResponse)
def get_group(
    *,
    db: Session = Depends(get_db),
    group_id: str,
    account_id: Annotated[str, Header()]
):
    """Get specific group"""
    group = crud_group.get(db, id=group_id)
    if not group or group.account_id != account_id:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@router.put("/{group_id}", response_model=schemas.GroupResponse)
def update_group(
    *,
    db: Session = Depends(get_db),
    group_id: str,
    group_in: schemas.GroupUpdate,
    account_id: Annotated[str, Header()]
):
    """Update group"""
    group = crud_group.get(db, id=group_id)
    if not group or group.account_id != account_id:
        raise HTTPException(status_code=404, detail="Group not found")
    return crud_group.update(db=db, db_obj=group, obj_in=group_in)

@router.delete("/{group_id}")
def delete_group(
    *,
    db: Session = Depends(get_db),
    group_id: str,
    account_id: Annotated[str, Header()]
):
    """Delete group"""
    group = crud_group.get(db, id=group_id)
    if not group or group.account_id != account_id:
        raise HTTPException(status_code=404, detail="Group not found")
    crud_group.remove(db=db, id=group_id)
    return {"status": "success"} 