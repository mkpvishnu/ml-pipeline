import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import logging
from datetime import datetime
import uuid

from backend.db.init_db import init_db, drop_db
from backend.db.session import get_db
from backend.db.utils import DatabaseUtils
from backend.models.database import Account, Canvas, Module, ModuleVersion

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_sample_data():
    """Create sample data for testing."""
    with get_db() as db:
        # Create sample account
        account = DatabaseUtils.create(
            db,
            Account,
            name="Test User",
            email="test@example.com",
            account_type="personal",
            settings={"theme": "light"}
        )
        logger.info(f"Created account: {account.name}")

        # Create sample canvas
        canvas = DatabaseUtils.create(
            db,
            Canvas,
            canvas_id=str(uuid.uuid4()),
            account_id=account.id,
            name="Ticket Classifier",
            description="ML pipeline for ticket classification",
            version="v1",
            module_config={
                "positions": {
                    "data-1": {"x": 100, "y": 100},
                    "preprocess-1": {"x": 400, "y": 100},
                    "training-1": {"x": 700, "y": 100}
                },
                "connections": [
                    {"source": "data-1", "target": "preprocess-1"},
                    {"source": "preprocess-1", "target": "training-1"}
                ]
            },
            schedule_config={
                "frequency": "daily",
                "start_time": "02:00",
                "active": True
            }
        )
        logger.info(f"Created canvas: {canvas.name}")

        # Create sample modules
        modules = [
            {
                "name": "ClickHouse Data Source",
                "type": "data",
                "category": "Data",
                "description": "Fetches ticket data from ClickHouse",
                "code": """
from clickhouse_driver import Client

def fetch_tickets():
    client = Client(host='localhost', port=9000)
    return client.execute('SELECT * FROM tickets LIMIT 1000')
"""
            },
            {
                "name": "Ticket Preprocessor",
                "type": "preprocess",
                "category": "Preprocessing",
                "description": "Cleans and preprocesses ticket data",
                "code": """
import spacy

def preprocess_tickets(tickets):
    nlp = spacy.load('en_core_web_sm')
    return [preprocess_ticket(ticket) for ticket in tickets]
"""
            },
            {
                "name": "BERT Classifier",
                "type": "training",
                "category": "Model",
                "description": "Trains BERT model for classification",
                "code": """
from transformers import AutoModelForSequenceClassification

def train_model(data):
    model = AutoModelForSequenceClassification.from_pretrained('bert-base-uncased')
    # Training code here
    return model
"""
            }
        ]

        for module_data in modules:
            module = DatabaseUtils.create(
                db,
                Module,
                module_id=str(uuid.uuid4()),
                account_id=account.id,
                name=module_data["name"],
                type=module_data["type"],
                category=module_data["category"],
                description=module_data["description"]
            )
            
            # Create module version
            version = DatabaseUtils.create(
                db,
                ModuleVersion,
                module_id=module.module_id,
                version="v1",
                code=module_data["code"],
                config={},
                requirements=["transformers", "torch", "spacy"]
            )
            logger.info(f"Created module: {module.name} with version {version.version}")

def setup_database():
    """Set up database with sample data."""
    try:
        logger.info("Dropping existing database...")
        drop_db()
        
        logger.info("Initializing database...")
        init_db()
        
        logger.info("Creating sample data...")
        create_sample_data()
        
        logger.info("Database setup completed successfully!")
        
    except Exception as e:
        logger.error(f"Error setting up database: {str(e)}")
        raise

if __name__ == "__main__":
    setup_database() 