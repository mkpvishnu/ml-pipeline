import logging
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from backend.db.base import Base
from backend.db.session import engine
from backend.core.config import get_settings
from backend.schemas.base import AccountType
from backend.crud.account import account
from backend.schemas.account import AccountCreate

settings = get_settings()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def init_db(db: Session) -> None:
    """Initialize database"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("Created all database tables")

        # Create default admin account if it doesn't exist
        admin_email = "admin@example.com"
        if not account.get_by_email(db, email=admin_email):
            admin = AccountCreate(
                name="Admin",
                email=admin_email,
                account_type=AccountType.ENTERPRISE,
                settings={"is_admin": True}
            )
            account.create(db, obj_in=admin)
            logger.info("Created admin account")

    except SQLAlchemyError as e:
        logger.error(f"Error initializing database: {str(e)}")
        raise


def drop_db() -> None:
    """Drop all tables (use with caution!)"""
    try:
        Base.metadata.drop_all(bind=engine)
        logger.info("Dropped all database tables")
    except SQLAlchemyError as e:
        logger.error(f"Error dropping database: {str(e)}")
        raise


if __name__ == "__main__":
    from backend.db.session import SessionLocal
    db = SessionLocal()
    try:
        logger.info("Creating initial data")
        init_db(db)
        logger.info("Initial data created")
    except Exception as e:
        logger.error(f"Error creating initial data: {str(e)}")
        raise
    finally:
        db.close() 