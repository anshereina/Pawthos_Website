from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from core.database import get_db
from core.models import VaccinationDrive, VaccinationDriveRecord, Pet, User, VaccinationRecord
from core.schemas import VaccinationDrive as VaccinationDriveSchema, VaccinationDriveCreate, VaccinationDriveRecord as VaccinationDriveRecordSchema, VaccinationDriveRecordCreate

router = APIRouter(prefix="/vaccination-drives", tags=["vaccination-drives"])

def find_or_create_user(owner_name: str, owner_contact: str, db: Session) -> User:
    """Find existing user by name or create a new one with placeholder email/password."""
    # Try to find by name first (name used as owner identifier during drives)
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

    # Create placeholder user record with placeholder email
    user = User(
        name=owner_name,
        email=placeholder_email,
        password_hash=None,
        phone_number=owner_contact,
        address="",
        is_confirmed=0
    )
    db.add(user)
    db.flush()
    return user

def find_or_create_pet(owner_name: str, pet_name: str, species: str, breed: str, color: str, age: str, sex: str, db: Session) -> Pet:
    """Find existing pet by owner and name or create a new one"""
    # First try to find by owner name and pet name
    pet = db.query(Pet).filter(
        Pet.owner_name == owner_name,
        Pet.name == pet_name
    ).first()
    
    if pet:
        return pet
    
    # Generate a unique pet_id
    from sqlalchemy import func
    last_pet = db.query(Pet).order_by(Pet.id.desc()).first()
    if last_pet:
        # Extract number from last pet_id (e.g., "PET-0001" -> 1)
        import re
        match = re.search(r'PET-(\d+)', last_pet.pet_id)
        if match:
            next_num = int(match.group(1)) + 1
        else:
            next_num = 1
    else:
        next_num = 1
    
    pet_id = f"PET-{next_num:04d}"
    
    # If not found, create a new pet
    pet = Pet(
        pet_id=pet_id,
        name=pet_name,
        species=species.lower(),
        breed=breed or "",
        color=color or "",
        gender=sex.lower() if sex else "",
        owner_name=owner_name
    )
    db.add(pet)
    db.flush()  # Get the pet ID
    return pet

@router.post("", status_code=status.HTTP_201_CREATED)
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_vaccination_drive(drive_data: dict, db: Session = Depends(get_db)):
    """
    Create a vaccination drive with multiple pet records
    Expected format:
    {
        "event_id": 1,
        "vaccine_used": "Nobivac Rabies",
        "batch_no_lot_no": "BATCH123",
        "pet_records": [
            {
                "owner_name": "John Doe",
                "pet_name": "Fluffy",
                "owner_contact": "1234567890",
                "species": "Dog",
                "breed": "Golden Retriever",
                "color": "Golden",
                "age": "3 years",
                "sex": "Male",
                "other_services": ["deworming", "checkup"],
                "vaccine_used": "Nobivac Rabies",
                "batch_no_lot_no": "BATCH123",
                "vaccination_date": "2024-01-15"
            }
        ]
    }
    """
    try:
        # Create the vaccination drive
        drive = VaccinationDrive(
            event_id=drive_data["event_id"],
            vaccine_used=drive_data["vaccine_used"],
            batch_no_lot_no=drive_data["batch_no_lot_no"]
        )
        db.add(drive)
        db.flush()  # Get the drive ID
        
        # Create pet records and vaccination records
        for pet_record_data in drive_data["pet_records"]:
            # Create vaccination drive record
            pet_record = VaccinationDriveRecord(
                drive_id=drive.id,
                owner_name=pet_record_data["owner_name"],
                pet_name=pet_record_data["pet_name"],
                owner_birthday=pet_record_data.get("owner_birthday"),
                owner_contact=pet_record_data.get("owner_contact"),  # Made optional
                species=pet_record_data["species"],
                breed=pet_record_data.get("breed"),
                color=pet_record_data.get("color"),
                age=pet_record_data.get("age"),
                sex=pet_record_data.get("sex"),
                reproductive_status=pet_record_data.get("reproductive_status"),
                other_services=json.dumps(pet_record_data.get("other_services", [])),
                vaccine_used=pet_record_data["vaccine_used"],
                batch_no_lot_no=pet_record_data["batch_no_lot_no"],
                vaccination_date=pet_record_data["vaccination_date"]
            )
            db.add(pet_record)
            
            # Find or create user and pet for vaccination record
            user = find_or_create_user(
                pet_record_data["owner_name"], 
                pet_record_data.get("owner_contact") or "", 
                db
            )
            
            pet = find_or_create_pet(
                pet_record_data["owner_name"],
                pet_record_data["pet_name"],
                pet_record_data["species"],
                pet_record_data.get("breed", ""),
                pet_record_data.get("color", ""),
                pet_record_data.get("age", ""),
                pet_record_data.get("sex", ""),
                db
            )
            
            # Create vaccination record
            from datetime import datetime
            try:
                # Try to parse the date string
                vaccination_date_str = pet_record_data["vaccination_date"]
                if 'T' in vaccination_date_str:
                    # ISO format with time
                    vaccination_date = datetime.fromisoformat(vaccination_date_str.replace('Z', '+00:00'))
                else:
                    # Date only format
                    vaccination_date = datetime.strptime(vaccination_date_str, '%Y-%m-%d')
            except ValueError:
                # Fallback to current date if parsing fails
                vaccination_date = datetime.now()
            
            vaccination_record = VaccinationRecord(
                pet_id=pet.id,
                user_id=user.id,
                vaccine_name=pet_record_data["vaccine_used"],
                vaccination_date=vaccination_date,
                veterinarian="Vaccination Drive",  # Default veterinarian for drive records
                batch_lot_no=pet_record_data["batch_no_lot_no"]
            )
            db.add(vaccination_record)
        
        db.commit()
        return {"message": "Vaccination drive created successfully", "drive_id": drive.id}
        
    except Exception as e:
        db.rollback()
        import traceback
        error_details = traceback.format_exc()
        print(f"Vaccination drive creation error: {str(e)}")
        print(f"Error details: {error_details}")
        raise HTTPException(status_code=500, detail=f"Failed to create vaccination drive: {str(e)}")

