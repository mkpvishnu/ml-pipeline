import asyncio
import sys
import os
from datetime import datetime

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.models.database import Account, Canvas, Module, ModuleVersion
from backend.schemas.canvas import ModulePosition
from backend.core.executor import CanvasExecutor
from backend.crud.account import AccountCRUD
from backend.crud.canvas import CanvasCRUD
from backend.crud.module import ModuleCRUD
from backend.api.dependencies import get_db

# Sample module codes
DATA_LOADER_CODE = """
import pandas as pd
import numpy as np

# Create sample data
data = pd.DataFrame({
    'feature1': np.random.rand(100),
    'feature2': np.random.rand(100),
    'target': np.random.randint(0, 2, 100)
})

# Store data in context for next modules
context.set_var('training_data', data)

# Specify what to cache
cached_results = ['data']

logger.info(f"Data shape: {data.shape}")
"""

PREPROCESSOR_CODE = """
# Get data from previous module
data = context.get_var('training_data')

# Simple preprocessing
from sklearn.preprocessing import StandardScaler

scaler = StandardScaler()
features = ['feature1', 'feature2']
data[features] = scaler.fit_transform(data[features])

# Store processed data
context.set_var('processed_data', data)
context.set_var('scaler', scaler)

# Cache preprocessed data and scaler
cached_results = ['data', 'scaler']

logger.info(f"Preprocessed data shape: {data.shape}")
"""

TRAINING_CODE = """
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression

# Get processed data
data = context.get_var('processed_data')

# Split data
features = ['feature1', 'feature2']
X = data[features]
y = data['target']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train model
model = LogisticRegression()
model.fit(X_train, y_train)

# Evaluate
train_score = model.score(X_train, y_train)
test_score = model.score(X_test, y_test)

# Store results
context.set_var('model', model)
context.set_var('model_scores', {
    'train_score': train_score,
    'test_score': test_score
})

# Cache model and scores
cached_results = ['model', 'model_scores']

logger.info(f"Train score: {train_score:.3f}, Test score: {test_score:.3f}")
"""

async def create_test_canvas():
    """Create a test canvas with modules"""
    db = next(get_db())
    
    try:
        # Create test account
        account = AccountCRUD.create(db, obj_in={
            "name": "Test User",
            "email": "test@example.com"
        })
        
        # Create modules
        modules = []
        for idx, (name, code) in enumerate([
            ("Data Loader", DATA_LOADER_CODE),
            ("Preprocessor", PREPROCESSOR_CODE),
            ("Model Trainer", TRAINING_CODE)
        ]):
            module = ModuleCRUD.create(db, obj_in={
                "name": name,
                "type": "python",
                "description": f"Test module {idx + 1}",
                "account_id": account.id
            })
            
            # Create module version
            version = ModuleCRUD.create_version(db, module_id=module.module_id, obj_in={
                "version": "v1",
                "code": code
            })
            
            modules.append((module, version))
        
        # Create canvas
        canvas = CanvasCRUD.create(db, obj_in={
            "name": "Test ML Pipeline",
            "description": "A test canvas with basic ML pipeline",
            "account_id": account.id,
            "module_config": {
                m.module_id: ModulePosition(
                    module_id=m.module_id,
                    version=v.version,
                    execution_order=i + 1
                ).dict()
                for i, (m, v) in enumerate(modules)
            }
        })
        
        return canvas
        
    except Exception as e:
        print(f"Error creating test canvas: {e}")
        raise

async def main():
    """Run the test"""
    try:
        # Create test canvas
        canvas = await create_test_canvas()
        print(f"Created test canvas: {canvas.name}")
        
        # Create executor
        executor = CanvasExecutor(canvas)
        
        # Execute canvas
        print("\nExecuting canvas...")
        results = await executor.execute()
        
        # Print results
        print("\nExecution results:")
        for module_id, result in results.items():
            print(f"\nModule {module_id}:")
            print(f"Status: {result.status}")
            print(f"Execution time: {result.execution_time:.2f}s")
            if result.error:
                print(f"Error: {result.error}")
            
            # Print module-specific outputs
            if result.status == "completed":
                if "model_scores" in result.output:
                    scores = result.output["model_scores"]
                    print(f"Train score: {scores['train_score']:.3f}")
                    print(f"Test score: {scores['test_score']:.3f}")
                
    except Exception as e:
        print(f"Error running test: {e}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 