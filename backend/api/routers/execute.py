from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Annotated

from backend.api.dependencies import get_db
from backend.core.services import process
from backend.crud import canvas as crud_canvas
from backend.schemas.requestPayload import CanvasPayload

router = APIRouter()

@router.post("/", response_model={})
async def execute(
    *,
    db: AsyncSession = Depends(get_db),
    canvasPayload: CanvasPayload
):
    canvas = await crud_canvas.get(db, id=canvasPayload.canvas_id)
    if not canvas:
        raise HTTPException(
            status_code=404,
            detail="Canvas not found"
        )
    return await process.execute(db=db, canvasPayload=canvasPayload)
