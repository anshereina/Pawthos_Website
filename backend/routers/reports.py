from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from core import models, schemas
from core.database import get_db
import re
import os
import uuid
import shutil
from pathlib import Path
from datetime import datetime

router = APIRouter(prefix="/reports", tags=["reports"])

# Setup upload directory
BACKEND_DIR = Path(__file__).resolve().parent.parent
UPLOAD_DIR = BACKEND_DIR / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

def is_valid_image_file(filename: str) -> bool:
    """Check if the file is a valid image file"""
    return Path(filename).suffix.lower() in ALLOWED_EXTENSIONS

def generate_report_id(db: Session) -> str:
    """Generate a unique report ID in REP-0001 format"""
    last_report = db.query(models.Report).order_by(models.Report.id.desc()).first()
    if last_report:
        # Extract number from last report_id (e.g., "REP-0001" -> 1)
        match = re.search(r'REP-(\d+)', last_report.report_id)
        if match:
            next_num = int(match.group(1)) + 1
        else:
            next_num = 1
    else:
        next_num = 1
    
    return f"REP-{next_num:04d}"

@router.post("/upload-image")
async def upload_report_image(file: UploadFile = File(...)):
    """Upload an image for a report"""
    
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
    timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
    unique_filename = f"report_{timestamp}_{uuid.uuid4()}{file_extension}"
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

@router.post("/", response_model=schemas.Report)
def create_report(report: schemas.ReportCreate, db: Session = Depends(get_db)):
    """Create a new report"""
    report_id = generate_report_id(db)
    db_report = models.Report(
        report_id=report_id,
        title=report.title,
        description=report.description,
        status=report.status,
        submitted_by=report.submitted_by,
        submitted_by_email=report.submitted_by_email,
        image_url=report.image_url,
        recipient=report.recipient
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

@router.get("/", response_model=List[schemas.Report])
def get_reports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all reports with pagination"""
    reports = db.query(models.Report).offset(skip).limit(limit).all()
    return reports

@router.get("/{report_id}", response_model=schemas.Report)
def get_report(report_id: str, db: Session = Depends(get_db)):
    """Get a specific report by ID"""
    report = db.query(models.Report).filter(models.Report.report_id == report_id).first()
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.put("/{report_id}", response_model=schemas.Report)
def update_report(report_id: str, report_update: schemas.ReportUpdate, db: Session = Depends(get_db)):
    """Update a report"""
    db_report = db.query(models.Report).filter(models.Report.report_id == report_id).first()
    if db_report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    
    update_data = report_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_report, field, value)
    
    db.commit()
    db.refresh(db_report)
    return db_report

@router.delete("/{report_id}")
def delete_report(report_id: str, db: Session = Depends(get_db)):
    """Delete a report"""
    db_report = db.query(models.Report).filter(models.Report.report_id == report_id).first()
    if db_report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db.delete(db_report)
    db.commit()
    return {"message": "Report deleted successfully"}

@router.get("/search/", response_model=List[schemas.Report])
def search_reports(query: str, db: Session = Depends(get_db)):
    """Search reports by title or description"""
    reports = db.query(models.Report).filter(
        models.Report.title.ilike(f"%{query}%") | 
        models.Report.description.ilike(f"%{query}%")
    ).all()
    return reports 