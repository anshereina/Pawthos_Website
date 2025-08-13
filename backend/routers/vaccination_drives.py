from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import json
from core.database import get_db
from core.models import VaccinationDrive, VaccinationDriveRecord
from core.schemas import VaccinationDrive as VaccinationDriveSchema, VaccinationDriveCreate, VaccinationDriveRecord as VaccinationDriveRecordSchema, VaccinationDriveRecordCreate

router = APIRouter(prefix="/vaccination-drives", tags=["vaccination-drives"])

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
        
        # Create pet records
        for pet_record_data in drive_data["pet_records"]:
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