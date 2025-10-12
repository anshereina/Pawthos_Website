from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from core.database import get_db
from core.models import Pet, ReproductiveRecord

router = APIRouter(prefix="/reproductive-records", tags=["reproductive-records"])


@router.get("/", response_model=List[dict])
def list_reproductive_records(
    species: Optional[str] = Query(None, description="Filter by species: feline/canine"),
    search: Optional[str] = Query(None, description="Search by pet_id, name, owner_name, breed"),
    db: Session = Depends(get_db),
):
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
    rr = rr_query.order_by(ReproductiveRecord.created_at.desc()).all()
    if rr:
        return [
            {
                "id": r.id,
                "pet_id": None,
                "name": r.pet_name,
                "owner_name": r.owner_name,
                "species": r.species,
                "date": r.date.isoformat() if r.date else None,
                "date_of_birth": None,
                "color": r.color,
                "breed": r.breed,
                "gender": r.gender,
                "reproductive_status": r.reproductive_status,
            }
            for r in rr
        ]

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

    pets = query.order_by(Pet.created_at.desc()).all()

    # Return only needed fields
    return [
        {
            "id": p.id,
            "pet_id": p.pet_id,
            "name": p.name,
            "owner_name": p.owner_name,
            "species": p.species,
            "date": None,
            "date_of_birth": p.date_of_birth.isoformat() if p.date_of_birth else None,
            "color": p.color,
            "breed": p.breed,
            "gender": p.gender,
            "reproductive_status": p.reproductive_status,
        }
        for p in pets
    ]


@router.post("/", response_model=dict)
def create_reproductive_record(payload: dict, db: Session = Depends(get_db)):
    try:
        record = ReproductiveRecord(
            pet_name=payload.get("name", ""),
            owner_name=payload.get("owner_name", ""),
            species=payload.get("species", ""),
            color=payload.get("color"),
            breed=payload.get("breed"),
            gender=payload.get("gender"),
            reproductive_status=payload.get("reproductive_status"),
            date=payload.get("date"),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return {"id": record.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))



