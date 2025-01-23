from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import accounts, canvases, modules, runs
from backend.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="ML Pipeline API",
    description="API for ML Pipeline Backend",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(accounts.router, prefix="/api/accounts", tags=["accounts"])
app.include_router(canvases.router, prefix="/api/canvases", tags=["canvases"])
app.include_router(modules.router, prefix="/api/modules", tags=["modules"])
app.include_router(runs.router, prefix="/api/runs", tags=["runs"])

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"} 