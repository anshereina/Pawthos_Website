from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core import models, schemas
from datetime import datetime

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
        assessment_date=assessment.assessment_date,
        recommendations=assessment.recommendations,
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
