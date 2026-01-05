from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
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
# Support both with and without trailing slash
@router.get("", response_model=List[schemas.Appointment])
@router.get("/", response_model=List[schemas.Appointment])
def get_appointments(
    search: Optional[str] = Query(None, description="Search appointments"),
    status: Optional[str] = Query(None, description="Filter by status"),
    date_from: Optional[date] = Query(None, description="Filter appointments from date"),
    date_to: Optional[date] = Query(None, description="Filter appointments to date"),
    db: Session = Depends(get_db),
    current_user = Depends(auth.get_current_active_user)
):
    """Get all appointments with optional filtering. Regular users see only their appointments, admins see all."""
    query = db.query(models.Appointment)
    
    # Filter by user_id for regular users (not admins)
    if isinstance(current_user, models.User):
        query = query.filter(models.Appointment.user_id == current_user.id)
    # Admins see all appointments (no filter applied)
    
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
    
    appointments = query.order_by(models.Appointment.date.desc()).all()

    for apt in appointments:
        # Ensure user relation is present when user_id exists
        if getattr(apt, 'user', None) is None and getattr(apt, 'user_id', None):
            user_obj = db.query(models.User).filter(models.User.id == apt.user_id).first()
            if user_obj is not None:
                apt.user = user_obj
        # Attach client_name helper for response
        name = None
        if getattr(apt, 'user', None) is not None:
            name = getattr(apt.user, 'name', None)
        if not name and getattr(apt, 'pet', None) is not None:
            pet_user = getattr(apt.pet, 'user', None)
            if pet_user is not None:
                name = getattr(pet_user, 'name', None)
        if not name and getattr(apt, 'pet', None) is not None:
            name = getattr(apt.pet, 'owner_name', None)
        setattr(apt, 'client_name', name)
        
        # Ensure time is a string for response
        from datetime import time as datetime_time
        if isinstance(getattr(apt, 'time', None), datetime_time):
            apt.time = apt.time.strftime("%H:%M:%S")

    return appointments

@router.get("/{appointment_id}", response_model=schemas.Appointment)
def get_appointment(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.Admin = Depends(auth.get_current_active_user)
):
    """Get a specific appointment by ID"""
    appointment = (
        db.query(models.Appointment)
        .options(
            joinedload(models.Appointment.pet).joinedload(models.Pet.user),
            joinedload(models.Appointment.user)
        )
        .filter(models.Appointment.id == appointment_id)
        .first()
    )
    if not appointment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Appointment not found"
        )

    # Ensure user relation is present when user_id exists
    if getattr(appointment, 'user', None) is None and getattr(appointment, 'user_id', None):
        user_obj = db.query(models.User).filter(models.User.id == appointment.user_id).first()
        if user_obj is not None:
            appointment.user = user_obj

    # Attach client_name helper for response
    name = None
    if getattr(appointment, 'user', None) is not None:
        name = getattr(appointment.user, 'name', None)
    if not name and getattr(appointment, 'pet', None) is not None:
        pet_user = getattr(appointment.pet, 'user', None)
        if pet_user is not None:
            name = getattr(pet_user, 'name', None)
    if not name and getattr(appointment, 'pet', None) is not None:
        name = getattr(appointment.pet, 'owner_name', None)
    setattr(appointment, 'client_name', name)
    
    # Ensure time is a string for response
    from datetime import time as datetime_time
    if isinstance(getattr(appointment, 'time', None), datetime_time):
        appointment.time = appointment.time.strftime("%H:%M:%S")

    return appointment

