from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from core import models, schemas, auth
from core.database import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/api", tags=["mobile-dashboard"])

# Pydantic models for mobile endpoints
class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None
    photo_url: Optional[str] = None

class DashboardUser(BaseModel):
    id: int
    name: Optional[str]
    email: str
    phoneNumber: Optional[str]
    address: Optional[str]
    createdAt: datetime

class DashboardResponse(BaseModel):
    user: DashboardUser
    pets_count: int
    upcoming_appointments: List[dict]
    recent_pets: List[dict]

@router.put("/update-profile", response_model=schemas.User)
def update_profile(
    user_update: UserUpdate,
    current_user: models.User = Depends(auth.get_current_mobile_user),
    db: Session = Depends(get_db)
):
    """Mobile app profile update endpoint"""
    # Update only the fields that are provided
    if user_update.name is not None:
        current_user.name = user_update.name
    if user_update.email is not None:
        # Check if email is already taken by another user
        existing_user = db.query(models.User).filter(
            models.User.email == user_update.email,
            models.User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already taken")
        current_user.email = user_update.email
    if user_update.phone_number is not None:
        current_user.phone_number = user_update.phone_number
    if user_update.address is not None:
        current_user.address = user_update.address
    if user_update.photo_url is not None:
        current_user.photo_url = user_update.photo_url
    
    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update profile")

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(current_user: models.User = Depends(auth.get_current_mobile_user), db: Session = Depends(get_db)):
    """Mobile app dashboard endpoint"""
    try:
        # Pets owned by the current user
        pets_query = db.query(models.Pet).filter(models.Pet.user_id == current_user.id)
        pets_count = pets_query.count()
        recent_pets = pets_query.order_by(models.Pet.created_at.desc()).limit(3).all()

        # Upcoming appointments for the current user
        upcoming_appointments = (
            db.query(models.Appointment)
            .filter(models.Appointment.user_id == current_user.id, models.Appointment.status == "scheduled")
            .order_by(models.Appointment.date.asc())
            .limit(5)
            .all()
        )

        dashboard_user = DashboardUser(
            id=current_user.id,
            name=current_user.name,
            email=current_user.email,
            phoneNumber=current_user.phone_number,
            address=current_user.address,
            createdAt=current_user.created_at,
        )

        # Map ORM objects to response models
        recent_pets_response = []
        for pet in recent_pets:
            pet_data = {
                "id": pet.id,
                "pet_id": pet.pet_id,
                "name": pet.name,
                "owner_name": pet.owner_name,
                "species": pet.species,
                "date_of_birth": pet.date_of_birth,
                "color": pet.color,
                "breed": pet.breed,
                "gender": pet.gender,
                "reproductive_status": pet.reproductive_status,
                "photo_url": pet.photo_url,
                "user_id": pet.user_id,
                "created_at": pet.created_at,
                "updated_at": pet.updated_at,
            }
            recent_pets_response.append(pet_data)

        upcoming_appointments_response = []
        for appt in upcoming_appointments:
            appt_data = {
                "id": appt.id,
                "pet_id": appt.pet_id,
                "user_id": appt.user_id,
                "type": appt.type,
                "date": str(appt.date) if appt.date else "",
                "time": str(appt.time) if appt.time else "",
                "veterinarian": appt.veterinarian,
                "notes": appt.notes,
                "status": appt.status,
                "created_at": appt.created_at,
                "updated_at": appt.updated_at,
            }
            upcoming_appointments_response.append(appt_data)

        return DashboardResponse(
            user=dashboard_user,
            pets_count=pets_count,
            upcoming_appointments=upcoming_appointments_response,
            recent_pets=recent_pets_response,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail="Server error retrieving dashboard data")

