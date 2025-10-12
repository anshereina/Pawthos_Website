import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from typing import List
import shutil
from pathlib import Path

router = APIRouter(prefix="/uploads", tags=["File Uploads"])

# Resolve uploads directory relative to the backend root regardless of CWD
# backend/routers/file_uploads.py → backend/uploads
BACKEND_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

def is_valid_image_file(filename: str) -> bool:
    """Check if the file is a valid image file"""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

@router.post("/pain-assessment-image/")
async def upload_pain_assessment_image(file: UploadFile = File(...)):
    """Upload an image for pain assessment"""
    
    # Validate file type
    if not is_valid_image_file(file.filename):
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid file type. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate file size (max 10MB)
    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB."
        )
    
    # Generate unique filename
    file_extension = Path(file.filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return the URL that can be used to access the file
        return {
            "filename": unique_filename,
            "url": f"/uploads/{unique_filename}",
            "original_filename": file.filename
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading file: {str(e)}")
    finally:
        file.file.close()

@router.get("/{filename}")
async def get_uploaded_file(filename: str):
    """Serve uploaded files"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(file_path)

@router.delete("/{filename}")
async def delete_uploaded_file(filename: str):
    """Delete an uploaded file"""
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        file_path.unlink()
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting file: {str(e)}")

