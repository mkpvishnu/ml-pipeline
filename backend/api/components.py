from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas
from ..dependencies import get_db

router = APIRouter(
    prefix="/components",
    tags=["components"]
)

@router.post("/", response_model=schemas.Component)
def create_component(component: schemas.ComponentCreate, db: Session = Depends(get_db)):
    return crud.create_component(db=db, component=component)

@router.get("/group/{group_id}", response_model=List[schemas.Component])
def read_group_components(group_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    components = crud.get_components_by_group(db, group_id=group_id, skip=skip, limit=limit)
    return components

@router.get("/{component_id}", response_model=schemas.Component)
def read_component(component_id: int, db: Session = Depends(get_db)):
    db_component = crud.get_component(db, component_id=component_id)
    if db_component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    return db_component

@router.put("/{component_id}", response_model=schemas.Component)
def update_component(component_id: int, component: schemas.ComponentCreate, db: Session = Depends(get_db)):
    db_component = crud.update_component(db, component_id=component_id, component=component)
    if db_component is None:
        raise HTTPException(status_code=404, detail="Component not found")
    return db_component

@router.delete("/{component_id}")
def delete_component(component_id: int, db: Session = Depends(get_db)):
    success = crud.delete_component(db, component_id=component_id)
    if not success:
        raise HTTPException(status_code=404, detail="Component not found")
    return {"detail": "Component deleted"} 