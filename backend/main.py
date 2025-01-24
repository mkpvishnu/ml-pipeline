from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import accounts, groups, components, modules, canvas
from .db.database import engine
from .models.base import Base
from .core.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API for managing machine learning pipelines",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(accounts.router, prefix=settings.API_V1_STR)
app.include_router(groups.router, prefix=settings.API_V1_STR)
app.include_router(components.router, prefix=settings.API_V1_STR)
app.include_router(modules.router, prefix=settings.API_V1_STR)
app.include_router(canvas.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": settings.PROJECT_NAME,
        "version": "1.0.0",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    } 