import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import FileResponse
from typing import List
import shutil
from pathlib import Path
from datetime import datetime
from sqlalchemy.orm import Session
from core.database import get_db
from core.models import User, Pet
from core.auth import get_current_user

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

@router.post("/upload-user-photo")
async def upload_user_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user profile photo (for mobile app)"""
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower() if file.filename else '.jpg'
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"user_{current_user.id}_{timestamp}{file_extension}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update user photo URL in database
        photo_url = f"/uploads/{filename}"
        current_user.photo_url = photo_url
        db.commit()
        
        return {"photo_url": photo_url}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload photo: {str(e)}")
    finally:
        file.file.close()

@router.post("/upload-pet-photo")
async def upload_pet_photo(
    pet_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload pet photo (for mobile app)"""
    try:
        # Verify pet belongs to user
        pet = db.query(Pet).filter(Pet.id == pet_id, Pet.user_id == current_user.id).first()
        if not pet:
            raise HTTPException(status_code=404, detail="Pet not found")
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower() if file.filename else '.jpg'
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"pet_{pet_id}_{timestamp}{file_extension}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Update pet photo URL in database
        photo_url = f"/uploads/{filename}"
        pet.photo_url = photo_url
        pet.updated_at = datetime.utcnow()
        db.commit()
        
        return {"photo_url": photo_url}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload photo: {str(e)}")
    finally:
        file.file.close()

