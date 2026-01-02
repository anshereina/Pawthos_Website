from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Union
from datetime import date
import re

from core.database import get_db
from core.models import Pet
from core.schemas import PetCreate, PetUpdate, Pet as PetSchema
from core import models, auth

router = APIRouter(prefix="/pets", tags=["pets"])

def generate_pet_id(db: Session) -> str:
    """Generate a unique pet ID in format PET-0001"""
    last_pet = db.query(Pet).order_by(Pet.id.desc()).first()
    if last_pet:
        # Extract number from last pet_id and increment
        match = re.search(r'PET-(\d+)', last_pet.pet_id)
        if match:
            next_num = int(match.group(1)) + 1
        else:
            next_num = 1
    else:
        next_num = 1
    
    return f"PET-{next_num:04d}"

def calculate_age(date_of_birth: Optional[date]) -> Optional[int]:
    """Calculate age from date of birth"""
    if not date_of_birth:
        return None
    
    today = date.today()
    age = today.year - date_of_birth.year
    if today.month < date_of_birth.month or (today.month == date_of_birth.month and today.day < date_of_birth.day):
        age -= 1
    return age

@router.post("", response_model=PetSchema, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PetSchema, status_code=status.HTTP_201_CREATED)
def create_pet(
    pet: PetCreate,
    db: Session = Depends(get_db),
    current_user: Union[models.Admin, models.User] = Depends(auth.get_current_user)
):
    """Create a new pet record"""
    # Validate species
    species = pet.species.lower()
    # Map common pet names to valid species
    species_mapping = {
        'cat': 'feline',
        'cats': 'feline',
        'kitten': 'feline',
        'kittens': 'feline',
        'dog': 'canine',
        'dogs': 'canine',
        'puppy': 'canine',
        'puppies': 'canine'
    }
    
    if species in species_mapping:
        species = species_mapping[species]
    elif species not in ['feline', 'canine']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Species must be either 'feline' or 'canine' (or common names like 'cat', 'dog')"
        )
    
    # Only attach user_id when the authenticated principal is a User.
    # Admin accounts do not exist in the users table, so forcing their ID
    # causes a foreign key violation when they create pets.
    user_id = current_user.id if isinstance(current_user, models.User) else None
    
    pet_id = generate_pet_id(db)
    
    db_pet = Pet(
        pet_id=pet_id,
        name=pet.name,
        owner_name=pet.owner_name,
        owner_birthday=pet.owner_birthday,
        species=species,
        date_of_birth=pet.date_of_birth,
        color=pet.color,
        breed=pet.breed,
        gender=pet.gender,
        reproductive_status=pet.reproductive_status,
        user_id=user_id  # Set to authenticated user when applicable
    )
    
    db.add(db_pet)
    db.commit()
    db.refresh(db_pet)
    return db_pet

@router.get("", response_model=List[PetSchema])
@router.get("/", response_model=List[PetSchema])
def get_pets(
    skip: int = 0,
    limit: int = 100,
    species: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Union[models.Admin, models.User] = Depends(auth.get_current_user)
):
    """Get all pets with optional filtering. Regular users see only their pets, admins see all pets."""
    query = db.query(Pet)
    
    # Filter by user_id for regular users (not admins)
    if isinstance(current_user, models.User):
        query = query.filter(Pet.user_id == current_user.id)
    # Admins see all pets (no filter applied)
    
    if species and species.lower() != 'all':
        query = query.filter(Pet.species.ilike(f"%{species}%"))
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Pet.name.ilike(search_filter)) |
            (Pet.owner_name.ilike(search_filter)) |
            (Pet.pet_id.ilike(search_filter)) |
            (Pet.breed.ilike(search_filter))
        )
    
    pets = query.offset(skip).limit(limit).all()
    return pets

@router.get("/{pet_id}", response_model=PetSchema)
def get_pet(
    pet_id: str, 
    db: Session = Depends(get_db),
    current_user: Union[models.Admin, models.User] = Depends(auth.get_current_user)
):
    """Get a specific pet by pet_id or numeric ID"""
    # Try to get by numeric ID first (for mobile app)
    if pet_id.isdigit():
        pet = db.query(Pet).filter(Pet.id == int(pet_id)).first()
    else:
        # Get by pet_id string (like "PET-0001")
        pet = db.query(Pet).filter(Pet.pet_id == pet_id).first()
    
    if pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    # Check if user has permission to view this pet
    if isinstance(current_user, models.User) and pet.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this pet")
    
    return pet

