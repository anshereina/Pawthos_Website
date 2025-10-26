from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from core.models import MedicalRecord, Pet, User
from core.schemas import MedicalRecord as MedicalRecordSchema, MedicalRecordCreate, MedicalRecordUpdate
from core import auth
from jose import JWTError, jwt
from core.config import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/medical-records", tags=["medical-records"])
security = HTTPBearer(auto_error=False)

def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            return None
        
        user = db.query(User).filter(User.email == email).first()
        return user
    except JWTError:
        return None
    except Exception:
        return None

@router.get("/pet/{pet_id}", response_model=List[MedicalRecordSchema])
def get_medical_records_by_pet(pet_id: int, db: Session = Depends(get_db)):
    records = db.query(MedicalRecord).filter(MedicalRecord.pet_id == pet_id).all()
    return records  # Always return a list, even if empty

@router.get("", response_model=List[MedicalRecordSchema])
def get_all_medical_records(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    # If user is authenticated, return their medical records
    if current_user:
        records = db.query(MedicalRecord).filter(MedicalRecord.user_id == current_user.id).all()
        return records
    
    # If not authenticated, return empty array
    return []

@router.get("/{record_id}", response_model=MedicalRecordSchema)
def get_medical_record(record_id: int, db: Session = Depends(get_db)):
    record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    return record

@router.post("", response_model=MedicalRecordSchema, status_code=status.HTTP_201_CREATED)
def create_medical_record(record: MedicalRecordCreate, db: Session = Depends(get_db)):
    payload = record.dict(exclude_unset=True)
    # Remove unsupported fields if present (e.g., 'notes' after schema change)
    payload.pop('notes', None)
    db_record = MedicalRecord(**payload)
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.post("/pet/{pet_id}", response_model=MedicalRecordSchema, status_code=status.HTTP_201_CREATED)
def create_medical_record_for_pet(
    pet_id: int,
    record: MedicalRecordCreate,
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    # Determine user_id to satisfy FK constraint
    resolved_user_id = None

    # If the current principal is a regular user, use their id
    if isinstance(current_user, User):
        resolved_user_id = current_user.id

    # Otherwise, try to resolve from the pet
    if resolved_user_id is None:
        pet = db.query(Pet).filter(Pet.id == pet_id).first()
        if pet is None:
            raise HTTPException(status_code=404, detail="Pet not found")
        if getattr(pet, 'user_id', None):
            resolved_user_id = pet.user_id
        else:
            # As a fallback, try to match by owner_name
            owner_match = db.query(User).filter(User.name == pet.owner_name).first()
            if owner_match is not None:
                resolved_user_id = owner_match.id

    if resolved_user_id is None:
        raise HTTPException(status_code=400, detail="Unable to resolve user for medical record (no linked user)")

    payload = record.dict(exclude_unset=True)
    payload.pop('notes', None)
    db_record = MedicalRecord(**payload, pet_id=pet_id, user_id=resolved_user_id)
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.put("/{record_id}", response_model=MedicalRecordSchema)
def update_medical_record(record_id: int, record_update: MedicalRecordUpdate, db: Session = Depends(get_db)):
    db_record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    for key, value in record_update.dict(exclude_unset=True).items():
        if key == 'notes':
            continue
        setattr(db_record, key, value)
    db.commit()
    db.refresh(db_record)
    return db_record

@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_medical_record(record_id: int, db: Session = Depends(get_db)):
    db_record = db.query(MedicalRecord).filter(MedicalRecord.id == record_id).first()
    if not db_record:
        raise HTTPException(status_code=404, detail="Medical record not found")
    db.delete(db_record)
    db.commit()
    return None 