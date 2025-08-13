from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from core.database import get_db
from core.models import VaccinationRecord, Pet
from core.schemas import VaccinationRecord as VaccinationRecordSchema, VaccinationRecordCreate, VaccinationRecordUpdate

router = APIRouter(prefix="/vaccination-records", tags=["vaccination-records"])

@router.get("/", response_model=List[VaccinationRecordSchema])
def get_all_vaccination_records(db: Session = Depends(get_db)):
    return db.query(VaccinationRecord).all()

@router.get("/statistics/dashboard", response_model=Dict)
def get_vaccination_statistics(date: str = None, db: Session = Depends(get_db)):
    """
    Get vaccination statistics for dashboard display
    Returns counts by species (feline/canine) and gender (male/female) for a specific date
    If no date is provided, uses current date
    """
    try:
        from datetime import datetime, date as date_type
        
        # Use provided date or current date
        if date:
            try:
                target_date = datetime.strptime(date, "%Y-%m-%d").date()
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")
        else:
            target_date = datetime.now().date()
        
        # Query vaccination records for the specific date
        stats = db.query(
            Pet.species,
            Pet.gender,
            func.count(VaccinationRecord.id).label('count')
        ).join(
            VaccinationRecord, Pet.id == VaccinationRecord.pet_id
        ).filter(
            func.date(VaccinationRecord.date_of_vaccination) == target_date
        ).group_by(
            Pet.species, Pet.gender
        ).all()

        result = {
            "feline": {"male": 0, "female": 0, "total": 0},
            "canine": {"male": 0, "female": 0, "total": 0},
            "total_vaccinations": 0
        }

        for stat in stats:
            species = stat.species.lower()
            gender = stat.gender.lower() if stat.gender else "unknown"
            count = stat.count

            if species in ["feline", "cat"]:
                if gender in ["male", "m"]:
                    result["feline"]["male"] = count
                elif gender in ["female", "f"]:
                    result["feline"]["female"] = count
            elif species in ["canine", "dog"]:
                if gender in ["male", "m"]:
                    result["canine"]["male"] = count
                elif gender in ["female", "f"]:
                    result["canine"]["female"] = count

            result["total_vaccinations"] += count

        result["feline"]["total"] = result["feline"]["male"] + result["feline"]["female"]
        result["canine"]["total"] = result["canine"]["male"] + result["canine"]["female"]

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching vaccination statistics: {str(e)}")

@router.get("/{record_id}", response_model=VaccinationRecordSchema)
def get_vaccination_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(VaccinationRecord).filter(VaccinationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    return record

@router.get("/pet/{pet_id}", response_model=List[VaccinationRecordSchema])
def get_vaccination_records_by_pet(pet_id: int, db: Session = Depends(get_db)):
    records = db.query(VaccinationRecord).filter(VaccinationRecord.pet_id == pet_id).all()
    return records

@router.post("/", response_model=VaccinationRecordSchema, status_code=status.HTTP_201_CREATED)
def create_vaccination_record(record: VaccinationRecordCreate, db: Session = Depends(get_db)):
    db_record = VaccinationRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{record_id}", response_model=VaccinationRecordSchema)
def update_vaccination_record(record_id: int, record_update: VaccinationRecordUpdate, db: Session = Depends(get_db)):
    db_record = db.query(VaccinationRecord).filter(VaccinationRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    for key, value in record_update.dict(exclude_unset=True).items():
        setattr(db_record, key, value)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vaccination_record(record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(VaccinationRecord).filter(VaccinationRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    db.delete(db_record)
    db.commit()
    return None 