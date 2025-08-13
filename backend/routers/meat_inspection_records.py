from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core import models, schemas
from core.database import get_db

router = APIRouter(prefix="/meat-inspection-records", tags=["meat-inspection-records"])

@router.post("/", response_model=schemas.MeatInspectionRecord)
def create_meat_inspection_record(record: schemas.MeatInspectionRecordCreate, db: Session = Depends(get_db)):
    db_record = models.MeatInspectionRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/", response_model=List[schemas.MeatInspectionRecord])
def get_meat_inspection_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    records = db.query(models.MeatInspectionRecord).order_by(models.MeatInspectionRecord.date_of_inspection.desc()).offset(skip).limit(limit).all()
    return records

@router.get("/{record_id}", response_model=schemas.MeatInspectionRecord)
def get_meat_inspection_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(models.MeatInspectionRecord).filter(models.MeatInspectionRecord.id == record_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Meat Inspection Record not found")
    return record

@router.put("/{record_id}", response_model=schemas.MeatInspectionRecord)
def update_meat_inspection_record(record_id: int, record_update: schemas.MeatInspectionRecordUpdate, db: Session = Depends(get_db)):
    db_record = db.query(models.MeatInspectionRecord).filter(models.MeatInspectionRecord.id == record_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Meat Inspection Record not found")
    update_data = record_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_record, field, value)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.delete("/{record_id}")
def delete_meat_inspection_record(record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(models.MeatInspectionRecord).filter(models.MeatInspectionRecord.id == record_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Meat Inspection Record not found")
    db.delete(db_record)
    db.commit()
    return {"message": "Meat Inspection Record deleted successfully"} 