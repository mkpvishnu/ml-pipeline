from typing import List, Optional, Union, Dict, Any
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
import uuid
from sqlalchemy.exc import SQLAlchemyError
import logging
from sqlalchemy import desc
from datetime import datetime

from ..models.canvas import Canvas, CanvasNode, CanvasExecution, CanvasModuleVersion
from ..schemas import canvas as canvas_schema
from .base import CRUDBase

logger = logging.getLogger(__name__)

class CRUDCanvas(CRUDBase[Canvas, canvas_schema.CanvasCreate, canvas_schema.CanvasUpdate]):
    def get_by_account(self, db: Session, *, account_id: int, skip: int = 0, limit: int = 100) -> List[Canvas]:
        return db.query(Canvas).filter(Canvas.account_id == account_id).offset(skip).limit(limit).all()

    def create(self, db: Session, *, obj_in: canvas_schema.CanvasCreate) -> Canvas:
        # First create the canvas with UUID
        canvas_data = obj_in.dict(exclude={'nodes'})
        canvas_data['canvas_id'] = str(uuid.uuid4())
        db_canvas = Canvas(**canvas_data)
        db.add(db_canvas)
        db.commit()
        db.refresh(db_canvas)

        # Then create the nodes
        for node in obj_in.nodes:
            node_data = node.dict()
            node_data['canvas_id'] = db_canvas.id
            db_node = CanvasNode(**node_data)
            db.add(db_node)
        
        db.commit()
        db.refresh(db_canvas)
        return db_canvas

    def update(self, db: Session, *, db_obj: Canvas, obj_in: canvas_schema.CanvasUpdate) -> Canvas:
        # Update canvas attributes
        canvas_data = obj_in.dict(exclude={'nodes'})
        for key, value in canvas_data.items():
            setattr(db_obj, key, value)

        # Delete existing nodes
        db.query(CanvasNode).filter(CanvasNode.canvas_id == db_obj.id).delete()

        # Create new nodes
        for node in obj_in.nodes:
            node_data = node.dict()
            node_data['canvas_id'] = db_obj.id
            db_node = CanvasNode(**node_data)
            db.add(db_node)

        db.commit()
        db.refresh(db_obj)
        return db_obj

class CRUDCanvasExecution(CRUDBase[CanvasExecution, canvas_schema.CanvasExecutionCreate, canvas_schema.CanvasExecutionCreate]):
    def get_by_canvas(self, db: Session, *, canvas_id: int, skip: int = 0, limit: int = 100) -> List[CanvasExecution]:
        return db.query(CanvasExecution)\
            .filter(CanvasExecution.canvas_id == canvas_id)\
            .order_by(desc(CanvasExecution.created_at))\
            .offset(skip).limit(limit).all()

    def update_status(
        self, 
        db: Session, 
        *, 
        execution_id: int, 
        status: str, 
        result: Optional[Dict[str, Any]] = None,
        error: Optional[str] = None
    ) -> Optional[CanvasExecution]:
        db_execution = self.get(db, id=execution_id)
        if db_execution:
            db_execution.status = status
            if status == "completed":
                db_execution.result = result
                db_execution.completed_at = datetime.utcnow()
            elif status == "failed":
                db_execution.error = error
                db_execution.completed_at = datetime.utcnow()
            elif status == "running":
                db_execution.started_at = datetime.utcnow()
            db.commit()
            db.refresh(db_execution)
        return db_execution

class CRUDCanvasModuleVersion(CRUDBase[CanvasModuleVersion, canvas_schema.CanvasModuleVersionCreate, canvas_schema.CanvasModuleVersionUpdate]):
    def get_by_canvas_and_module(
        self, 
        db: Session, 
        *, 
        canvas_id: str, 
        module_id: str
    ) -> List[CanvasModuleVersion]:
        return db.query(CanvasModuleVersion).filter(
            CanvasModuleVersion.canvas_id == canvas_id,
            CanvasModuleVersion.module_id == module_id
        ).all()

    def get_by_version(
        self, 
        db: Session, 
        *, 
        canvas_id: str, 
        module_id: str, 
        version: str
    ) -> Optional[CanvasModuleVersion]:
        return db.query(CanvasModuleVersion).filter(
            CanvasModuleVersion.canvas_id == canvas_id,
            CanvasModuleVersion.module_id == module_id,
            CanvasModuleVersion.version == version
        ).first()

