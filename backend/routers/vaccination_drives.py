from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from core.database import get_db
from core.models import VaccinationDrive, VaccinationDriveRecord, Pet, User, VaccinationRecord
from core.schemas import VaccinationDrive as VaccinationDriveSchema, VaccinationDriveCreate, VaccinationDriveRecord as VaccinationDriveRecordSchema, VaccinationDriveRecordCreate

router = APIRouter(prefix="/vaccination-drives", tags=["vaccination-drives"])

def find_or_create_user(owner_name: str, owner_contact: str, db: Session) -> User:
    """Find existing user by name or create a new one"""
    # First try to find by name
    user = db.query(User).filter(User.name == owner_name).first()
    if user:
        return user
    
    # If not found, create a new user
    # Generate a temporary email if not provided
    temp_email = f"{owner_name.lower().replace(' ', '.')}@temp.local"
    
    # Check if email already exists, if so, add a number
    counter = 1
    original_email = temp_email
    while db.query(User).filter(User.email == temp_email).first():
        temp_email = f"{original_email.split('@')[0]}{counter}@temp.local"
        counter += 1
    
    user = User(
        name=owner_name,
        email=temp_email,
        phone_number=owner_contact,
        address="",  # Empty address for now
        is_confirmed=1  # Auto-confirm for vaccination drive users
    )
    db.add(user)
    db.flush()  # Get the user ID
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
                owner_contact=pet_record_data["owner_contact"],
                species=pet_record_data["species"],
                breed=pet_record_data.get("breed"),
                color=pet_record_data.get("color"),
                age=pet_record_data.get("age"),
                sex=pet_record_data.get("sex"),
                other_services=json.dumps(pet_record_data.get("other_services", [])),
                vaccine_used=pet_record_data["vaccine_used"],
                batch_no_lot_no=pet_record_data["batch_no_lot_no"],
                vaccination_date=pet_record_data["vaccination_date"]
            )
            db.add(pet_record)
            
            # Find or create user and pet for vaccination record
            user = find_or_create_user(
                pet_record_data["owner_name"], 
                pet_record_data["owner_contact"], 
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
            vaccination_record = VaccinationRecord(
                pet_id=pet.id,
                user_id=user.id,
                vaccine_name=pet_record_data["vaccine_used"],
                vaccination_date=pet_record_data["vaccination_date"],
                veterinarian="Vaccination Drive",  # Default veterinarian for drive records
                batch_lot_no=pet_record_data["batch_no_lot_no"]
            )
            db.add(vaccination_record)
        
        db.commit()
        return {"message": "Vaccination drive created successfully", "drive_id": drive.id}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to create vaccination drive: {str(e)}")

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