@router.put("/{pet_id}", response_model=PetSchema)
def update_pet(
    pet_id: str, 
    pet_update: PetUpdate, 
    db: Session = Depends(get_db),
    current_user: Union[models.Admin, models.User] = Depends(auth.get_current_user)
):
    """Update a pet record"""
    print(f"Updating pet {pet_id} with data: {pet_update.dict()}")
    
    # Try to get by numeric ID first (for mobile app)
    if pet_id.isdigit():
        db_pet = db.query(Pet).filter(Pet.id == int(pet_id)).first()
    else:
        db_pet = db.query(Pet).filter(Pet.pet_id == pet_id).first()
    
    if db_pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    # Check if user has permission to update this pet
    if isinstance(current_user, models.User) and db_pet.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this pet")
    
    update_data = pet_update.dict(exclude_unset=True)
    print(f"Update data (exclude_unset=True): {update_data}")
    
    # Validate species if it's being updated
    if 'species' in update_data:
        species = update_data['species'].lower()
        # Map common pet names to valid species
        species_mapping = {
            'cat': 'feline',
            'cats': 'feline',
            'kitten': 'feline',
            'kittens': 'feline',
            'dog': 'canine',
            'dogs': 'canine',
            'puppy': 'canine',
            'puppies': 'canine'
        }
        
        if species in species_mapping:
            update_data['species'] = species_mapping[species]
        elif species in ['feline', 'canine']:
            update_data['species'] = species
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Species must be either 'feline' or 'canine' (or common names like 'cat', 'dog')"
            )
    
    # Handle date conversion if date_of_birth is provided as string
    if 'date_of_birth' in update_data and isinstance(update_data['date_of_birth'], str):
        try:
            from datetime import datetime
            update_data['date_of_birth'] = datetime.strptime(update_data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format for date_of_birth. Use YYYY-MM-DD format."
            )
    
    # Handle date conversion if owner_birthday is provided as string
    if 'owner_birthday' in update_data and isinstance(update_data['owner_birthday'], str):
        try:
            from datetime import datetime
            update_data['owner_birthday'] = datetime.strptime(update_data['owner_birthday'], '%Y-%m-%d').date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format for owner_birthday. Use YYYY-MM-DD format."
            )
    
    for field, value in update_data.items():
        setattr(db_pet, field, value)
    
    db.commit()
    db.refresh(db_pet)
    return db_pet

@router.delete("/{pet_id}")
def delete_pet(
    pet_id: str, 
    db: Session = Depends(get_db),
    current_user: Union[models.Admin, models.User] = Depends(auth.get_current_user)
):
    """Delete a pet record and all related records"""
    # Try to get by numeric ID first (for mobile app)
    if pet_id.isdigit():
        db_pet = db.query(Pet).filter(Pet.id == int(pet_id)).first()
    else:
        db_pet = db.query(Pet).filter(Pet.pet_id == pet_id).first()
    
    if db_pet is None:
        raise HTTPException(status_code=404, detail="Pet not found")
    
    # Check if user has permission to delete this pet
    if isinstance(current_user, models.User) and db_pet.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this pet")
    
    # Import related models
    from core.models import VaccinationRecord, MedicalRecord, Appointment, PainAssessment
    
    try:
        # Count related records for logging
        vaccination_count = db.query(VaccinationRecord).filter(VaccinationRecord.pet_id == db_pet.id).count()
        medical_count = db.query(MedicalRecord).filter(MedicalRecord.pet_id == db_pet.id).count()
        appointment_count = db.query(Appointment).filter(Appointment.pet_id == db_pet.id).count()
        pain_assessment_count = db.query(PainAssessment).filter(PainAssessment.pet_id == db_pet.id).count()
        
        deleted_records = []
        
        # Delete related records in correct order (children first)
        
        # 1. Delete vaccination records
        if vaccination_count > 0:
            db.query(VaccinationRecord).filter(VaccinationRecord.pet_id == db_pet.id).delete()
            deleted_records.append(f"{vaccination_count} vaccination record(s)")
        
        # 2. Delete medical records
        if medical_count > 0:
            db.query(MedicalRecord).filter(MedicalRecord.pet_id == db_pet.id).delete()
            deleted_records.append(f"{medical_count} medical record(s)")
        
        # 3. Delete appointments
        if appointment_count > 0:
            db.query(Appointment).filter(Appointment.pet_id == db_pet.id).delete()
            deleted_records.append(f"{appointment_count} appointment(s)")
        
        # 4. Delete pain assessments
        if pain_assessment_count > 0:
            db.query(PainAssessment).filter(PainAssessment.pet_id == db_pet.id).delete()
            deleted_records.append(f"{pain_assessment_count} pain assessment(s)")
        
        # 5. Finally delete the pet
        db.delete(db_pet)
        db.commit()
        
        # Prepare success message
        message = f"Pet '{db_pet.name}' deleted successfully"
        if deleted_records:
            message += f". Also deleted: {', '.join(deleted_records)}"
        
        return {"message": message}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete pet: {str(e)}"
        ) 