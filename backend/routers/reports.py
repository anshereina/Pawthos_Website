from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core import models, schemas
from core.database import get_db
import re

router = APIRouter(prefix="/reports", tags=["reports"])

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
        submitted_by_email=report.submitted_by_email
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