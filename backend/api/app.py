from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.routers import accounts, canvases, modules, runs
from backend.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with actual origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(accounts.router, prefix=f"{settings.API_V1_PREFIX}/accounts", tags=["accounts"])
app.include_router(canvases.router, prefix=f"{settings.API_V1_PREFIX}/canvases", tags=["canvases"])
app.include_router(modules.router, prefix=f"{settings.API_V1_PREFIX}/modules", tags=["modules"])
app.include_router(runs.router, prefix=f"{settings.API_V1_PREFIX}/runs", tags=["runs"])

@app.get("/")
def root():
    return {
        "message": "Welcome to ML Pipeline API",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"} 