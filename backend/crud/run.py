from typing import List, Dict, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from backend.crud.base import CRUDBase
from backend.models.run import Run
from backend.schemas.run import RunCreate, RunUpdate


class CRUDRun(CRUDBase[Run, RunCreate, RunUpdate]):
    def get_multi_by_account(
        self, db: Session, *, account_id: str, skip: int = 0, limit: int = 100
    ) -> List[Run]:
        """Get runs by account ID"""
        return (
            db.query(Run)
            .filter(Run.account_id == account_id)
            .order_by(Run.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_multi_by_canvas(
        self, db: Session, *, canvas_id: str, skip: int = 0, limit: int = 100
    ) -> List[Run]:
        """Get runs by canvas ID"""
        return (
            db.query(Run)
            .filter(Run.canvas_id == canvas_id)
            .order_by(Run.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_status(
        self,
        db: Session,
        *,
        run_id: str,
        status: str,
        results: Optional[Dict] = None,
        error: Optional[Dict] = None
    ) -> Run:
        """Update run status with optional results and error"""
        db_obj = self.get(db, id=run_id)
        if db_obj:
            db_obj.status = status
            if results is not None:
                db_obj.results = results
            if error is not None:
                db_obj.error = error
            
            if status in ["completed", "failed", "cancelled"]:
                db_obj.completed_at = datetime.utcnow()
            
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
        return db_obj


run = CRUDRun(Run) 