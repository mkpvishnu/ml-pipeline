from typing import Any, Dict, List, Optional, Type, TypeVar
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import inspect
import logging

from backend.models.database import Base

logger = logging.getLogger(__name__)

ModelType = TypeVar("ModelType", bound=Base)

class DatabaseUtils:
    @staticmethod
    def get_by_id(db: Session, model: Type[ModelType], id: Any) -> Optional[ModelType]:
        """Get a record by ID."""
        try:
            return db.query(model).filter(model.id == id).first()
        except SQLAlchemyError as e:
            logger.error(f"Error getting {model.__name__} by id: {str(e)}")
            raise

    @staticmethod
    def get_multi(
        db: Session,
        model: Type[ModelType],
        *,
        skip: int = 0,
        limit: int = 100,
        **filters
    ) -> List[ModelType]:
        """Get multiple records with pagination and filtering."""
        try:
            query = db.query(model)
            for field, value in filters.items():
                if hasattr(model, field):
                    query = query.filter(getattr(model, field) == value)
            return query.offset(skip).limit(limit).all()
        except SQLAlchemyError as e:
            logger.error(f"Error getting multiple {model.__name__}: {str(e)}")
            raise

    @staticmethod
    def create(db: Session, model: Type[ModelType], **data) -> ModelType:
        """Create a new record."""
        try:
            db_obj = model(**data)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error creating {model.__name__}: {str(e)}")
            raise

    @staticmethod
    def update(
        db: Session,
        db_obj: ModelType,
        update_data: Dict[str, Any]
    ) -> ModelType:
        """Update a record."""
        try:
            obj_data = inspect(db_obj).dict
            for field, value in update_data.items():
                if field in obj_data:
                    setattr(db_obj, field, value)
            db.add(db_obj)
            db.commit()
            db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error updating {db_obj.__class__.__name__}: {str(e)}")
            raise

    @staticmethod
    def delete(db: Session, db_obj: ModelType) -> bool:
        """Delete a record."""
        try:
            db.delete(db_obj)
            db.commit()
            return True
        except SQLAlchemyError as e:
            db.rollback()
            logger.error(f"Error deleting {db_obj.__class__.__name__}: {str(e)}")
            raise

    @staticmethod
    def exists(db: Session, model: Type[ModelType], **filters) -> bool:
        """Check if a record exists."""
        try:
            query = db.query(model)
            for field, value in filters.items():
                if hasattr(model, field):
                    query = query.filter(getattr(model, field) == value)
            return db.query(query.exists()).scalar()
        except SQLAlchemyError as e:
            logger.error(f"Error checking existence of {model.__name__}: {str(e)}")
            raise

    @staticmethod
    def count(db: Session, model: Type[ModelType], **filters) -> int:
        """Count records with optional filtering."""
        try:
            query = db.query(model)
            for field, value in filters.items():
                if hasattr(model, field):
                    query = query.filter(getattr(model, field) == value)
            return query.count()
        except SQLAlchemyError as e:
            logger.error(f"Error counting {model.__name__}: {str(e)}")
            raise 