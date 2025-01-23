import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.db.session import get_db
from backend.db.utils import DatabaseUtils
from backend.models.database import Account, Canvas, Module

def test_connection():
    try:
        with get_db() as db:
            # Try to query accounts
            accounts = DatabaseUtils.get_multi(db, Account)
            print("\nAccounts:")
            for account in accounts:
                print(f"- {account.name} ({account.email})")

            # Query canvases
            canvases = DatabaseUtils.get_multi(db, Canvas)
            print("\nCanvases:")
            for canvas in canvases:
                print(f"- {canvas.name} (Version: {canvas.version})")

            # Query modules
            modules = DatabaseUtils.get_multi(db, Module)
            print("\nModules:")
            for module in modules:
                print(f"- {module.name} (Type: {module.type})")
            
            print("\nConnection successful!")
    except Exception as e:
        print(f"Connection failed: {str(e)}")

if __name__ == "__main__":
    test_connection() 