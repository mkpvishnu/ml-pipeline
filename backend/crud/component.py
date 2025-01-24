from typing import List, Optional
from sqlalchemy.orm import Session

from backend.crud.base import CRUDBase
from backend.models.component import Component
from backend.schemas.component import ComponentCreate, ComponentUpdate


class CRUDComponent(CRUDBase[Component, ComponentCreate, ComponentUpdate]):
    def get_multi_by_account(
        self,
        db: Session,
        *,
        account_id: str,
        group_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Component]:
        """Get components by account ID with optional group filter"""
        query = db.query(Component).filter(Component.account_id == account_id)
        if group_id:
            query = query.filter(Component.group_id == group_id)
        return query.offset(skip).limit(limit).all()

    def update_title(
        self, db: Session, *, db_obj: Component, title: str
    ) -> Component:
        """Update component title"""
        db_obj.name = title
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def set_active_module(
        self, db: Session, *, component_id: str, module_id: str
    ) -> Component:
        """Set active module for component"""
        db_obj = self.get(db, id=component_id)
        if db_obj:
            db_obj.active_module_id = module_id
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
        return db_obj


component = CRUDComponent(Component) 