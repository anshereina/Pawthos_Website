from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import nullslast
from typing import List, Optional
from datetime import date, datetime

from core.database import get_db
from core.models import Pet, ReproductiveRecord

router = APIRouter(prefix="/reproductive-records", tags=["reproductive-records"])

@router.get("/test")
def test_reproductive_records_router():
    """Test endpoint to verify router is registered"""
    return {"message": "Reproductive records router is working", "status": "ok"}

@router.get("/{record_id}/exists")
def check_record_exists(record_id: int, db: Session = Depends(get_db)):
    """Check if a ReproductiveRecord exists with the given ID"""
    record = db.query(ReproductiveRecord).filter(ReproductiveRecord.id == record_id).first()
    if record:
        return {
            "exists": True,
            "id": record.id,
            "pet_name": record.pet_name,
            "owner_name": record.owner_name
        }
    return {"exists": False, "id": record_id}

@router.get("/", response_model=List[dict])
def list_reproductive_records(
    species: Optional[str] = Query(None, description="Filter by species: feline/canine"),
    search: Optional[str] = Query(None, description="Search by pet_id, name, owner_name, breed"),
    db: Session = Depends(get_db),
):
    try:
        # Only return ReproductiveRecord entries, no Pet fallback
        rr_query = db.query(ReproductiveRecord)
        if species and species.lower() in ["feline", "canine"]:
            rr_query = rr_query.filter(ReproductiveRecord.species == species.lower())
        if search:
            like = f"%{search.lower()}%"
            rr_query = rr_query.filter(
                (ReproductiveRecord.pet_name.ilike(like))
                | (ReproductiveRecord.owner_name.ilike(like))
                | (ReproductiveRecord.breed.ilike(like))
            )
        # Order by created_at descending
        rr = rr_query.order_by(nullslast(ReproductiveRecord.created_at.desc())).all()
        
        result = []
        for r in rr:
            # Look up pet's date_of_birth from Pet table
            pet = db.query(Pet).filter(
                Pet.name == r.pet_name,
                Pet.owner_name == r.owner_name
            ).first()
            
            result.append({
                "id": r.id,
                "pet_id": pet.pet_id if pet else None,
                "name": r.pet_name or "",
                "owner_name": r.owner_name or "",
                "species": r.species or "",
                "date": r.date.isoformat() if r.date and hasattr(r.date, 'isoformat') else (str(r.date) if r.date else None),
                "date_of_birth": str(pet.date_of_birth) if pet and pet.date_of_birth else None,
                "color": r.color or "",
                "breed": r.breed or "",
                "gender": r.gender or "",
                "reproductive_status": r.reproductive_status or "",
                "contact_number": r.contact_number or "",
                "owner_birthday": r.owner_birthday.isoformat() if r.owner_birthday and hasattr(r.owner_birthday, 'isoformat') else (str(r.owner_birthday) if r.owner_birthday else None),
                "is_reproductive_record": True,  # Flag to indicate this is a ReproductiveRecord entry
            })
        return result
    except Exception as e:
        import traceback
        print(f"Error in list_reproductive_records: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.post("/", response_model=dict)
def create_reproductive_record(payload: dict, db: Session = Depends(get_db)):
    try:
        # Parse date if provided as string
        record_date = None
        if payload.get("date"):
            date_str = payload.get("date")
            if isinstance(date_str, str):
                try:
                    record_date = datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
                except:
                    try:
                        record_date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    except:
                        record_date = None
            elif isinstance(date_str, (date, datetime)):
                record_date = date_str if isinstance(date_str, date) else date_str.date()
        
        # Parse owner_birthday if provided
        owner_birthday_date = None
        if payload.get("owner_birthday"):
            birthday_str = payload.get("owner_birthday")
            if isinstance(birthday_str, str):
                try:
                    owner_birthday_date = datetime.fromisoformat(birthday_str.replace('Z', '+00:00')).date()
                except:
                    try:
                        owner_birthday_date = datetime.strptime(birthday_str, '%Y-%m-%d').date()
                    except:
                        owner_birthday_date = None
            elif isinstance(birthday_str, (date, datetime)):
                owner_birthday_date = birthday_str if isinstance(birthday_str, date) else birthday_str.date()
        
        record = ReproductiveRecord(
            pet_name=payload.get("name", ""),
            owner_name=payload.get("owner_name", ""),
            species=payload.get("species", ""),
            color=payload.get("color"),
            breed=payload.get("breed"),
            gender=payload.get("gender"),
            reproductive_status=payload.get("reproductive_status"),
            date=record_date,
            contact_number=payload.get("contact_number"),
            owner_birthday=owner_birthday_date,
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return {"id": record.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{record_id}", response_model=dict)
def update_reproductive_record(record_id: int, payload: dict, db: Session = Depends(get_db)):
    try:
        record = db.query(ReproductiveRecord).filter(ReproductiveRecord.id == record_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        
        # Parse date if provided as string
        if payload.get("date"):
            date_str = payload.get("date")
            if isinstance(date_str, str):
                try:
                    record.date = datetime.fromisoformat(date_str.replace('Z', '+00:00')).date()
                except:
                    try:
                        record.date = datetime.strptime(date_str, '%Y-%m-%d').date()
                    except:
                        pass
            elif isinstance(date_str, (date, datetime)):
                record.date = date_str if isinstance(date_str, date) else date_str.date()
        
        # Parse owner_birthday if provided
        if payload.get("owner_birthday"):
            birthday_str = payload.get("owner_birthday")
            if isinstance(birthday_str, str):
                try:
                    record.owner_birthday = datetime.fromisoformat(birthday_str.replace('Z', '+00:00')).date()
                except:
                    try:
                        record.owner_birthday = datetime.strptime(birthday_str, '%Y-%m-%d').date()
                    except:
                        pass
            elif isinstance(birthday_str, (date, datetime)):
                record.owner_birthday = birthday_str if isinstance(birthday_str, date) else birthday_str.date()
        elif "owner_birthday" in payload and payload.get("owner_birthday") is None:
            record.owner_birthday = None
        
        # Update other fields
        if "name" in payload:
            record.pet_name = payload.get("name", "")
        if "owner_name" in payload:
            record.owner_name = payload.get("owner_name", "")
        if "species" in payload:
            record.species = payload.get("species", "")
        if "color" in payload:
            record.color = payload.get("color")
        if "breed" in payload:
            record.breed = payload.get("breed")
        if "gender" in payload:
            record.gender = payload.get("gender")
        if "reproductive_status" in payload:
            record.reproductive_status = payload.get("reproductive_status")
        if "contact_number" in payload:
            record.contact_number = payload.get("contact_number")
        
        db.commit()
        db.refresh(record)
        return {"id": record.id}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{record_id}", response_model=dict)
def delete_reproductive_record(record_id: int, db: Session = Depends(get_db)):
    try:
        print(f"Attempting to delete ReproductiveRecord with id: {record_id}")
        record = db.query(ReproductiveRecord).filter(ReproductiveRecord.id == record_id).first()
        
        if not record:
            # Check if it exists in Pet table (shouldn't be deleted from here)
            pet = db.query(Pet).filter(Pet.id == record_id).first()
            if pet:
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot delete Pet record from reproductive records endpoint. This is a Pet table entry."
                )
            raise HTTPException(status_code=404, detail=f"ReproductiveRecord with id {record_id} not found")
        
        print(f"Found record: {record.id}, pet_name: {record.pet_name}, owner_name: {record.owner_name}")
        db.delete(record)
        db.commit()
        print(f"Successfully deleted ReproductiveRecord {record_id}")
        return {"message": "Record deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting record {record_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))


