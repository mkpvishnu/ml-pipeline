from fastapi import APIRouter

from backend.api.routers import accounts, groups, modules, canvas, run, execute, utils

api_router = APIRouter()

# Include all routers
api_router.include_router(accounts.router, prefix="/accounts", tags=["accounts"])
api_router.include_router(groups.router, prefix="/groups", tags=["groups"])
api_router.include_router(modules.router, prefix="/modules", tags=["modules"])
api_router.include_router(canvas.router, prefix="/canvas", tags=["canvas"])
api_router.include_router(run.router, prefix="/runs", tags=["runs"])
api_router.include_router(execute.router, prefix="/execute", tags=["execute"])
api_router.include_router(utils.router, prefix="/utils", tags=["utils"])
