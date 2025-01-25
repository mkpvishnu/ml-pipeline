import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import logging
from sqlalchemy import text
from fastapi.responses import HTMLResponse
import markdown2
import os

from backend.core.config import settings
from backend.db.session import engine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ML Pipeline API",
    description="API for ML Pipeline orchestration",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
from backend.api.api import api_router
app.include_router(api_router, prefix="/api/v1")

def get_readme_content():
    """Read and convert README.md to HTML"""
    readme_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'README.md')
    try:
        with open(readme_path, 'r') as f:
            content = f.read()
            # Convert markdown to HTML with extras
            html_content = markdown2.markdown(
                content,
                extras=['fenced-code-blocks', 'tables', 'break-on-newline']
            )
            return html_content
    except FileNotFoundError:
        return "<h1>README.md not found</h1>"

@app.get("/", response_class=HTMLResponse)
async def homepage():
    """Homepage displaying README content"""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>ML Pipeline Documentation</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
            body {{
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                line-height: 1.6;
                max-width: 800px;
                margin: 0 auto;
                padding: 2rem;
                color: #333;
            }}
            pre {{
                background-color: #f6f8fa;
                border-radius: 6px;
                padding: 16px;
                overflow: auto;
            }}
            code {{
                font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
                font-size: 85%;
            }}
            h1, h2, h3, h4, h5, h6 {{
                margin-top: 24px;
                margin-bottom: 16px;
                font-weight: 600;
                line-height: 1.25;
            }}
            a {{
                color: #0366d6;
                text-decoration: none;
            }}
            a:hover {{
                text-decoration: underline;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 1rem 0;
            }}
            th, td {{
                border: 1px solid #dfe2e5;
                padding: 6px 13px;
            }}
            tr:nth-child(2n) {{
                background-color: #f6f8fa;
            }}
        </style>
    </head>
    <body>
        <div class="content">
            {get_readme_content()}
        </div>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    logger.info("Health check endpoint accessed")
    return {
        "status": "ok",
        "message": "ML Pipeline API is running"
    }

@app.on_event("startup")
async def startup():
    logger.info("Starting application...")
    logger.info(f"Server running on http://0.0.0.0:8000")
    logger.info(f"Database host: {settings.DB_HOST}")
    logger.info(f"Database port: {settings.DB_PORT}")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Shutting down application...")
    await engine.dispose()

if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        workers=1
    )