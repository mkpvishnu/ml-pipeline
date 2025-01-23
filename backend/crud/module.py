from typing import List, Optional, Union, Dict, Any
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
import uuid

from backend.models.database import Module, ModuleVersion
from backend.schemas.module import (
    ModuleCreate, 
    ModuleUpdate,
    ModuleVersionCreate,
    ModuleVersionUpdate
)

class ModuleCRUD:
    @staticmethod
    def get(db: Session, id: int) -> Optional[Module]:
        return db.query(Module).filter(Module.id == id).first()

    @staticmethod
    def get_by_module_id(db: Session, module_id: str) -> Optional[Module]:
        return db.query(Module).filter(Module.module_id == module_id).first()

    @staticmethod
    def get_multi(
        db: Session, 
        *, 
        filters: Dict = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Module]:
        query = db.query(Module)
        if filters:
            for field, value in filters.items():
                query = query.filter(getattr(Module, field) == value)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, *, obj_in: ModuleCreate) -> Module:
        obj_in_data = jsonable_encoder(obj_in)
        # Generate a unique module_id
        obj_in_data["module_id"] = str(uuid.uuid4())
        db_obj = Module(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update(
        db: Session, 
        *, 
        db_obj: Module, 
        obj_in: Union[ModuleUpdate, Dict[str, Any]]
    ) -> Module:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete(db: Session, *, id: int) -> Module:
        obj = db.query(Module).get(id)
        db.delete(obj)
        db.commit()
        return obj

    # Module version methods
    @staticmethod
    def create_version(
        db: Session, 
        *, 
        module_id: str, 
        obj_in: ModuleVersionCreate
    ) -> ModuleVersion:
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = ModuleVersion(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def get_version(
        db: Session, 
        *, 
        module_id: str, 
        version: str
    ) -> Optional[ModuleVersion]:
        return db.query(ModuleVersion).filter(
            ModuleVersion.module_id == module_id,
            ModuleVersion.version == version
        ).first()

    @staticmethod
    def get_versions(
        db: Session, 
        *, 
        module_id: str,
        skip: int = 0, 
        limit: int = 100
    ) -> List[ModuleVersion]:
        return db.query(ModuleVersion).filter(
            ModuleVersion.module_id == module_id
        ).offset(skip).limit(limit).all()

    @staticmethod
    def update_version(
        db: Session, 
        *, 
        db_obj: ModuleVersion, 
        obj_in: Union[ModuleVersionUpdate, Dict[str, Any]]
    ) -> ModuleVersion:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj 