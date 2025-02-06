from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Dict
import boto3
import uuid
from datetime import datetime

from backend.api.dependencies import get_db
from backend.core.config import get_settings

settings = get_settings()
router = APIRouter()

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
    region_name=settings.AWS_REGION
)

@router.post("/upload", response_model=Dict[str, str])
async def upload_file(
    *,
    file: UploadFile = File(...),
):
    """Upload file to S3 and return the URL"""
    try:
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        
        # Generate S3 path with year/month structure
        current_date = datetime.utcnow()
        s3_path = f"{current_date.year}/{current_date.month:02d}/{unique_filename}"
        
        # Upload to S3
        s3_client.upload_fileobj(
            file.file,
            settings.AWS_BUCKET_NAME,
            s3_path,
            ExtraArgs={
                "ContentType": file.content_type,
                "ACL": "public-read"  # Make the file publicly accessible
            }
        )
        
        # Generate the file URL
        file_url = f"https://{settings.AWS_BUCKET_NAME}.s3.{settings.AWS_REGION}.amazonaws.com/{s3_path}"
        
        return {
            "url": file_url
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}"
        )
    finally:
        file.file.close() 