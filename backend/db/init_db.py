import asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db.session import engine, AsyncSessionLocal
from backend.db.base import Base
from backend.core.config import settings

# Import all models to ensure they are registered with SQLAlchemy
from backend.models.account import Account
from backend.models.group import Group
from backend.models.module import Module
from backend.models.canvas import Canvas
from backend.models.run import Run

async def init_db() -> None:
    """Initialize the database.
    
    This will:
    1. Create all tables
    2. Add any initial data if needed
    """
    try:
        # Create tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.drop_all)  # Drop existing tables
            await conn.run_sync(Base.metadata.create_all)  # Create new tables
        await engine.dispose()
        
        # Initialize with any seed data if needed
        async with AsyncSessionLocal() as session:
            await create_initial_data(session)
            await session.commit()
            
        print("Database initialized successfully!")
        
    except Exception as e:
        print(f"Error initializing database: {str(e)}")
        raise

async def create_initial_data(db: AsyncSession) -> None:
    """Create initial data in the database.
    
    Add any seed data, initial users, or required records here.
    """
    # Add any initial data here if needed
    pass

def init_db_sync():
    """Synchronous wrapper for database initialization"""
    asyncio.run(init_db())

if __name__ == "__main__":
    init_db_sync() 