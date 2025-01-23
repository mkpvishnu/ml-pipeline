from typing import List, Optional, Union, Dict, Any
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
import uuid

from backend.models.database import Canvas
from backend.schemas.canvas import CanvasCreate, CanvasUpdate

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
    def create(db: Session, *, obj_in: CanvasCreate) -> Canvas:
        obj_in_data = jsonable_encoder(obj_in)
        # Generate a unique canvas_id
        obj_in_data["canvas_id"] = str(uuid.uuid4())
        db_obj = Canvas(**obj_in_data)
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def update(
        db: Session, 
        *, 
        db_obj: Canvas, 
        obj_in: Union[CanvasUpdate, Dict[str, Any]]
    ) -> Canvas:
        obj_data = jsonable_encoder(db_obj)
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.model_dump(exclude_unset=True)
        
        # Handle module flow updates
        if "module_config" in update_data:
            # Ensure execution order is maintained
            modules = list(update_data["module_config"].values())
            modules.sort(key=lambda x: x["execution_order"])
            
            # Update positions and connections
            for i, module in enumerate(modules):
                module["execution_order"] = i + 1
            
            # Update the module_config with sorted modules
            update_data["module_config"] = {
                m["module_id"]: m for m in modules
            }
        
        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])
        
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def delete(db: Session, *, id: int) -> Canvas:
        obj = db.query(Canvas).get(id)
        db.delete(obj)
        db.commit()
        return obj

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