from typing import List, Dict
from sqlalchemy.orm import Session

from backend.crud.base import CRUDBase
from backend.models.module import Module
from backend.schemas.module import ModuleCreate, ModuleUpdate


class CRUDModule(CRUDBase[Module, ModuleCreate, ModuleUpdate]):
    def get_multi_by_component(
        self, db: Session, *, component_id: str, skip: int = 0, limit: int = 100
    ) -> List[Module]:
        """Get modules by component ID"""
        return (
            db.query(Module)
            .filter(Module.component_id == component_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_code(
        self, db: Session, *, db_obj: Module, code: str
    ) -> Module:
        """Update module code"""
        db_obj.code = code
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_config_schema(
        self, db: Session, *, db_obj: Module, config_schema: Dict
    ) -> Module:
        """Update module config schema"""
        db_obj.config_schema = config_schema
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_name(
        self, db: Session, *, db_obj: Module, name: str
    ) -> Module:
        """Update module name"""
        db_obj.name = name
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


module = CRUDModule(Module) 