@router.get("/event/{event_id}/drive", response_model=VaccinationDriveSchema)
def get_vaccination_drive_by_event_id(event_id: int, db: Session = Depends(get_db)):
    """Get the vaccination drive for a specific event"""
    drive = db.query(VaccinationDrive).filter(VaccinationDrive.event_id == event_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Vaccination drive not found for this event")
    return drive

@router.get("/event/{event_id}", response_model=List[VaccinationDriveRecordSchema])
def get_vaccination_drive_by_event(event_id: int, db: Session = Depends(get_db)):
    """Get all vaccination drive records for a specific event"""
    drives = db.query(VaccinationDrive).filter(VaccinationDrive.event_id == event_id).all()
    if not drives:
        return []
    
    drive_ids = [drive.id for drive in drives]
    records = db.query(VaccinationDriveRecord).filter(VaccinationDriveRecord.drive_id.in_(drive_ids)).all()
    
    # Convert other_services back to list
    for record in records:
        if record.other_services:
            try:
                record.other_services = json.loads(record.other_services)
            except:
                record.other_services = []
    
    return records

@router.get("/{drive_id}", response_model=VaccinationDriveSchema)
def get_vaccination_drive(drive_id: int, db: Session = Depends(get_db)):
    """Get a specific vaccination drive"""
    drive = db.query(VaccinationDrive).filter(VaccinationDrive.id == drive_id).first()
    if not drive:
        raise HTTPException(status_code=404, detail="Vaccination drive not found")
    return drive

@router.get("/{drive_id}/records", response_model=List[VaccinationDriveRecordSchema])
def get_vaccination_drive_records(drive_id: int, db: Session = Depends(get_db)):
    """Get all records for a specific vaccination drive"""
    records = db.query(VaccinationDriveRecord).filter(VaccinationDriveRecord.drive_id == drive_id).all()
    
    # Convert other_services back to list
    for record in records:
        if record.other_services:
            try:
                record.other_services = json.loads(record.other_services)
            except:
                record.other_services = []
    
    return records

@router.delete("/event/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vaccination_drives_by_event(event_id: int, db: Session = Depends(get_db)):
    """Delete all vaccination drives for a specific event"""
    drives = db.query(VaccinationDrive).filter(VaccinationDrive.event_id == event_id).all()
    
    for drive in drives:
        # Delete all records for this drive first
        db.query(VaccinationDriveRecord).filter(VaccinationDriveRecord.drive_id == drive.id).delete()
        # Then delete the drive
        db.delete(drive)
    
    db.commit()
    return None