from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date, datetime
import uuid

from core.database import get_db
from core.models import ShippingPermitRecord as ShippingPermitRecordModel
from core.schemas import (
    ShippingPermitRecord,
    ShippingPermitRecordCreate,
    ShippingPermitRecordUpdate
)

router = APIRouter(prefix="/shipping-permit-records", tags=["shipping-permit-records"])

def generate_permit_number():
    """Generate a unique permit number"""
    return f"SP-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

@router.post("/", response_model=ShippingPermitRecord, status_code=status.HTTP_201_CREATED)
def create_shipping_permit_record(
    record: ShippingPermitRecordCreate,
    db: Session = Depends(get_db)
):
    """Create a new shipping permit record"""
    try:
        # Generate permit number if not provided
        if not record.permit_number:
            record.permit_number = generate_permit_number()
        
        db_record = ShippingPermitRecordModel(**record.dict())
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        return db_record
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create shipping permit record: {str(e)}"
        )

@router.get("/", response_model=List[ShippingPermitRecord])
def get_shipping_permit_records(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """Get all shipping permit records with optional filtering"""
    query = db.query(ShippingPermitRecordModel)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            ShippingPermitRecordModel.owner_name.ilike(search_term) |
            ShippingPermitRecordModel.pet_name.ilike(search_term) |
            ShippingPermitRecordModel.permit_number.ilike(search_term) |
            ShippingPermitRecordModel.contact_number.ilike(search_term)
        )
    
    # Apply status filter
    if status_filter:
        query = query.filter(ShippingPermitRecordModel.status == status_filter)
    
    records = query.offset(skip).limit(limit).all()
    return records

@router.get("/{record_id}", response_model=ShippingPermitRecord)
def get_shipping_permit_record(record_id: int, db: Session = Depends(get_db)):
    """Get a specific shipping permit record by ID"""
    record = db.query(ShippingPermitRecordModel).filter(ShippingPermitRecordModel.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping permit record not found"
        )
    return record

@router.put("/{record_id}", response_model=ShippingPermitRecord)
def update_shipping_permit_record(
    record_id: int,
    record_update: ShippingPermitRecordUpdate,
    db: Session = Depends(get_db)
):
    """Update a shipping permit record"""
    db_record = db.query(ShippingPermitRecordModel).filter(ShippingPermitRecordModel.id == record_id).first()
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping permit record not found"
        )
    
    try:
        update_data = record_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_record, field, value)
        
        db_record.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_record)
        return db_record
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update shipping permit record: {str(e)}"
        )

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shipping_permit_record(record_id: int, db: Session = Depends(get_db)):
    """Delete a shipping permit record"""
    db_record = db.query(ShippingPermitRecordModel).filter(ShippingPermitRecordModel.id == record_id).first()
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping permit record not found"
        )
    
    try:
        db.delete(db_record)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete shipping permit record: {str(e)}"
        )

@router.get("/by-date/{date}", response_model=List[ShippingPermitRecord])
def get_shipping_permit_records_by_date(
    date: date,
    db: Session = Depends(get_db)
):
    """Get shipping permit records by issue date"""
    records = db.query(ShippingPermitRecordModel).filter(
        ShippingPermitRecordModel.issue_date == date
    ).all()
    return records

@router.get("/by-status/{status}", response_model=List[ShippingPermitRecord])
def get_shipping_permit_records_by_status(
    status: str,
    db: Session = Depends(get_db)
):
    """Get shipping permit records by status"""
    records = db.query(ShippingPermitRecordModel).filter(
        ShippingPermitRecordModel.status == status
    ).all()
    return records 