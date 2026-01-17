from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from core import models, schemas, auth
from datetime import datetime
import uuid
import shutil
from pathlib import Path

router = APIRouter(prefix="/pain-assessments", tags=["Pain Assessments"])

@router.post("", response_model=schemas.PainAssessment, status_code=status.HTTP_201_CREATED)
def create_pain_assessment(assessment: schemas.PainAssessmentCreate, current_user: models.User = Depends(auth.get_current_mobile_user), db: Session = Depends(get_db)):
    """Create a new pain assessment"""
    # Log incoming request for debugging
    print("=== CREATE PAIN ASSESSMENT (JSON) REQUEST ===")
    print(f"Pet ID: {assessment.pet_id}")
    print(f"Pet Name: {assessment.pet_name}")
    print(f"Pet Type: {assessment.pet_type}")
    print(f"Pain Level: {assessment.pain_level}")
    print(f"Pain Score: {assessment.pain_score}")
    print(f"User ID: {current_user.id}")
    print(f"Image URL: {assessment.image_url}")
    
    try:
        # Match old backend behavior: don't validate pet/user existence, just create the assessment
        # Store pet_type as-is without normalization (like old backend)
        
        db_assessment = models.PainAssessment(
            pet_id=assessment.pet_id,
            user_id=current_user.id,  # Use authenticated user's ID
            pet_name=assessment.pet_name or "Pet",
            pet_type=assessment.pet_type,  # Store as-is without normalization
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
        
        print("Creating pain assessment record in database...")
        db.add(db_assessment)
        db.commit()
        db.refresh(db_assessment)
        
        # Debug logging
        print(f"=== PAIN ASSESSMENT CREATED SUCCESSFULLY (JSON) ===")
        print(f"Assessment ID: {db_assessment.id}")
        print(f"Image URL: {db_assessment.image_url}")
        print(f"Pet Name: {db_assessment.pet_name}")
        print(f"Pain Level: {db_assessment.pain_level}")
        
        return db_assessment
        
    except Exception as e:
        print(f"ERROR: Failed to create pain assessment: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create pain assessment: {str(e)}")

@router.post("/with-image/", response_model=schemas.PainAssessment, status_code=status.HTTP_201_CREATED)
async def create_pain_assessment_with_image(
    pet_id: int = Form(...),
    pet_name: Optional[str] = Form(None),
    pet_type: Optional[str] = Form(None),
    pain_level: Optional[str] = Form(None),
    pain_score: int = Form(...),
    assessment_date: Optional[str] = Form(None),
    recommendations: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    basic_answers: Optional[str] = Form(None),
    assessment_answers: Optional[str] = Form(None),
    questions_completed: bool = Form(False),
    file: UploadFile = File(...),
    current_user: models.User = Depends(auth.get_current_mobile_user),
    db: Session = Depends(get_db)
):
    """Create a new pain assessment with image upload"""
    # Log incoming request for debugging
    print("=== CREATE PAIN ASSESSMENT WITH IMAGE REQUEST ===")
    print(f"Pet ID: {pet_id}")
    print(f"Pet Name: {pet_name}")
    print(f"Pet Type: {pet_type}")
    print(f"Pain Level: {pain_level}")
    print(f"Pain Score: {pain_score}")
    print(f"User ID: {current_user.id}")
    print(f"File: {file.filename if file else 'None'}")
    
    try:
        # Match old backend behavior: don't validate pet/user existence
        
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
                print(f"Image uploaded successfully: {image_url}")
            except Exception as e:
                print(f"ERROR: Failed to upload image: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")
            finally:
                file.file.close()
        
        db_assessment = models.PainAssessment(
            pet_id=pet_id,
            user_id=current_user.id,  # Use authenticated user's ID
            pet_name=pet_name,
            pet_type=pet_type,  # Store as-is without normalization
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
        
        print("Creating pain assessment record in database...")
        db.add(db_assessment)
        db.commit()
        db.refresh(db_assessment)
        
        # Debug logging
        print(f"=== PAIN ASSESSMENT CREATED SUCCESSFULLY ===")
        print(f"Assessment ID: {db_assessment.id}")
        print(f"Image URL: {db_assessment.image_url}")
        print(f"Pet Name: {db_assessment.pet_name}")
        print(f"Pain Level: {db_assessment.pain_level}")
        
        return db_assessment
            
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"ERROR: Failed to create pain assessment: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to create pain assessment: {str(e)}")

@router.get("", response_model=List[schemas.PainAssessment])
def get_pain_assessments(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    """Get all pain assessments. Regular users see only their assessments, admins see all."""
    try:
        print(f"=== GET PAIN ASSESSMENTS REQUEST ===")
        print(f"User type: {type(current_user).__name__}")
        print(f"User ID: {current_user.id if hasattr(current_user, 'id') else 'N/A'}")
        
        query = db.query(models.PainAssessment)
        
        # Filter by user_id for regular users (not admins)
        if isinstance(current_user, models.User):
            query = query.filter(models.PainAssessment.user_id == current_user.id)
            print(f"Filtering by user_id: {current_user.id}")
        else:
            print("Admin user - showing all assessments")
        # Admins see all pain assessments (no filter applied)
        
        assessments = query.offset(skip).limit(limit).all()
        print(f"Found {len(assessments)} pain assessments")
        return assessments
    except Exception as e:
        print(f"ERROR in get_pain_assessments: {str(e)}")
        import traceback
        traceback.print_exc()
        raise

@router.get("/{assessment_id}", response_model=schemas.PainAssessment)
def get_pain_assessment(
    assessment_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    """Get a specific pain assessment by id"""
    assessment = db.query(models.PainAssessment).filter(
        models.PainAssessment.id == assessment_id
    ).first()
    
    if not assessment:
        raise HTTPException(status_code=404, detail="Pain assessment not found")
    
    # Check if user has permission to view this assessment
    if isinstance(current_user, models.User) and assessment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this pain assessment")
    
    return assessment

@router.put("/{assessment_id}", response_model=schemas.PainAssessment)
def update_pain_assessment(
    assessment_id: int, 
    assessment_update: schemas.PainAssessmentUpdate, 
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    """Update a pain assessment"""
    db_assessment = db.query(models.PainAssessment).filter(
        models.PainAssessment.id == assessment_id
    ).first()
    
    if not db_assessment:
        raise HTTPException(status_code=404, detail="Pain assessment not found")
    
    # Check if user has permission to update this assessment
    if isinstance(current_user, models.User) and db_assessment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this pain assessment")
    
    # Update only provided fields
    update_data = assessment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_assessment, field, value)
    
    db.commit()
    db.refresh(db_assessment)
    return db_assessment

@router.delete("/{assessment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pain_assessment(
    assessment_id: int, 
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    """Delete a pain assessment"""
    db_assessment = db.query(models.PainAssessment).filter(
        models.PainAssessment.id == assessment_id
    ).first()
    
    if not db_assessment:
        raise HTTPException(status_code=404, detail="Pain assessment not found")
    
    # Check if user has permission to delete this assessment
    if isinstance(current_user, models.User) and db_assessment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this pain assessment")
    
    db.delete(db_assessment)
    db.commit()
    return None
