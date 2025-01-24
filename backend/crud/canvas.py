from typing import List, Dict
from sqlalchemy.orm import Session

from backend.crud.base import CRUDBase
from backend.models.canvas import Canvas
from backend.schemas.canvas import CanvasCreate, CanvasUpdate


class CRUDCanvas(CRUDBase[Canvas, CanvasCreate, CanvasUpdate]):
    def get_multi_by_account(
        self, db: Session, *, account_id: str, skip: int = 0, limit: int = 100
    ) -> List[Canvas]:
        """Get canvases by account ID"""
        return (
            db.query(Canvas)
            .filter(Canvas.account_id == account_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_name(
        self, db: Session, *, db_obj: Canvas, name: str
    ) -> Canvas:
        """Update canvas name"""
        db_obj.name = name
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_module_config(
        self, db: Session, *, db_obj: Canvas, module_config: Dict
    ) -> Canvas:
        """Update canvas module configuration"""
        db_obj.module_config = module_config
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj


canvas = CRUDCanvas(Canvas) 