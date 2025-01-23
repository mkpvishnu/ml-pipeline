from typing import List, Optional, Union, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from fastapi.encoders import jsonable_encoder
import uuid
from datetime import datetime
from sqlalchemy.exc import SQLAlchemyError
import logging

from backend.models.database import CanvasRun, ModuleRunResult
from backend.schemas.run import (
    CanvasRunCreate, 
    CanvasRunUpdate,
    RunStatus,
    ModuleRunStats
)

logger = logging.getLogger(__name__)

class RunCRUD:
    @staticmethod
    def get(db: Session, id: int) -> Optional[CanvasRun]:
        return db.query(CanvasRun).filter(CanvasRun.id == id).first()

    @staticmethod
    def get_by_run_id(db: Session, run_id: str) -> Optional[CanvasRun]:
        return db.query(CanvasRun).filter(CanvasRun.run_id == run_id).first()

    @staticmethod
    def get_multi(
        db: Session, 
        *, 
        canvas_id: Optional[str] = None,
        status: Optional[RunStatus] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[CanvasRun]:
        query = db.query(CanvasRun)
        if canvas_id:
            query = query.filter(CanvasRun.canvas_id == canvas_id)
        if status:
            query = query.filter(CanvasRun.status == status)
        return query.order_by(desc(CanvasRun.started_at)).offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, *, obj_in: CanvasRunCreate) -> CanvasRun:
        obj_in_data = jsonable_encoder(obj_in)
        # Generate a unique run_id
        obj_in_data["run_id"] = str(uuid.uuid4())
        obj_in_data["started_at"] = datetime.utcnow()
        db_obj = CanvasRun(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update(
        db: Session, 
        *, 
        db_obj: CanvasRun, 
        obj_in: Union[CanvasRunUpdate, Dict[str, Any]]
    ) -> CanvasRun:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        # Handle status updates
        if "status" in update_data:
            current_time = datetime.utcnow()
            if update_data["status"] in [RunStatus.COMPLETED, RunStatus.FAILED, RunStatus.CANCELLED]:
                update_data["completed_at"] = current_time
                if db_obj.started_at:
                    update_data["execution_time"] = (current_time - db_obj.started_at).total_seconds()
        
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete(db: Session, *, id: int) -> CanvasRun:
        obj = db.query(CanvasRun).get(id)
        db.delete(obj)
        db.commit()
        return obj

    @staticmethod
    def get_module_stats(
        db: Session, 
        *, 
        module_id: str,
        canvas_id: Optional[str] = None
    ) -> ModuleRunStats:
        """Get statistics for a specific module's runs"""
        query = db.query(
            func.count().label('total_runs'),
            func.avg(ModuleRunResult.execution_time).label('avg_execution_time'),
            func.sum(case(
                (ModuleRunResult.status == RunStatus.COMPLETED, 1),
                else_=0
            )).label('success_count'),
            func.sum(case(
                (ModuleRunResult.status == RunStatus.FAILED, 1),
                else_=0
            )).label('error_count')
        ).filter(ModuleRunResult.module_id == module_id)

        if canvas_id:
            query = query.filter(CanvasRun.canvas_id == canvas_id)

        result = query.first()

        # Get the last run
        last_run = db.query(ModuleRunResult).filter(
            ModuleRunResult.module_id == module_id
        ).order_by(desc(ModuleRunResult.started_at)).first()

        return ModuleRunStats(
            total_runs=result.total_runs or 0,
            success_rate=(result.success_count / result.total_runs * 100) if result.total_runs else 0,
            avg_execution_time=result.avg_execution_time or 0,
            last_run_status=last_run.status if last_run else RunStatus.PENDING,
            last_run_at=last_run.completed_at if last_run else None,
            error_count=result.error_count or 0
        )

    @staticmethod
    def create_run(db: Session, *, canvas_id: str) -> Optional[CanvasRun]:
        try:
            run = CanvasRun(
                run_id=str(uuid.uuid4()),
                canvas_id=canvas_id,
                status="pending",
                started_at=datetime.utcnow(),
                module_runs={},
                metrics={},
                logs=[],
                error=None,
                cache_config={}
            )
            db.add(run)
            db.commit()
            db.refresh(run)
            return run
        except SQLAlchemyError as e:
            logger.error(f"Error creating canvas run: {str(e)}")
            db.rollback()
            return None

    @staticmethod
    def get_run(db: Session, run_id: str) -> Optional[CanvasRun]:
        try:
            return db.query(CanvasRun).filter(CanvasRun.run_id == run_id).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting run: {str(e)}")
            return None

    @staticmethod
    def get_runs_by_canvas(db: Session, canvas_id: str, skip: int = 0, limit: int = 100) -> List[CanvasRun]:
        try:
            return db.query(CanvasRun)\
                .filter(CanvasRun.canvas_id == canvas_id)\
                .order_by(CanvasRun.started_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting runs for canvas: {str(e)}")
            return []

    @staticmethod
    def update_run_status(
        db: Session,
        *,
        run_id: str,
        status: str,
        metrics: Dict[str, Any] = None,
        error: Dict[str, Any] = None
    ) -> Optional[CanvasRun]:
        try:
            run = RunCRUD.get_run(db, run_id)
            if not run:
                return None

            run.status = status
            if status == "completed":
                run.completed_at = datetime.utcnow()
            if metrics:
                run.metrics = metrics
            if error:
                run.error = error

            db.commit()
            db.refresh(run)
            return run
        except SQLAlchemyError as e:
            logger.error(f"Error updating run status: {str(e)}")
            db.rollback()
            return None

    @staticmethod
    def create_module_result(
        db: Session,
        *,
        run_id: str,
        module_id: str,
        status: str = "pending"
    ) -> Optional[ModuleRunResult]:
        try:
            result = ModuleRunResult(
                run_id=run_id,
                module_id=module_id,
                status=status,
                started_at=datetime.utcnow(),
                metrics={},
                error={}
            )
            db.add(result)
            db.commit()
            db.refresh(result)
            return result
        except SQLAlchemyError as e:
            logger.error(f"Error creating module run result: {str(e)}")
            db.rollback()
            return None

    @staticmethod
    def update_module_result(
        db: Session,
        *,
        run_id: str,
        module_id: str,
        status: str,
        metrics: Dict[str, Any] = None,
        cache_location: str = None,
        error: Dict[str, Any] = None
    ) -> Optional[ModuleRunResult]:
        try:
            result = db.query(ModuleRunResult)\
                .filter(
                    ModuleRunResult.run_id == run_id,
                    ModuleRunResult.module_id == module_id
                ).first()
            
            if not result:
                return None

            result.status = status
            if status == "completed":
                result.completed_at = datetime.utcnow()
            if metrics:
                result.metrics = metrics
            if cache_location:
                result.cache_location = cache_location
            if error:
                result.error = error

            db.commit()
            db.refresh(result)
            return result
        except SQLAlchemyError as e:
            logger.error(f"Error updating module run result: {str(e)}")
            db.rollback()
            return None

    @staticmethod
    def get_module_results(db: Session, run_id: str) -> List[ModuleRunResult]:
        try:
            return db.query(ModuleRunResult)\
                .filter(ModuleRunResult.run_id == run_id)\
                .all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting module results: {str(e)}")
            return [] 