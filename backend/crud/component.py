from typing import List
from sqlalchemy.orm import Session

from .base import CRUDBase
from ..models.component import Component
from ..schemas.component import ComponentCreate, ComponentUpdate

class CRUDComponent(CRUDBase[Component, ComponentCreate, ComponentUpdate]):
    def get_by_group(self, db: Session, *, group_id: int, skip: int = 0, limit: int = 100) -> List[Component]:
        return db.query(Component).filter(Component.group_id == group_id).offset(skip).limit(limit).all()

component = CRUDComponent(Component) 