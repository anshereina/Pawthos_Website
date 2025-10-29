from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from typing import List
from core.database import get_db
from core.models import VaccinationEvent, VaccinationDrive
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

@router.get("/by-date", response_model=List[VaccinationEventSchema])
def get_vaccination_events_by_date(date: str, db: Session = Depends(get_db)):
    """Return vaccination events occurring on the provided YYYY-MM-DD date."""
    from datetime import datetime
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

    return db.query(VaccinationEvent).filter(
        func.date(VaccinationEvent.event_date) == target_date
    ).order_by(VaccinationEvent.event_date.asc()).all()

@router.get("/scheduled", response_model=List[VaccinationEventSchema])
def get_scheduled_vaccination_events(db: Session = Depends(get_db)):
    """Get all scheduled vaccination events (for mobile app)"""
    return db.query(VaccinationEvent).filter(
        VaccinationEvent.status == "Scheduled"
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
    
    # Check if there are any vaccination drives associated with this event
    vaccination_drives = db.query(VaccinationDrive).filter(VaccinationDrive.event_id == event_id).first()
    if vaccination_drives:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete vaccination event. There are vaccination drives associated with this event. Please delete the vaccination drives first."
        )
    
    try:
        db.delete(db_event)
        db.commit()
        return None
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=400,
            detail="Cannot delete vaccination event due to existing related records. Please remove all associated vaccination drives first."
        ) 