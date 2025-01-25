#!/usr/bin/env python3
import sys
import os

# Add the project root directory to Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.db.init_db import init_db_sync

if __name__ == "__main__":
    print("Initializing database...")
    init_db_sync()
    print("Database initialization completed!") 