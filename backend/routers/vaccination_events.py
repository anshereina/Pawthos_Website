from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from core.database import get_db
from core.models import VaccinationEvent
from core.schemas import VaccinationEvent as VaccinationEventSchema, VaccinationEventCreate, VaccinationEventUpdate

router = APIRouter(prefix="/vaccination-events", tags=["vaccination-events"])

@router.get("/", response_model=List[VaccinationEventSchema])
def get_all_vaccination_events(db: Session = Depends(get_db)):
    return db.query(VaccinationEvent).order_by(VaccinationEvent.event_date.desc()).all()

@router.get("/upcoming", response_model=List[VaccinationEventSchema])
def get_upcoming_vaccination_events(db: Session = Depends(get_db)):
    from datetime import date
    today = date.today()
    return db.query(VaccinationEvent).filter(
        VaccinationEvent.event_date >= today
    ).order_by(VaccinationEvent.event_date.asc()).all()

@router.get("/{event_id}", response_model=VaccinationEventSchema)
def get_vaccination_event(event_id: int, db: Session = Depends(get_db)):
    event = db.query(VaccinationEvent).filter(VaccinationEvent.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Vaccination event not found")
    return event

@router.post("/", response_model=VaccinationEventSchema, status_code=status.HTTP_201_CREATED)
def create_vaccination_event(event: VaccinationEventCreate, db: Session = Depends(get_db)):
    db_event = VaccinationEvent(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.put("/{event_id}", response_model=VaccinationEventSchema)
def update_vaccination_event(event_id: int, event_update: VaccinationEventUpdate, db: Session = Depends(get_db)):
    db_event = db.query(VaccinationEvent).filter(VaccinationEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Vaccination event not found")
    for key, value in event_update.dict(exclude_unset=True).items():
        setattr(db_event, key, value)
    db.commit()
    db.refresh(db_event)
    return db_event

@router.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vaccination_event(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(VaccinationEvent).filter(VaccinationEvent.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Vaccination event not found")
    db.delete(db_event)
    db.commit()
    return None 