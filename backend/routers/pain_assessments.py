from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from core import models, schemas
from datetime import datetime
import uuid
import shutil
from pathlib import Path

router = APIRouter(prefix="/pain-assessments", tags=["Pain Assessments"])

@router.post("/", response_model=schemas.PainAssessment, status_code=status.HTTP_201_CREATED)
def create_pain_assessment(assessment: schemas.PainAssessmentCreate, db: Session = Depends(get_db)):
    """Create a new pain assessment"""
    # Verify pet exists
    pet = db.query(models.Pet).filter(models.Pet.id == assessment.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == assessment.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db_assessment = models.PainAssessment(
        pet_id=assessment.pet_id,
        user_id=assessment.user_id,
        pet_name=assessment.pet_name,
        pet_type=assessment.pet_type,
        pain_level=assessment.pain_level,
        pain_score=assessment.pain_score,
        assessment_date=assessment.assessment_date,
        recommendations=assessment.recommendations,
        notes=assessment.notes,
        image_url=assessment.image_url,
        basic_answers=assessment.basic_answers,
        assessment_answers=assessment.assessment_answers,
        questions_completed=assessment.questions_completed,
        created_at=datetime.utcnow()
    )
    
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.post("/with-image/", response_model=schemas.PainAssessment, status_code=status.HTTP_201_CREATED)
async def create_pain_assessment_with_image(
    pet_id: int = Form(...),
    user_id: int = Form(...),
    pet_name: str = Form(...),
    pet_type: str = Form(...),
    pain_level: str = Form(...),
    pain_score: Optional[int] = Form(None),
    assessment_date: str = Form(...),
    recommendations: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    basic_answers: Optional[str] = Form(None),
    assessment_answers: Optional[str] = Form(None),
    questions_completed: bool = Form(False),
    file: Optional[UploadFile] = File(None),  # Changed from 'image' to 'file' to match mobile app
    db: Session = Depends(get_db)
):
    """Create a new pain assessment with image upload"""
    # Verify pet exists
    pet = db.query(models.Pet).filter(models.Pet.id == pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    # Verify user exists
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Handle image upload
    image_url = None
    if file:
        # Validate file type
        allowed_extensions = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
        file_extension = Path(file.filename).suffix.lower()
        if file_extension not in allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(allowed_extensions)}"
            )
        
        # Validate file size (max 10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=400,
                detail="File too large. Maximum size is 10MB."
            )
        
        # Generate unique filename and save (absolute path under backend/uploads)
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        backend_dir = Path(__file__).resolve().parent.parent
        upload_dir = backend_dir / "uploads"
        upload_dir.mkdir(parents=True, exist_ok=True)
        file_path = upload_dir / unique_filename
        
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            image_url = f"/uploads/{unique_filename}"
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")
        finally:
            file.file.close()
    
    db_assessment = models.PainAssessment(
        pet_id=pet_id,
        user_id=user_id,
        pet_name=pet_name,
        pet_type=pet_type,
        pain_level=pain_level,
        pain_score=pain_score,
        assessment_date=assessment_date,
        recommendations=recommendations,
        notes=notes,
        image_url=image_url,
        basic_answers=basic_answers,
        assessment_answers=assessment_answers,
        questions_completed=questions_completed,
        created_at=datetime.utcnow()
    )
    
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.get("/", response_model=List[schemas.PainAssessment])
def get_pain_assessments(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """Get all pain assessments"""
    assessments = db.query(models.PainAssessment).offset(skip).limit(limit).all()
    return assessments

@router.get("/{assessment_id}", response_model=schemas.PainAssessment)
def get_pain_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """Get a specific pain assessment by id"""
    assessment = db.query(models.PainAssessment).filter(
        models.PainAssessment.id == assessment_id
    ).first()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Pain assessment not found")
    
    return assessment

@router.put("/{assessment_id}", response_model=schemas.PainAssessment)
def update_pain_assessment(
    assessment_id: int, 
    assessment_update: schemas.PainAssessmentUpdate, 
    db: Session = Depends(get_db)
):
    """Update a pain assessment"""
    db_assessment = db.query(models.PainAssessment).filter(
        models.PainAssessment.id == assessment_id
    ).first()
    
    if not db_assessment:
        raise HTTPException(status_code=404, detail="Pain assessment not found")
    
    # Update only provided fields
    update_data = assessment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_assessment, field, value)
    
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pain_assessment(assessment_id: int, db: Session = Depends(get_db)):
    """Delete a pain assessment"""
    db_assessment = db.query(models.PainAssessment).filter(
        models.PainAssessment.id == assessment_id
    ).first()
    
    if not db_assessment:
        raise HTTPException(status_code=404, detail="Pain assessment not found")
    
    db.delete(db_assessment)
    db.commit()
    return None
