from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
import json
from core.database import get_db
from core.models import VaccinationDrive, VaccinationDriveRecord, Pet, User, VaccinationRecord, VaccinationEvent
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

    # Create placeholder user record with placeholder values for all required fields
    # These values won't conflict when the pet owner creates an actual account later
    # Use owner_contact if provided, otherwise use placeholder
    user = User(
        name=owner_name,
        email=placeholder_email,
        password_hash="PLACEHOLDER_NO_PASSWORD",  # Placeholder value for NOT NULL constraint
        phone_number=owner_contact if owner_contact and owner_contact.strip() else "Not Available",  # Use provided contact or placeholder
        address="Not Available",  # Placeholder value
        photo_url="",  # Empty string for optional field
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
        # Check if a drive already exists for this event
        existing_drive = db.query(VaccinationDrive).filter(
            VaccinationDrive.event_id == drive_data["event_id"]
        ).first()
        
        if existing_drive:
            # Delete old vaccination records associated with this drive
            # We identify them by matching event date, pets, and veterinarian
            from datetime import datetime
            try:
                # Parse event date from first pet record
                first_record_date = drive_data["pet_records"][0]["vaccination_date"]
                if 'T' in first_record_date:
                    event_date = datetime.fromisoformat(first_record_date.replace('Z', '+00:00')).date()
                else:
                    event_date = datetime.strptime(first_record_date, '%Y-%m-%d').date()
            except:
                event_date = None
            
            # Get all pets that will be in the new drive (create a set of (owner_name, pet_name) tuples)
            pet_identifiers = {(pr["owner_name"], pr["pet_name"]) for pr in drive_data["pet_records"]}
            owner_names = [owner for owner, _ in pet_identifiers]
            pet_names = [pet for _, pet in pet_identifiers]
            
            # Find pets matching the owner and pet names
            matching_pets = db.query(Pet).filter(
                Pet.owner_name.in_(owner_names),
                Pet.name.in_(pet_names)
            ).all()
            
            if matching_pets and event_date:
                pet_ids = [pet.id for pet in matching_pets]
                # Delete vaccination records for these pets on this event date with the drive veterinarian
                # This ensures we only delete records that were created from this drive
                deleted_count = db.query(VaccinationRecord).filter(
                    VaccinationRecord.pet_id.in_(pet_ids),
                    func.date(VaccinationRecord.vaccination_date) == event_date,
                    VaccinationRecord.veterinarian.in_(["Dr. Fe Templado", "Vaccination Drive"])
                ).delete(synchronize_session=False)
                print(f"🗑️  Deleted {deleted_count} old vaccination record(s) for this drive")
            
            # Delete old drive records
            deleted_drive_records = db.query(VaccinationDriveRecord).filter(
                VaccinationDriveRecord.drive_id == existing_drive.id
            ).delete()
            print(f"🗑️  Deleted {deleted_drive_records} old drive record(s)")
            
            # Update existing drive
            existing_drive.vaccine_used = drive_data["vaccine_used"]
            existing_drive.batch_no_lot_no = drive_data["batch_no_lot_no"]
            drive = existing_drive
            db.flush()
        else:
            # Create new vaccination drive
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
            
            # Calculate next vaccination date (1 year from vaccination date)
            from datetime import timedelta
            next_vaccination_date = None
            if "next_vaccination_date" in pet_record_data and pet_record_data["next_vaccination_date"]:
                try:
                    next_vaccination_date_str = pet_record_data["next_vaccination_date"]
                    if 'T' in next_vaccination_date_str:
                        next_vaccination_date = datetime.fromisoformat(next_vaccination_date_str.replace('Z', '+00:00'))
                    else:
                        next_vaccination_date = datetime.strptime(next_vaccination_date_str, '%Y-%m-%d')
                except (ValueError, TypeError):
                    # If parsing fails, calculate 1 year from vaccination_date
                    next_vaccination_date = vaccination_date + timedelta(days=365)
            else:
                # Auto-calculate as 1 year from vaccination_date if not provided
                next_vaccination_date = vaccination_date + timedelta(days=365)
            
            # Get veterinarian from pet_record_data, default to 'Dr. Fe Templado' if not provided
            veterinarian = pet_record_data.get("veterinarian", "Dr. Fe Templado")
            
            vaccination_record = VaccinationRecord(
                pet_id=pet.id,
                user_id=user.id,
                vaccine_name=pet_record_data["vaccine_used"],
                vaccination_date=vaccination_date,
                next_due_date=next_vaccination_date,  # Set next vaccination date
                veterinarian=veterinarian,  # Use provided veterinarian or default to 'Dr. Fe Templado'
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

@router.get("/event/{event_id}")
def get_vaccination_drive_by_event(event_id: int, db: Session = Depends(get_db)):
    """Get all vaccination drive records for a specific event"""
    try:
        drives = db.query(VaccinationDrive).filter(VaccinationDrive.event_id == event_id).all()
        if not drives:
            return []
        
        drive_ids = [drive.id for drive in drives]
        records = db.query(VaccinationDriveRecord).filter(VaccinationDriveRecord.drive_id.in_(drive_ids)).all()
        
        # Convert records to dict and parse other_services from JSON string to list
        result = []
        for record in records:
            record_dict = {
                "id": record.id,
                "drive_id": record.drive_id,
                "owner_name": record.owner_name,
                "pet_name": record.pet_name,
                "owner_birthday": record.owner_birthday,
                "owner_contact": record.owner_contact,
                "species": record.species,
                "breed": record.breed,
                "color": record.color,
                "age": record.age,
                "sex": record.sex,
                "reproductive_status": record.reproductive_status,
                "vaccine_used": record.vaccine_used,
                "batch_no_lot_no": record.batch_no_lot_no,
                "vaccination_date": record.vaccination_date.isoformat() if record.vaccination_date else None,
                "created_at": record.created_at.isoformat() if record.created_at else None,
                "updated_at": record.updated_at.isoformat() if record.updated_at else None,
            }
            
            # Parse other_services from JSON string to list
            if record.other_services:
                try:
                    if isinstance(record.other_services, str):
                        record_dict["other_services"] = json.loads(record.other_services)
                    elif isinstance(record.other_services, list):
                        record_dict["other_services"] = record.other_services
                    else:
                        record_dict["other_services"] = []
                except:
                    record_dict["other_services"] = []
            else:
                record_dict["other_services"] = []
            
            result.append(record_dict)
        
        return result
    except Exception as e:
        import traceback
        print(f"Error in get_vaccination_drive_by_event: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Failed to fetch vaccination drive records: {str(e)}")

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
    """Delete all vaccination drives for a specific event and their associated vaccination records"""
    drives = db.query(VaccinationDrive).filter(VaccinationDrive.event_id == event_id).all()
    
    # Get the event to find the event date
    event = db.query(VaccinationEvent).filter(VaccinationEvent.id == event_id).first()
    event_date = event.event_date.date() if event else None
    
    for drive in drives:
        # Get all drive records to identify pets
        drive_records = db.query(VaccinationDriveRecord).filter(
            VaccinationDriveRecord.drive_id == drive.id
        ).all()
        
        # Extract pet identifiers (owner_name, pet_name)
        pet_identifiers = [(record.owner_name, record.pet_name) for record in drive_records]
        
        if pet_identifiers and event_date:
            owner_names = [owner for owner, _ in pet_identifiers]
            pet_names = [pet for _, pet in pet_identifiers]
            
            # Find pets matching the owner and pet names
            matching_pets = db.query(Pet).filter(
                Pet.owner_name.in_(owner_names),
                Pet.name.in_(pet_names)
            ).all()
            
            if matching_pets:
                pet_ids = [pet.id for pet in matching_pets]
                # Delete vaccination records for these pets on this event date
                # This ensures we only delete records that were created from this drive
                deleted_vac_count = db.query(VaccinationRecord).filter(
                    VaccinationRecord.pet_id.in_(pet_ids),
                    func.date(VaccinationRecord.vaccination_date) == event_date,
                    VaccinationRecord.veterinarian.in_(["Dr. Fe Templado", "Vaccination Drive"])
                ).delete(synchronize_session=False)
                print(f"🗑️  Deleted {deleted_vac_count} vaccination record(s) from pet vaccine cards")
        
        # Delete all drive records for this drive
        db.query(VaccinationDriveRecord).filter(VaccinationDriveRecord.drive_id == drive.id).delete()
        # Then delete the drive
        db.delete(drive)
    
    db.commit()
    return None