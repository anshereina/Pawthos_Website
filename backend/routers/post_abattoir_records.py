from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from core import models, schemas
from core.database import get_db

router = APIRouter(prefix="/post-abattoir-records", tags=["post-abattoir-records"])

@router.post("/", response_model=schemas.PostAbattoirRecord)
def create_post_abattoir_record(record: schemas.PostAbattoirRecordCreate, db: Session = Depends(get_db)):
    db_record = models.PostAbattoirRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/", response_model=List[schemas.PostAbattoirRecord])
def list_post_abattoir_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return (
        db.query(models.PostAbattoirRecord)
        .order_by(models.PostAbattoirRecord.date.desc(), models.PostAbattoirRecord.time.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

@router.get("/{record_id}", response_model=schemas.PostAbattoirRecord)
def get_post_abattoir_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(models.PostAbattoirRecord).filter(models.PostAbattoirRecord.id == record_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Post Abattoir Record not found")
    return record

@router.put("/{record_id}", response_model=schemas.PostAbattoirRecord)
def update_post_abattoir_record(record_id: int, record_update: schemas.PostAbattoirRecordUpdate, db: Session = Depends(get_db)):
    db_record = db.query(models.PostAbattoirRecord).filter(models.PostAbattoirRecord.id == record_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Post Abattoir Record not found")
    update_data = record_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_record, field, value)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.delete("/{record_id}")
def delete_post_abattoir_record(record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(models.PostAbattoirRecord).filter(models.PostAbattoirRecord.id == record_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Post Abattoir Record not found")
    db.delete(db_record)
    db.commit()
    return {"message": "Post Abattoir Record deleted successfully"}


