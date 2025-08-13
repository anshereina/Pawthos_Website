from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from core import models, schemas, auth
from core.database import get_db
from datetime import date

router = APIRouter(prefix="/appointments", tags=["appointments"])

def generate_appointment_id(db: Session) -> str:
    """Generate unique appointment ID in format APT-0001"""
    last_appointment = db.query(models.Appointment).order_by(models.Appointment.id.desc()).first()
    if last_appointment and hasattr(last_appointment, 'appointment_id'):
        # If the table has appointment_id column, use it
        try:
            last_num = int(last_appointment.appointment_id.split('-')[1])
            new_num = last_num + 1
        except (IndexError, ValueError):
            new_num = 1
    else:
        # Use ID-based generation if no appointment_id column
        new_num = (last_appointment.id + 1) if last_appointment else 1
    
    return f"APT-{new_num:04d}"

def generate_request_id(db: Session) -> str:
    """Generate unique request ID in format REQ-0001"""
    last_request = db.query(models.ServiceRequest).order_by(models.ServiceRequest.id.desc()).first()
    if last_request and last_request.request_id:
        try:
            last_num = int(last_request.request_id.split('-')[1])
            new_num = last_num + 1
        except (IndexError, ValueError):
            new_num = 1
    else:
        new_num = 1
    
    return f"REQ-{new_num:04d}"

# Appointment endpoints
@router.get("/", response_model=List[schemas.Appointment])
def get_appointments(
    search: Optional[str] = Query(None, description="Search appointments"),
    status: Optional[str] = Query(None, description="Filter by status"),
    date_from: Optional[date] = Query(None, description="Filter appointments from date"),
    date_to: Optional[date] = Query(None, description="Filter appointments to date"),
    db: Session = Depends(get_db)
):
    """Get all appointments with optional filtering"""
    query = db.query(models.Appointment)
    
    if search:
        search_filter = f"%{search}%"
        query = query.join(models.Pet, models.Appointment.pet_id == models.Pet.id, isouter=True)
        query = query.filter(
            (models.Pet.name.ilike(search_filter)) |
            (models.Pet.owner_name.ilike(search_filter)) |
            (models.Appointment.type.ilike(search_filter)) |
            (models.Appointment.veterinarian.ilike(search_filter))
        )
    
    if status:
        query = query.filter(models.Appointment.status == status)
    
    if date_from:
        query = query.filter(models.Appointment.date >= date_from)
    
    if date_to:
        query = query.filter(models.Appointment.date <= date_to)
    
    return query.order_by(models.Appointment.date.desc()).all()

@router.get("/{appointment_id}", response_model=schemas.Appointment)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.Admin = Depends(auth.get_current_active_user)
):
    """Get a specific appointment by ID"""
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    return appointment

@router.post("/", response_model=schemas.Appointment)
def create_appointment(
    appointment: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: models.Admin = Depends(auth.get_current_active_user)
):
    """Create a new appointment"""
    db_appointment = models.Appointment(**appointment.dict())
    
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

@router.put("/{appointment_id}", response_model=schemas.Appointment)
def update_appointment(
    appointment_id: int,
    appointment_update: schemas.AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.Admin = Depends(auth.get_current_active_user)
):
    """Update an appointment"""
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    for field, value in appointment_update.dict(exclude_unset=True).items():
        setattr(appointment, field, value)
    
    db.commit()
    db.refresh(appointment)
    return appointment

@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.Admin = Depends(auth.get_current_active_user)
):
    """Delete an appointment"""
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )
    
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}

# Service Request endpoints
@router.get("/requests/", response_model=List[schemas.ServiceRequest])
def get_service_requests(
    search: Optional[str] = Query(None, description="Search service requests"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db)
):
    """Get all service requests with optional filtering"""
    query = db.query(models.ServiceRequest)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.ServiceRequest.client_name.ilike(search_filter)) |
            (models.ServiceRequest.requested_services.ilike(search_filter)) |
            (models.ServiceRequest.request_details.ilike(search_filter))
        )
    
    if status:
        query = query.filter(models.ServiceRequest.status == status)
    
    return query.order_by(models.ServiceRequest.created_at.desc()).all()

@router.get("/requests/{request_id}", response_model=schemas.ServiceRequest)
def get_service_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.Admin = Depends(auth.get_current_active_user)
):
    """Get a specific service request by ID"""
    service_request = db.query(models.ServiceRequest).filter(models.ServiceRequest.id == request_id).first()
    if not service_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )
    return service_request

@router.post("/requests/", response_model=schemas.ServiceRequest)
def create_service_request(
    service_request: schemas.ServiceRequestCreate,
    db: Session = Depends(get_db),
    current_user: models.Admin = Depends(auth.get_current_active_user)
):
    """Create a new service request"""
    # Generate request ID
    request_id = generate_request_id(db)
    
    db_request = models.ServiceRequest(
        request_id=request_id,
        **service_request.dict()
    )
    
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

@router.put("/requests/{request_id}", response_model=schemas.ServiceRequest)
def update_service_request(
    request_id: int,
    request_update: schemas.ServiceRequestUpdate,
    db: Session = Depends(get_db),
    current_user: models.Admin = Depends(auth.get_current_active_user)
):
    """Update a service request"""
    service_request = db.query(models.ServiceRequest).filter(models.ServiceRequest.id == request_id).first()
    if not service_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )
    
    for field, value in request_update.dict(exclude_unset=True).items():
        setattr(service_request, field, value)
    
    db.commit()
    db.refresh(service_request)
    return service_request

@router.delete("/requests/{request_id}")
def delete_service_request(
    request_id: int,
    db: Session = Depends(get_db),
    current_user: models.Admin = Depends(auth.get_current_active_user)
):
    """Delete a service request"""
    service_request = db.query(models.ServiceRequest).filter(models.ServiceRequest.id == request_id).first()
    if not service_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Service request not found"
        )
    
    db.delete(service_request)
    db.commit()
    return {"message": "Service request deleted successfully"}

