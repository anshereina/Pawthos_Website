from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict
from datetime import datetime
from core import models, schemas
from core.database import get_db

router = APIRouter(prefix="/animal-control-records", tags=["animal-control-records"])

@router.post("/", response_model=schemas.AnimalControlRecord)
def create_animal_control_record(record: schemas.AnimalControlRecordCreate, db: Session = Depends(get_db)):
    db_record = models.AnimalControlRecord(**record.dict())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.get("/", response_model=List[schemas.AnimalControlRecord])
def get_animal_control_records(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    records = db.query(models.AnimalControlRecord).order_by(models.AnimalControlRecord.date.desc()).offset(skip).limit(limit).all()
    return records

@router.get("/statistics/dashboard", response_model=Dict)
def get_animal_control_statistics(date: str = None, db: Session = Depends(get_db)):
    """
    Get animal control statistics for dashboard display
    Returns counts by species (feline/canine) and gender (male/female) for catch records only
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
        
        print(f"Fetching animal control statistics for date: {target_date}")
        
        # Query animal control records with species and gender information
        # Only include 'catch' records for the specific date
        stats = db.query(
            models.AnimalControlRecord.species,
            models.AnimalControlRecord.gender,
            models.AnimalControlRecord.record_type,
            func.count(models.AnimalControlRecord.id).label('count')
        ).filter(
            models.AnimalControlRecord.record_type == 'catch',
            func.date(models.AnimalControlRecord.date) == target_date
        ).group_by(
            models.AnimalControlRecord.species, models.AnimalControlRecord.gender, models.AnimalControlRecord.record_type
        ).all()
        
        print(f"Raw stats from database for date {target_date}: {stats}")
        
        # Initialize result structure
        result = {
            "feline": {"male": 0, "female": 0, "total": 0},
            "canine": {"male": 0, "female": 0, "total": 0},
            "total_catches": 0
        }
        
        # Process the results
        for stat in stats:
            species = stat.species.lower() if stat.species else "unknown"
            gender = stat.gender.lower() if stat.gender else "unknown"
            count = stat.count
            
            print(f"Processing: species='{species}', gender='{gender}', count={count}")
            
            # More flexible species matching - treat any custom name as canine for now
            # You can customize this logic based on your needs
            if species in ["feline", "cat", "kitten"]:
                if gender in ["male", "m", "male"]:
                    result["feline"]["male"] += count
                    print(f"Added {count} to feline male")
                elif gender in ["female", "f", "female"]:
                    result["feline"]["female"] += count
                    print(f"Added {count} to feline female")
                else:
                    print(f"Unknown gender '{gender}' for feline")
            elif species in ["canine", "dog", "puppy"] or species not in ["feline", "cat", "kitten"]:
                # Treat any other species as canine (including custom names like "Maku")
                if gender in ["male", "m", "male"]:
                    result["canine"]["male"] += count
                    print(f"Added {count} to canine male (species: {species})")
                elif gender in ["female", "f", "female"]:
                    result["canine"]["female"] += count
                    print(f"Added {count} to canine female (species: {species})")
                else:
                    print(f"Unknown gender '{gender}' for canine")
            else:
                print(f"Unknown species '{species}'")
            
            result["total_catches"] += count
        
        # Calculate totals for each species
        result["feline"]["total"] = result["feline"]["male"] + result["feline"]["female"]
        result["canine"]["total"] = result["canine"]["male"] + result["canine"]["female"]
        
        print(f"Final result: {result}")
        
        return result
        
    except Exception as e:
        print(f"Error in animal control statistics: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching animal control statistics: {str(e)}")

@router.get("/{record_id}", response_model=schemas.AnimalControlRecord)
def get_animal_control_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(models.AnimalControlRecord).filter(models.AnimalControlRecord.id == record_id).first()
    if record is None:
        raise HTTPException(status_code=404, detail="Animal Control Record not found")
    return record

@router.put("/{record_id}", response_model=schemas.AnimalControlRecord)
def update_animal_control_record(record_id: int, record_update: schemas.AnimalControlRecordUpdate, db: Session = Depends(get_db)):
    try:
        print(f"Updating record {record_id} with data: {record_update.dict()}")
        
        db_record = db.query(models.AnimalControlRecord).filter(models.AnimalControlRecord.id == record_id).first()
        if db_record is None:
            raise HTTPException(status_code=404, detail="Animal Control Record not found")
        
        update_data = record_update.dict(exclude_unset=True)
        print(f"Update data (exclude_unset=True): {update_data}")
        
        # Handle date conversion if date is provided as string
        if 'date' in update_data and update_data['date']:
            try:
                if isinstance(update_data['date'], str):
                    update_data['date'] = datetime.strptime(update_data['date'], '%Y-%m-%d').date()
                    print(f"Converted date: {update_data['date']}")
            except ValueError as e:
                print(f"Date conversion error: {e}")
                raise HTTPException(status_code=422, detail="Invalid date format. Use YYYY-MM-DD")
        
        for field, value in update_data.items():
            print(f"Setting {field} = {value}")
            setattr(db_record, field, value)
        
        db.commit()
        db.refresh(db_record)
        return db_record
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating animal control record: {str(e)}")

@router.delete("/{record_id}")
def delete_animal_control_record(record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(models.AnimalControlRecord).filter(models.AnimalControlRecord.id == record_id).first()
    if db_record is None:
        raise HTTPException(status_code=404, detail="Animal Control Record not found")
    db.delete(db_record)
    db.commit()
    return {"message": "Animal Control Record deleted successfully"} 