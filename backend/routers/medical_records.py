from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional, Union
from datetime import datetime, date
from core.database import get_db
from core.models import MedicalRecord, Pet, User, Admin
from core.schemas import MedicalRecord as MedicalRecordSchema, MedicalRecordCreate, MedicalRecordUpdate
from core import auth
from jose import JWTError, jwt
from core.config import SECRET_KEY, ALGORITHM

router = APIRouter(prefix="/medical-records", tags=["medical-records"])
security = HTTPBearer(auto_error=False)

def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[Union[User, Admin]]:
    """Get current user (Admin or User) if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_type: str = payload.get("user_type", "admin")  # Default to admin for backward compatibility
        if email is None:
            return None
        
        # Check user_type from token to determine which table to query
        if user_type == "admin":
            user = db.query(Admin).filter(Admin.email == email).first()
        else:
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
    current_user: Optional[Union[User, Admin]] = Depends(get_optional_current_user)
):
    # If user is authenticated
    if current_user:
        # Check if current_user is an Admin instance
        # For Admin users, return all medical records
        # For regular users, return only their medical records
        if isinstance(current_user, Admin):
            # Admin users can see all medical records
            records = db.query(MedicalRecord).all()
            return records
        elif isinstance(current_user, User):
            # Regular users see only their medical records
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
    try:
        # Determine user_id to satisfy FK constraint
        resolved_user_id = None

        # If the current principal is a regular user, use their id
        if isinstance(current_user, User):
            resolved_user_id = current_user.id
            print(f"✅ Resolved user_id from current_user (User): {resolved_user_id}")
        elif isinstance(current_user, Admin):
            # For Admin users, we need to resolve user_id from the pet
            print(f"✅ Current user is Admin, will resolve user_id from pet")
        else:
            print(f"⚠️ Unknown user type: {type(current_user)}")

        # If user_id not resolved from current_user, try to resolve from the pet
        if resolved_user_id is None:
            pet = db.query(Pet).filter(Pet.id == pet_id).first()
            if pet is None:
                raise HTTPException(status_code=404, detail=f"Pet with id {pet_id} not found")
            if getattr(pet, 'user_id', None):
                resolved_user_id = pet.user_id
                print(f"✅ Resolved user_id from pet.user_id: {resolved_user_id}")
            else:
                # As a fallback, try to match by owner_name
                owner_match = db.query(User).filter(User.name == pet.owner_name).first()
                if owner_match is not None:
                    resolved_user_id = owner_match.id
                    print(f"✅ Resolved user_id from owner_name match: {resolved_user_id}")

        if resolved_user_id is None:
            raise HTTPException(status_code=400, detail="Unable to resolve user for medical record (no linked user)")

        payload = record.dict(exclude_unset=True)
        payload.pop('notes', None)
        
        # Set 'date' field from 'date_visited' if not already set (database requires 'date' to be NOT NULL)
        # Convert date_visited (Date) to datetime for the 'date' field (DateTime with timezone)
        if 'date_visited' in payload and payload.get('date_visited') is not None:
            if 'date' not in payload or payload.get('date') is None:
                # Convert date to datetime at midnight UTC
                date_visited = payload['date_visited']
                # date_visited should be a date object from Pydantic, convert to datetime
                if isinstance(date_visited, date):
                    payload['date'] = datetime.combine(date_visited, datetime.min.time())
                    print(f"🔧 Converted date_visited ({date_visited}) to date ({payload['date']})")
                elif isinstance(date_visited, datetime):
                    payload['date'] = date_visited
                    print(f"🔧 date_visited is already datetime: {payload['date']}")
                elif isinstance(date_visited, str):
                    # Fallback: parse string date
                    parsed_date = date.fromisoformat(date_visited)
                    payload['date'] = datetime.combine(parsed_date, datetime.min.time())
                    print(f"🔧 Parsed date_visited string ({date_visited}) to date ({payload['date']})")
        
        print(f"🔧 Creating medical record with payload: {payload}")
        print(f"🔧 pet_id: {pet_id}, user_id: {resolved_user_id}")
        
        db_record = MedicalRecord(**payload, pet_id=pet_id, user_id=resolved_user_id)
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        print(f"✅ Medical record created successfully with id: {db_record.id}")
        return db_record
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating medical record: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create medical record: {str(e)}"
        )

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