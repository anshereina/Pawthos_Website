from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from core import models, schemas
from core.database import get_db
from core.auth import get_current_admin

router = APIRouter(prefix="/walk-ins", tags=["walk-ins"])

@router.get("/", response_model=List[schemas.WalkInRecord])
def get_walk_in_records(
    search: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Get all walk-in records with optional search and date filters"""
    query = db.query(models.WalkInRecord)
    
    # Apply search filter
    if search:
        query = query.filter(
            (models.WalkInRecord.client_name.ilike(f"%{search}%")) |
            (models.WalkInRecord.pet_name.ilike(f"%{search}%")) |
            (models.WalkInRecord.service_type.ilike(f"%{search}%"))
        )
    
    # Apply date range filter
    if date_from:
        query = query.filter(models.WalkInRecord.date >= date_from)
    if date_to:
        query = query.filter(models.WalkInRecord.date <= date_to)
    
    # Order by created_at descending (newest first)
    records = query.order_by(models.WalkInRecord.created_at.desc()).all()
    return records

@router.get("/{record_id}", response_model=schemas.WalkInRecord)
def get_walk_in_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Get a specific walk-in record by ID"""
    record = db.query(models.WalkInRecord).filter(models.WalkInRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Walk-in record not found")
    return record

@router.post("/", response_model=schemas.WalkInRecord)
def create_walk_in_record(
    record: schemas.WalkInRecordCreate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Create a new walk-in record"""
    db_record = models.WalkInRecord(**record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{record_id}", response_model=schemas.WalkInRecord)
def update_walk_in_record(
    record_id: int,
    record: schemas.WalkInRecordUpdate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Update a walk-in record"""
    db_record = db.query(models.WalkInRecord).filter(models.WalkInRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Walk-in record not found")
    
    # Update only provided fields
    update_data = record.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_record, field, value)
    
    db.commit()
    db.refresh(db_record)
    return db_record

@router.delete("/{record_id}")
def delete_walk_in_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(get_current_admin)
):
    """Delete a walk-in record"""
    db_record = db.query(models.WalkInRecord).filter(models.WalkInRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Walk-in record not found")
    
    db.delete(db_record)
    db.commit()
    return {"message": "Walk-in record deleted successfully"}

