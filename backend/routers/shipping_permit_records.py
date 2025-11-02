from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date, datetime
import uuid

from core.database import get_db
from core.models import ShippingPermitRecord as ShippingPermitRecordModel, Pet, User
from core.schemas import (
    ShippingPermitRecord,
    ShippingPermitRecordCreate,
    ShippingPermitRecordUpdate,
    OwnerSearchResult
)

router = APIRouter(prefix="/shipping-permit-records", tags=["shipping-permit-records"])

def generate_permit_number():
    """Generate a unique permit number"""
    return f"SP-{datetime.now().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"

@router.get("/test")
def test_shipping_permit_router():
    """Test endpoint to verify router is registered"""
    return {"message": "Shipping permit records router is working", "status": "ok"}

@router.post("/", response_model=ShippingPermitRecord, status_code=status.HTTP_201_CREATED)
def create_shipping_permit_record(
    record: ShippingPermitRecordCreate,
    db: Session = Depends(get_db)
):
    """Create a new shipping permit record"""
    try:
        # Generate permit number if not provided
        if not record.permit_number:
            record.permit_number = generate_permit_number()
        
        db_record = ShippingPermitRecordModel(**record.dict())
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        return db_record
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to create shipping permit record: {str(e)}"
        )

@router.get("/", response_model=List[ShippingPermitRecord])
def get_shipping_permit_records(
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    status_filter: str = None,
    db: Session = Depends(get_db)
):
    """Get all shipping permit records with optional filtering"""
    query = db.query(ShippingPermitRecordModel)
    
    # Apply search filter
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            ShippingPermitRecordModel.owner_name.ilike(search_term) |
            ShippingPermitRecordModel.pet_name.ilike(search_term) |
            ShippingPermitRecordModel.permit_number.ilike(search_term) |
            ShippingPermitRecordModel.contact_number.ilike(search_term)
        )
    
    # Apply status filter
    if status_filter:
        query = query.filter(ShippingPermitRecordModel.status == status_filter)
    
    records = query.offset(skip).limit(limit).all()
    return records

@router.get("/search-owners", response_model=List[OwnerSearchResult])
def search_owners(
    query: Optional[str] = Query(None, description="Search term for owner name"),
    db: Session = Depends(get_db)
):
    """Search for owners (Users) by name and return their most recent pet information"""
    if not query or len(query.strip()) < 2:
        return []
    
    search_term = f"%{query.strip()}%"
    owner_map = {}
    
    # Search in Users table (UserManagement)
    users = db.query(User).filter(
        User.name.ilike(search_term)
    ).all()
    
    for user in users:
        owner_name = user.name or user.email.split('@')[0]  # Use name or email prefix as fallback
        if not owner_name:
            continue
            
        # Get user's most recent pet
        user_pets = db.query(Pet).filter(Pet.user_id == user.id).order_by(
            Pet.created_at.desc() if Pet.created_at else Pet.id.desc()
        ).all()
        
        if user_pets:
            # Use the most recent pet's information
            pet = user_pets[0]
            
            # Calculate age from date_of_birth if available
            pet_age = 0
            birthdate_obj = None
            
            if pet.date_of_birth:
                try:
                    birthdate_str = str(pet.date_of_birth)
                    # Try different date formats
                    for fmt in ['%Y-%m-%d', '%Y/%m/%d', '%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d %H:%M:%S']:
                        try:
                            birthdate_obj = datetime.strptime(birthdate_str.split()[0], fmt).date()
                            break
                        except (ValueError, IndexError):
                            continue
                    
                    if birthdate_obj:
                        # Calculate age
                        today = date.today()
                        pet_age = today.year - birthdate_obj.year - ((today.month, today.day) < (birthdate_obj.month, birthdate_obj.day))
                except Exception:
                    pass
            
            owner_map[owner_name] = {
                'owner_name': owner_name,
                'contact_number': user.phone_number,
                'pet_name': pet.name,
                'birthdate': birthdate_obj or date.today(),
                'pet_age': pet_age,
                'pet_species': pet.species,
                'pet_breed': pet.breed
            }
        else:
            # User has no pets yet, but still show them as an option
            owner_map[owner_name] = {
                'owner_name': owner_name,
                'contact_number': user.phone_number,
                'pet_name': '',
                'birthdate': date.today(),
                'pet_age': 0,
                'pet_species': '',
                'pet_breed': ''
            }
    
    # Also search in shipping permit records for additional owners
    records = db.query(ShippingPermitRecordModel).filter(
        ShippingPermitRecordModel.owner_name.ilike(search_term)
    ).order_by(ShippingPermitRecordModel.created_at.desc()).all()
    
    for record in records:
        owner_name = record.owner_name
        if owner_name not in owner_map:
            owner_map[owner_name] = {
                'owner_name': record.owner_name,
                'contact_number': record.contact_number,
                'pet_name': record.pet_name,
                'birthdate': record.birthdate,
                'pet_age': record.pet_age,
                'pet_species': record.pet_species,
                'pet_breed': record.pet_breed
            }
    
    # Convert to OwnerSearchResult format
    results = []
    for owner_name, data in owner_map.items():
        results.append(OwnerSearchResult(
            owner_name=data['owner_name'],
            contact_number=data['contact_number'],
            pet_name=data['pet_name'],
            birthdate=data['birthdate'],
            pet_age=data['pet_age'],
            pet_species=data['pet_species'],
            pet_breed=data['pet_breed']
        ))
    
    return results

@router.get("/by-date/{date}", response_model=List[ShippingPermitRecord])
def get_shipping_permit_records_by_date(
    date: date,
    db: Session = Depends(get_db)
):
    """Get shipping permit records by issue date"""
    records = db.query(ShippingPermitRecordModel).filter(
        ShippingPermitRecordModel.issue_date == date
    ).all()
    return records

@router.get("/by-status/{status}", response_model=List[ShippingPermitRecord])
def get_shipping_permit_records_by_status(
    status: str,
    db: Session = Depends(get_db)
):
    """Get shipping permit records by status"""
    records = db.query(ShippingPermitRecordModel).filter(
        ShippingPermitRecordModel.status == status
    ).all()
    return records

@router.get("/{record_id}", response_model=ShippingPermitRecord)
def get_shipping_permit_record(record_id: int, db: Session = Depends(get_db)):
    """Get a specific shipping permit record by ID"""
    record = db.query(ShippingPermitRecordModel).filter(ShippingPermitRecordModel.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping permit record not found"
        )
    return record

@router.put("/{record_id}", response_model=ShippingPermitRecord)
def update_shipping_permit_record(
    record_id: int,
    record_update: ShippingPermitRecordUpdate,
    db: Session = Depends(get_db)
):
    """Update a shipping permit record"""
    db_record = db.query(ShippingPermitRecordModel).filter(ShippingPermitRecordModel.id == record_id).first()
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping permit record not found"
        )
    
    try:
        update_data = record_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_record, field, value)
        
        db_record.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_record)
        return db_record
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to update shipping permit record: {str(e)}"
        )

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_shipping_permit_record(record_id: int, db: Session = Depends(get_db)):
    """Delete a shipping permit record"""
    db_record = db.query(ShippingPermitRecordModel).filter(ShippingPermitRecordModel.id == record_id).first()
    if not db_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shipping permit record not found"
        )
    
    try:
        db.delete(db_record)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to delete shipping permit record: {str(e)}"
        )
