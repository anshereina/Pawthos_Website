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

@router.get("/", response_model=List[dict])
def list_reproductive_records(
    species: Optional[str] = Query(None, description="Filter by species: feline/canine"),
    search: Optional[str] = Query(None, description="Search by pet_id, name, owner_name, breed"),
    db: Session = Depends(get_db),
):
    try:
        # Prefer dedicated reproductive records; fallback to pets if empty
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
        
        if rr:
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
                    "is_reproductive_record": True,  # Flag to indicate this is a ReproductiveRecord entry
                })
            return result

        # Fallback to pets if no dedicated records exist yet
        query = db.query(Pet)

        if species and species.lower() in ["feline", "canine"]:
            query = query.filter(Pet.species == species.lower())

        if search:
            like = f"%{search.lower()}%"
            query = query.filter(
                (Pet.pet_id.ilike(like))
                | (Pet.name.ilike(like))
                | (Pet.owner_name.ilike(like))
                | (Pet.breed.ilike(like))
            )

        # Order by created_at descending (nulls last), fallback to id
        pets = query.order_by(nullslast(Pet.created_at.desc()), Pet.id.desc()).all()

        # Return only needed fields
        return [
            {
                "id": p.id,
                "pet_id": p.pet_id or "",
                "name": p.name or "",
                "owner_name": p.owner_name or "",
                "species": p.species or "",
                "date": None,
                "date_of_birth": str(p.date_of_birth) if p.date_of_birth else None,
                "color": p.color or "",
                "breed": p.breed or "",
                "gender": p.gender or "",
                "reproductive_status": p.reproductive_status or "",
                "is_reproductive_record": False,  # Flag to indicate this is a Pet entry (fallback)
            }
            for p in pets
        ]
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
        
        record = ReproductiveRecord(
            pet_name=payload.get("name", ""),
            owner_name=payload.get("owner_name", ""),
            species=payload.get("species", ""),
            color=payload.get("color"),
            breed=payload.get("breed"),
            gender=payload.get("gender"),
            reproductive_status=payload.get("reproductive_status"),
            date=record_date,
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
        record = db.query(ReproductiveRecord).filter(ReproductiveRecord.id == record_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Record not found")
        
        db.delete(record)
        db.commit()
        return {"message": "Record deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))


