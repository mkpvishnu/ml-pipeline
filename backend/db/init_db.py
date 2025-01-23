import logging
from sqlalchemy.exc import SQLAlchemyError
from backend.db.session import engine
from backend.models.database import Base
from backend.config.settings import get_settings

logger = logging.getLogger(__name__)

def init_db() -> None:
    """Initialize the database with all tables."""
    settings = get_settings()
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Successfully initialized database tables")
        
    except SQLAlchemyError as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise

def drop_db() -> None:
    """Drop all tables from the database."""
    settings = get_settings()
    
    try:
        # Drop all tables
        Base.metadata.drop_all(bind=engine)
        logger.info("Successfully dropped all database tables")
        
    except SQLAlchemyError as e:
        logger.error(f"Error dropping database tables: {str(e)}")
        raise

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    init_db() 