canvas = CRUDCanvas(Canvas)
canvas_execution = CRUDCanvasExecution(CanvasExecution)
canvas_module_version = CRUDCanvasModuleVersion(CanvasModuleVersion)

class CanvasCRUD:
    @staticmethod
    def get(db: Session, id: int) -> Optional[Canvas]:
        return db.query(Canvas).filter(Canvas.id == id).first()

    @staticmethod
    def get_by_canvas_id(db: Session, canvas_id: str) -> Optional[Canvas]:
        return db.query(Canvas).filter(Canvas.canvas_id == canvas_id).first()

    @staticmethod
    def get_multi(
        db: Session, 
        *, 
        account_id: Optional[int] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Canvas]:
        query = db.query(Canvas)
        if account_id:
            query = query.filter(Canvas.account_id == account_id)
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, *, account_id: int, canvas_in: canvas_schema.CanvasCreate) -> Optional[Canvas]:
        try:
            canvas_data = canvas_in.model_dump()
            canvas_data["account_id"] = account_id
            canvas_data["canvas_id"] = str(uuid.uuid4())
            
            db_canvas = Canvas(**canvas_data)
            db.add(db_canvas)
            db.commit()
            db.refresh(db_canvas)
            return db_canvas
        except SQLAlchemyError as e:
            logger.error(f"Error creating canvas: {str(e)}")
            db.rollback()
            return None

    @staticmethod
    def get(db: Session, canvas_id: str) -> Optional[Canvas]:
        try:
            return db.query(Canvas).filter(Canvas.canvas_id == canvas_id).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting canvas: {str(e)}")
            return None

    @staticmethod
    def get_by_account(db: Session, account_id: int, skip: int = 0, limit: int = 100) -> List[Canvas]:
        try:
            return db.query(Canvas)\
                .filter(Canvas.account_id == account_id)\
                .offset(skip)\
                .limit(limit)\
                .all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting canvases for account: {str(e)}")
            return []

    @staticmethod
    def update(db: Session, *, canvas_id: str, canvas_in: canvas_schema.CanvasUpdate) -> Optional[Canvas]:
        try:
            db_canvas = CanvasCRUD.get(db, canvas_id)
            if not db_canvas:
                return None
            
            update_data = canvas_in.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(db_canvas, field, value)
            
            db.commit()
            db.refresh(db_canvas)
            return db_canvas
        except SQLAlchemyError as e:
            logger.error(f"Error updating canvas: {str(e)}")
            db.rollback()
            return None

    @staticmethod
    def delete(db: Session, canvas_id: str) -> bool:
        try:
            db_canvas = CanvasCRUD.get(db, canvas_id)
            if not db_canvas:
                return False
            
            db.delete(db_canvas)
            db.commit()
            return True
        except SQLAlchemyError as e:
            logger.error(f"Error deleting canvas: {str(e)}")
            db.rollback()
            return False

    @staticmethod
    def get_execution_order(canvas: Canvas) -> List[str]:
        """Get the execution order of modules in a canvas"""
        if not canvas.module_config:
            return []
        
        modules = list(canvas.module_config.values())
        modules.sort(key=lambda x: x["execution_order"])
        return [m["module_id"] for m in modules]

    @staticmethod
    def validate_connections(canvas: Canvas) -> bool:
        """Validate module connections in a canvas"""
        if not canvas.connections:
            return True
        
        module_ids = set(canvas.module_config.keys())
        
        for conn in canvas.connections:
            # Check if both modules exist in the canvas
            if conn["from_module"] not in module_ids or conn["to_module"] not in module_ids:
                return False
            
            # Check for circular dependencies
            if conn["from_module"] == conn["to_module"]:
                return False
            
            # Validate connection type
            if conn["connection_type"] not in ["sequential", "parallel", "conditional"]:
                return False
        
        return True

    @staticmethod
    def add_module_version(
        db: Session, 
        *,
        canvas_id: str,
        module_id: str,
        version: str,
        position_x: float = 0,
        position_y: float = 0,
        config: Dict[str, Any] = None
    ) -> Optional[CanvasModuleVersion]:
        try:
            module_version = CanvasModuleVersion(
                canvas_id=canvas_id,
                module_id=module_id,
                version=version,
                position_x=position_x,
                position_y=position_y,
                config=config or {}
            )
            db.add(module_version)
            db.commit()
            db.refresh(module_version)
            return module_version
        except SQLAlchemyError as e:
            logger.error(f"Error adding module version to canvas: {str(e)}")
            db.rollback()
            return None 