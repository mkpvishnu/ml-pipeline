from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..dependencies import get_db

router = APIRouter(
    prefix="/groups",
    tags=["groups"]
)

@router.post("/", response_model=schemas.Group)
def create_group(group: schemas.GroupCreate, db: Session = Depends(get_db)):
    return crud.create_group(db=db, group=group)

@router.get("/account/{account_id}", response_model=List[schemas.Group])
def read_account_groups(account_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    groups = crud.get_groups_by_account(db, account_id=account_id, skip=skip, limit=limit)
    return groups

@router.get("/{group_id}", response_model=schemas.Group)
def read_group(group_id: int, db: Session = Depends(get_db)):
    db_group = crud.get_group(db, group_id=group_id)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group

@router.put("/{group_id}", response_model=schemas.Group)
def update_group(group_id: int, group: schemas.GroupCreate, db: Session = Depends(get_db)):
    db_group = crud.update_group(db, group_id=group_id, group=group)
    if db_group is None:
        raise HTTPException(status_code=404, detail="Group not found")
    return db_group

@router.delete("/{group_id}")
def delete_group(group_id: int, db: Session = Depends(get_db)):
    success = crud.delete_group(db, group_id=group_id)
    if not success:
        raise HTTPException(status_code=404, detail="Group not found")
    return {"detail": "Group deleted"} 