import importlib
import sys
import os
from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from backend.schemas.requestPayload import CanvasPayload

async def execute(db: AsyncSession, canvasPayload: CanvasPayload) -> List:
    print(f"Processing canvas with ID: {canvasPayload.canvas_id}")

    module_path = os.path.abspath(os.path.dirname(__file__))
    services_path = os.path.dirname(module_path)

    if services_path not in sys.path:
        sys.path.append(services_path)

    results = []
    for module in canvasPayload.canvas_config:
        identifier = module.identifier

        try:
            module_imported = importlib.import_module(f"services.{identifier}")
            if not hasattr(module_imported, identifier):
                print(f"Class '{identifier}' not found in module 'services.{identifier}'.")
                continue
            class_ = getattr(module_imported, identifier)
            instance = class_()
            result = await instance.process(canvasPayload)
        except ModuleNotFoundError as e:
            print(f"Module 'services.{identifier}' not found. Check the filename: {e}")
        except AttributeError as e:
            print(f"Class or method 'process' not found in module 'services.{identifier}': {e}")
        except Exception as e:
            print(f"Error processing module {identifier}: {e}")
    return results
