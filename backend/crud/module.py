from typing import List, Optional, Union, Dict, Any
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
import uuid

from ..models.module import Module, ModuleVersion
from ..schemas.module import (
    ModuleCreate, 
    ModuleUpdate,
    ModuleVersionCreate,
    ModuleVersionUpdate
)
from .base import CRUDBase

class CRUDModule(CRUDBase[Module, ModuleCreate, ModuleUpdate]):
    def get_by_component(self, db: Session, *, component_id: int, skip: int = 0, limit: int = 100) -> List[Module]:
        return db.query(Module).filter(Module.component_id == component_id).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: ModuleCreate) -> Module:
        obj_in_data = jsonable_encoder(obj_in)
        obj_in_data["module_id"] = str(uuid.uuid4())  # Generate UUID for module_id
        db_obj = Module(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def get_by_module_id(self, db: Session, module_id: str) -> Optional[Module]:
        return db.query(Module).filter(Module.module_id == module_id).first()

class CRUDModuleVersion(CRUDBase[ModuleVersion, ModuleVersionCreate, ModuleVersionUpdate]):
    def get_by_module(self, db: Session, *, module_id: str, skip: int = 0, limit: int = 100) -> List[ModuleVersion]:
        return db.query(ModuleVersion)\
            .filter(ModuleVersion.module_id == module_id)\
            .offset(skip).limit(limit).all()

    def get_version(self, db: Session, *, module_id: str, version: str) -> Optional[ModuleVersion]:
        return db.query(ModuleVersion).filter(
            ModuleVersion.module_id == module_id,
            ModuleVersion.version == version
        ).first()

module = CRUDModule(Module)
module_version = CRUDModuleVersion(ModuleVersion) 