@router.post("", response_model=schemas.Appointment)
@router.post("/", response_model=schemas.Appointment)
def create_appointment(
    appointment: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: models.Admin | models.User = Depends(auth.get_current_active_user)
):
    """Create a new appointment"""
    # Default/derive the user_id if not explicitly provided
    payload = appointment.dict()

    # If the creator is a regular user, use their id
    if not payload.get('user_id') and isinstance(current_user, models.User):
        payload['user_id'] = current_user.id

    # If still missing, try to infer from pet (pet.user_id or by owner_name match)
    # Also populate pet details
    if payload.get('pet_id'):
        pet = db.query(models.Pet).filter(models.Pet.id == payload['pet_id']).first()
        if pet is not None:
            # Set user_id if not provided
            if not payload.get('user_id'):
                if getattr(pet, 'user_id', None):
                    payload['user_id'] = pet.user_id
                else:
                    # Try to match by owner_name to a User record
                    owner_user = db.query(models.User).filter(models.User.name == pet.owner_name).first()
                    if owner_user is not None:
                        payload['user_id'] = owner_user.id
            
            # Populate pet details from the pet record
            if not payload.get('pet_name'):
                payload['pet_name'] = getattr(pet, 'name', None)
            if not payload.get('pet_species'):
                payload['pet_species'] = getattr(pet, 'species', None)
            if not payload.get('pet_breed'):
                payload['pet_breed'] = getattr(pet, 'breed', None)
            if not payload.get('pet_age'):
                payload['pet_age'] = str(getattr(pet, 'age', '')) if getattr(pet, 'age', None) is not None else None
            if not payload.get('pet_gender'):
                payload['pet_gender'] = getattr(pet, 'gender', None)
            if not payload.get('pet_weight'):
                payload['pet_weight'] = str(getattr(pet, 'weight', '')) if getattr(pet, 'weight', None) is not None else None
            if not payload.get('owner_name'):
                payload['owner_name'] = getattr(pet, 'owner_name', None)

    db_appointment = models.Appointment(**payload)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    
    # Ensure time is a string
    from datetime import time as datetime_time
    if isinstance(db_appointment.time, datetime_time):
        db_appointment.time = db_appointment.time.strftime("%H:%M:%S")
    
    # Create notification/alert if appointment is created by a mobile user
    if isinstance(current_user, models.User):
        try:
            import json
            import re
            
            # Generate alert ID (same logic as alerts router)
            def generate_alert_id_local(db_session: Session) -> str:
                last_alert = db_session.query(models.Alert).order_by(models.Alert.id.desc()).first()
                if last_alert:
                    match = re.search(r'ALT-(\d+)', last_alert.alert_id)
                    if match:
                        next_num = int(match.group(1)) + 1
                    else:
                        next_num = 1
                else:
                    next_num = 1
                return f"ALT-{next_num:04d}"
            
            # Get user email for notification
            user_email = current_user.email if hasattr(current_user, 'email') else None
            
            # Create alert/notification for admins
            alert_id = generate_alert_id_local(db)
            alert_title = f"New Appointment Request: {payload.get('type', 'Appointment')}"
            alert_message = f"A new appointment has been requested by {payload.get('owner_name', current_user.name)}"
            if payload.get('pet_name'):
                alert_message += f" for pet {payload.get('pet_name')}"
            if payload.get('date'):
                alert_message += f" on {payload.get('date')}"
            
            # Get all admin emails for notification
            admin_users = db.query(models.Admin).all()
            admin_emails = [admin.email for admin in admin_users if hasattr(admin, 'email') and admin.email]
            
            if admin_emails:
                db_alert = models.Alert(
                    alert_id=alert_id,
                    title=alert_title,
                    message=alert_message,
                    priority="Medium",
                    submitted_by=current_user.name if hasattr(current_user, 'name') else "System",
                    submitted_by_email=user_email or "system@pawthos.com",
                    recipients=json.dumps(admin_emails)
                )
                db.add(db_alert)
                db.commit()
        except Exception as e:
            # Don't fail appointment creation if notification fails
            print(f"Failed to create notification for appointment: {e}")
            import traceback
            traceback.print_exc()
            # Don't rollback the appointment, just skip notification
    
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
    
    # Ensure time is a string for response
    from datetime import time as datetime_time
    if isinstance(getattr(appointment, 'time', None), datetime_time):
        appointment.time = appointment.time.strftime("%H:%M:%S")
    
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

