import logging
from typing import Dict, Any, List, Optional
import asyncio
import importlib.util
import sys
from datetime import datetime
import traceback

from backend.models.database import Canvas, ModuleVersion
from backend.schemas.run import RunStatus, ModuleRunResult
from backend.core.cache import CacheManager  # We'll implement this later

logger = logging.getLogger(__name__)

class ModuleExecutionContext:
    """Context for module execution, containing shared variables and utilities"""
    def __init__(self, canvas_id: str, run_id: str):
        self.canvas_id = canvas_id
        self.run_id = run_id
        self.shared_vars: Dict[str, Any] = {}
        self.cache_manager = CacheManager()
        
    def get_var(self, name: str, default: Any = None) -> Any:
        """Get a shared variable"""
        return self.shared_vars.get(name, default)
        
    def set_var(self, name: str, value: Any):
        """Set a shared variable"""
        # Prefix variables to avoid conflicts
        prefixed_name = f"__ml_pipeline_{name}"
        self.shared_vars[prefixed_name] = value
        
    def get_cached_result(self, module_id: str, input_hash: str) -> Optional[Dict]:
        """Get cached result for a module"""
        return self.cache_manager.get(module_id, input_hash)

class ModuleExecutor:
    """Handles execution of individual modules"""
    
    @staticmethod
    async def execute_module(
        module: ModuleVersion,
        context: ModuleExecutionContext,
        previous_results: Dict[str, Any] = None
    ) -> ModuleRunResult:
        """Execute a single module"""
        start_time = datetime.utcnow()
        
        result = ModuleRunResult(
            module_id=module.module_id,
            version=module.version,
            status=RunStatus.RUNNING,
            started_at=start_time
        )
        
        try:
            # Create a new module namespace
            namespace = {
                'context': context,
                'previous_results': previous_results or {},
                'cached_results': [],  # List to store variables to cache
                'logger': logger
            }
            
            # Execute the module code
            exec(module.code, namespace)
            
            # Handle caching if specified
            if namespace.get('cached_results'):
                cache_data = {
                    var: namespace.get(var) 
                    for var in namespace['cached_results'] 
                    if var in namespace
                }
                if cache_data:
                    context.cache_manager.set(
                        module.module_id,
                        str(hash(str(previous_results))),  # Simple input hash
                        cache_data
                    )
            
            # Update result
            result.status = RunStatus.COMPLETED
            result.output = {
                k: v for k, v in namespace.items()
                if not k.startswith('__') and k not in [
                    'context', 'previous_results', 'cached_results', 'logger'
                ]
            }
            
        except Exception as e:
            logger.error(f"Error executing module {module.module_id}: {str(e)}")
            result.status = RunStatus.FAILED
            result.error = {
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        
        finally:
            end_time = datetime.utcnow()
            result.completed_at = end_time
            result.execution_time = (end_time - start_time).total_seconds()
        
        return result

class CanvasExecutor:
    """Handles execution of entire canvas"""
    
    def __init__(self, canvas: Canvas):
        self.canvas = canvas
        self.context = ModuleExecutionContext(
            canvas_id=canvas.canvas_id,
            run_id=str(datetime.utcnow().timestamp())
        )
    
    async def execute(self) -> Dict[str, ModuleRunResult]:
        """Execute all modules in the canvas in order"""
        results = {}
        module_order = self._get_execution_order()
        
        for module_id in module_order:
            module_config = self.canvas.module_config[module_id]
            module_version = module_config.get("version")
            
            # Get previous results for this module
            previous_results = {
                k: v.output for k, v in results.items()
                if v.status == RunStatus.COMPLETED
            }
            
            # Execute module
            result = await ModuleExecutor.execute_module(
                module_version,
                self.context,
                previous_results
            )
            
            results[module_id] = result
            
            # Stop execution if module failed
            if result.status == RunStatus.FAILED:
                break
        
        return results
    
    def _get_execution_order(self) -> List[str]:
        """Get the execution order of modules"""
        modules = list(self.canvas.module_config.items())
        modules.sort(key=lambda x: x[1].get("execution_order", 0))
        return [m[0] for m in modules] 