from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import List, Dict, Union
from core.database import get_db
from core.models import VaccinationRecord, Pet, User, Admin
from core.schemas import VaccinationRecord as VaccinationRecordSchema, VaccinationRecordCreate, VaccinationRecordUpdate
from core import auth

router = APIRouter(prefix="/vaccination-records", tags=["vaccination-records"])

@router.get("", response_model=List[VaccinationRecordSchema])
def get_all_vaccination_records(
    db: Session = Depends(get_db),
    current_user: Union[Admin, User] = Depends(auth.get_current_active_user)
):
    """Get all vaccination records. Regular users see only their records, admins see all."""
    if isinstance(current_user, User):
        # Regular users see only their vaccination records
        return db.query(VaccinationRecord).filter(VaccinationRecord.user_id == current_user.id).all()
    else:
        # Admins see all vaccination records
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
        # Since vaccination_date is stored as DateTime, we can filter by date
        all_records = db.query(
            VaccinationRecord.vaccination_date,
            Pet.species,
            Pet.gender
        ).join(
            Pet, Pet.id == VaccinationRecord.pet_id
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
                # vaccination_date is a DateTime object
                if not record.vaccination_date:
                    continue
                
                # Extract date part from datetime
                vaccination_date = record.vaccination_date.date() if hasattr(record.vaccination_date, 'date') else record.vaccination_date
                
                if vaccination_date != target_date:
                    continue
                
                print(f"Found matching record: date={vaccination_date}, species={record.species}, gender={record.gender}")
                
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
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in get_vaccination_statistics: {str(e)}")
        print(f"Traceback: {error_details}")
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
        # Since vaccination_date is stored as DateTime, we can filter by year
        all_records = db.query(
            VaccinationRecord.vaccination_date,
            Pet.species,
            Pet.gender
        ).join(
            Pet, Pet.id == VaccinationRecord.pet_id
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
                # vaccination_date is a DateTime object
                if not record.vaccination_date:
                    continue
                
                # Extract datetime
                vaccination_datetime = record.vaccination_date
                
                # Check if it's the right year
                if vaccination_datetime.year != year:
                    continue
                
                month = vaccination_datetime.month
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
                # Skip records with invalid dates
                print(f"Error processing date '{record.vaccination_date}': {e}")
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
        import traceback
        error_details = traceback.format_exc()
        print(f"ERROR in get_yearly_vaccination_statistics: {str(e)}")
        print(f"Traceback: {error_details}")
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
                'expiration_date': record.next_due_date,
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

def find_or_create_user_for_pet(owner_name: str, db: Session) -> User:
    """Find existing user by name or create a new one with placeholder email/password."""
    # Try to find by name first
    user = db.query(User).filter(User.name == owner_name).first()
    if user:
        return user

    # Generate a unique placeholder email
    # Use owner name (sanitized) + timestamp to ensure uniqueness
    import re
    from datetime import datetime
    sanitized_name = re.sub(r'[^a-zA-Z0-9]', '', owner_name.lower())[:50]  # Remove special chars, limit length
    timestamp = int(datetime.now().timestamp())
    placeholder_email = f"{sanitized_name}_{timestamp}@placeholder.local"
    
    # Ensure email is unique (in case of collision)
    counter = 1
    while db.query(User).filter(User.email == placeholder_email).first():
        placeholder_email = f"{sanitized_name}_{timestamp}_{counter}@placeholder.local"
        counter += 1

    # Create placeholder user record with placeholder values for all required fields
    # These values won't conflict when the pet owner creates an actual account later
    user = User(
        name=owner_name,
        email=placeholder_email,
        password_hash="PLACEHOLDER_NO_PASSWORD",  # Placeholder value for NOT NULL constraint
        phone_number="Not Available",  # Placeholder value
        address="Not Available",  # Placeholder value
        photo_url="",  # Empty string for optional field
        is_confirmed=0
    )
    db.add(user)
    db.flush()
    return user

@router.post("", response_model=VaccinationRecordSchema, status_code=status.HTTP_201_CREATED)
def create_vaccination_record(record: VaccinationRecordCreate, db: Session = Depends(get_db)):
    try:
        # Get the pet to find the owner name
        pet = db.query(Pet).filter(Pet.id == record.pet_id).first()
        if not pet:
            raise HTTPException(status_code=404, detail=f"Pet with id {record.pet_id} not found")
        
        # Find or create the user - try by user_id first, then by owner name
        user = None
        if hasattr(pet, 'user_id') and pet.user_id:
            user = db.query(User).filter(User.id == pet.user_id).first()
        
        if not user:
            # Fallback: try to find user by owner name
            user = db.query(User).filter(User.name == pet.owner_name).first()
        
        # If still no user found, create a placeholder user
        if not user:
            user = find_or_create_user_for_pet(pet.owner_name, db)
        
        # Determine user_id
        resolved_user_id = user.id
        
        # Map schema fields to model fields (date_given -> vaccination_date)
        record_data = record.dict(exclude_unset=True)
        record_data['user_id'] = resolved_user_id
        
        # Map date_given from schema to vaccination_date for model
        if 'date_given' in record_data and record_data['date_given'] is not None:
            record_data['vaccination_date'] = record_data.pop('date_given')
        elif 'vaccination_date' not in record_data:
            raise HTTPException(status_code=400, detail="vaccination_date (date_given) is required")
        
        print(f"🔧 Creating vaccination record with data: {record_data}")
        print(f"🔧 pet_id: {record.pet_id}, user_id: {resolved_user_id}")
        
        db_record = VaccinationRecord(**record_data)
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        print(f"✅ Vaccination record created successfully with id: {db_record.id}")
        return db_record
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating vaccination record: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create vaccination record: {str(e)}"
        )

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