from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.models import MedicalRecord
from core.schemas import MedicalRecord as MedicalRecordSchema, MedicalRecordCreate, MedicalRecordUpdate

router = APIRouter(prefix="/medical-records", tags=["medical-records"])

@router.get("/pet/{pet_id}", response_model=List[MedicalRecordSchema])
def get_medical_records_by_pet(pet_id: int, db: Session = Depends(get_db)):
    records = db.query(MedicalRecord).filter(MedicalRecord.pet_id == pet_id).all()
    return records  # Always return a list, even if empty

@router.get("/", response_model=List[MedicalRecordSchema])
def get_all_medical_records(db: Session = Depends(get_db)):
    return db.query(MedicalRecord).all()

@router.get("/{record_id}", response_model=MedicalRecordSchema)
def get_medical_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return record

@router.post("/", response_model=MedicalRecordSchema, status_code=status.HTTP_201_CREATED)
def create_medical_record(record: MedicalRecordCreate, db: Session = Depends(get_db)):
    db_record = MedicalRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.post("/pet/{pet_id}", response_model=MedicalRecordSchema, status_code=status.HTTP_201_CREATED)
def create_medical_record_for_pet(pet_id: int, record: MedicalRecordCreate, db: Session = Depends(get_db)):
    db_record = MedicalRecord(**record.dict(), pet_id=pet_id)
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{record_id}", response_model=MedicalRecordSchema)
def update_medical_record(record_id: int, record_update: MedicalRecordUpdate, db: Session = Depends(get_db)):
    db_record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    for key, value in record_update.dict(exclude_unset=True).items():
        setattr(db_record, key, value)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medical_record(record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    db.delete(db_record)
    db.commit()
    return None 