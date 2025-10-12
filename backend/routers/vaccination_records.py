from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict
from core.database import get_db
from core.models import VaccinationRecord, Pet, User
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
        
        print(f"Target date for vaccination statistics: {target_date}")
        
        # Get all vaccination records
        # Since vaccination_date is stored as string, we need to filter in Python
        all_records = db.query(
            VaccinationRecord.vaccination_date,
            Pet.species,
            Pet.gender
        ).join(
            VaccinationRecord, Pet.id == VaccinationRecord.pet_id
        ).all()
        
        print(f"Total vaccination records found: {len(all_records)}")
        print(f"Sample vaccination dates: {[r.vaccination_date for r in all_records[:5]]}")
        print(f"Target date type: {type(target_date)}, Target date: {target_date}")

        result = {
            "feline": {"male": 0, "female": 0, "total": 0},
            "canine": {"male": 0, "female": 0, "total": 0},
            "total_vaccinations": 0
        }

        # Process the records and filter by date
        for record in all_records:
            try:
                # Parse the vaccination_date string to datetime
                vaccination_date_str = record.vaccination_date
                if not vaccination_date_str:
                    continue
                
                # Try different date formats
                parsed_date = None
                date_formats = ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d %H:%M:%S']
                
                for date_format in date_formats:
                    try:
                        parsed_date = datetime.strptime(vaccination_date_str, date_format)
                        break
                    except ValueError:
                        continue
                
                if not parsed_date or parsed_date.date() != target_date:
                    continue
                
                print(f"Found matching record: date={parsed_date.date()}, species={record.species}, gender={record.gender}")
                print(f"Parsed date type: {type(parsed_date.date())}, Parsed date: {parsed_date.date()}")
                
                species = record.species.lower() if record.species else "unknown"
                gender = record.gender.lower() if record.gender else "unknown"

                if species in ["feline", "cat"]:
                    if gender in ["male", "m"]:
                        result["feline"]["male"] += 1
                    elif gender in ["female", "f"]:
                        result["feline"]["female"] += 1
                elif species in ["canine", "dog"]:
                    if gender in ["male", "m"]:
                        result["canine"]["male"] += 1
                    elif gender in ["female", "f"]:
                        result["canine"]["female"] += 1

                result["total_vaccinations"] += 1
                        
            except Exception as e:
                # Skip records with invalid date formats
                print(f"Error parsing date '{record.vaccination_date}': {e}")
                continue

        result["feline"]["total"] = result["feline"]["male"] + result["feline"]["female"]
        result["canine"]["total"] = result["canine"]["male"] + result["canine"]["female"]

        print(f"Final vaccination statistics result: {result}")
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching vaccination statistics: {str(e)}")

@router.get("/statistics/yearly", response_model=Dict)
def get_yearly_vaccination_statistics(year: int = None, db: Session = Depends(get_db)):
    """
    Get yearly vaccination statistics for dashboard display
    Returns monthly counts by species (feline/canine) and gender (male/female) for a specific year
    If no year is provided, uses current year
    """
    try:
        from datetime import datetime
        
        # Use provided year or current year
        if year is None:
            year = datetime.now().year
        
        # Get all vaccination records for the year
        # Since vaccination_date is stored as string, we need to filter in Python
        all_records = db.query(
            VaccinationRecord.vaccination_date,
            Pet.species,
            Pet.gender
        ).join(
            VaccinationRecord, Pet.id == VaccinationRecord.pet_id
        ).all()

        # Initialize monthly data structure
        monthly_data = {}
        month_names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        for i in range(1, 13):
            monthly_data[i] = {
                'month': month_names[i-1],
                'canineMale': 0,
                'canineFemale': 0,
                'felineMale': 0,
                'felineFemale': 0
            }

        # Process the records and filter by year
        for record in all_records:
            try:
                # Parse the vaccination_date string to datetime
                vaccination_date_str = record.vaccination_date
                if not vaccination_date_str:
                    continue
                
                # Try different date formats
                parsed_date = None
                date_formats = ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d %H:%M:%S']
                
                for date_format in date_formats:
                    try:
                        parsed_date = datetime.strptime(vaccination_date_str, date_format)
                        break
                    except ValueError:
                        continue
                
                if not parsed_date or parsed_date.year != year:
                    continue
                
                month = parsed_date.month
                species = record.species.lower() if record.species else "unknown"
                gender = record.gender.lower() if record.gender else "unknown"

                if species in ["feline", "cat"]:
                    if gender in ["male", "m"]:
                        monthly_data[month]['felineMale'] += 1
                    elif gender in ["female", "f"]:
                        monthly_data[month]['felineFemale'] += 1
                elif species in ["canine", "dog"]:
                    if gender in ["male", "m"]:
                        monthly_data[month]['canineMale'] += 1
                    elif gender in ["female", "f"]:
                        monthly_data[month]['canineFemale'] += 1
                        
            except Exception as e:
                # Skip records with invalid date formats
                print(f"Error parsing date '{record.vaccination_date}': {e}")
                continue

        # Convert to list format and calculate totals
        result = {
            'year': year,
            'monthly_data': list(monthly_data.values()),
            'summary': {
                'total_canine': sum(data['canineMale'] + data['canineFemale'] for data in monthly_data.values()),
                'total_feline': sum(data['felineMale'] + data['felineFemale'] for data in monthly_data.values()),
                'peak_month': max(monthly_data.items(), key=lambda x: x[1]['canineMale'] + x[1]['canineFemale'] + x[1]['felineMale'] + x[1]['felineFemale'])[1]['month']
            }
        }

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching yearly vaccination statistics: {str(e)}")

@router.get("/test")
def test_endpoint():
    """Test endpoint to check if the server is working"""
    return {"message": "Vaccination records endpoint is working", "status": "ok"}

@router.get("/simple")
def simple_vaccination_records():
    """Simple endpoint that returns empty array"""
    return []

@router.get("/with-pets")
def get_vaccination_records_with_pets(db: Session = Depends(get_db)):
    """Get all vaccination records with pet information"""
    try:
        print("=== FETCHING VACCINATION RECORDS WITH PETS ===")
        
        # First, let's check if there are any vaccination records at all
        total_records = db.query(VaccinationRecord).count()
        print(f"Total vaccination records in database: {total_records}")
        
        if total_records == 0:
            print("No vaccination records found, returning empty list")
            return []
        
        # Try a simpler approach - get all vaccination records first
        vaccination_records = db.query(VaccinationRecord).all()
        print(f"Found {len(vaccination_records)} vaccination records")
        
        # Convert to list of dictionaries with pet information
        result = []
        for i, record in enumerate(vaccination_records):
            print(f"Processing record {i+1}/{len(vaccination_records)}: ID={record.id}")
            
            # Get pet information separately
            pet = db.query(Pet).filter(Pet.id == record.pet_id).first()
            print(f"  Pet found: {pet.name if pet else 'None'}")
            
            record_data = {
                'id': record.id,
                'pet_id': record.pet_id,
                'user_id': record.user_id,
                'vaccine_name': record.vaccine_name,
                'vaccination_date': record.vaccination_date,
                'expiration_date': record.expiration_date,
                'veterinarian': record.veterinarian,
                'batch_lot_no': record.batch_lot_no,
                'created_at': record.created_at.isoformat() if record.created_at else None,
                'updated_at': record.updated_at.isoformat() if record.updated_at else None,
                'pet_name': pet.name if pet else 'Unknown Pet',
                'pet_species': pet.species if pet else 'Unknown',
                'pet_breed': pet.breed if pet else '',
                'pet_color': pet.color if pet else '',
                'pet_gender': pet.gender if pet else '',
                'pet_owner_name': pet.owner_name if pet else 'Unknown Owner'
            }
            
            result.append(record_data)
            print(f"  Record data: {record_data}")
        
        print(f"=== RETURNING {len(result)} RECORDS ===")
        return result
        
    except Exception as e:
        print(f"=== ERROR FETCHING VACCINATION RECORDS WITH PETS: {str(e)} ===")
        import traceback
        traceback.print_exc()
        # Return a more detailed error response
        return {
            "error": True,
            "message": f"Error fetching vaccination records: {str(e)}",
            "details": str(e),
            "records": []
        }

@router.get("/pet/{pet_id}", response_model=List[VaccinationRecordSchema])
def get_vaccination_records_by_pet(pet_id: int, db: Session = Depends(get_db)):
    records = db.query(VaccinationRecord).filter(VaccinationRecord.pet_id == pet_id).all()
    return records

@router.get("/{record_id}", response_model=VaccinationRecordSchema)
def get_vaccination_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(VaccinationRecord).filter(VaccinationRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Vaccination record not found")
    return record

@router.post("/", response_model=VaccinationRecordSchema, status_code=status.HTTP_201_CREATED)
def create_vaccination_record(record: VaccinationRecordCreate, db: Session = Depends(get_db)):
    # Get the pet to find the owner name
    pet = db.query(Pet).filter(Pet.id == record.pet_id).first()
    if not pet:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    # Find the user by owner name
    user = db.query(User).filter(User.name == pet.owner_name).first()
    
    # Create the vaccination record with user_id if found
    record_data = record.dict()
    if user:
        record_data['user_id'] = user.id
    else:
        # If no user found, set user_id to None (should be nullable in DB)
        record_data['user_id'] = None
    
    db_record = VaccinationRecord(**record_data)
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