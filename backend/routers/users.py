from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List, Union, Optional, Dict, Any
from datetime import datetime, timedelta, timezone
from core import models, schemas, auth
from core.database import get_db
from pydantic import BaseModel, ConfigDict
import json

router = APIRouter(prefix="/users", tags=["users"])

# Database inspection endpoints
@router.get("/inspect/admins")
def inspect_admins(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Inspect all admins in the database with detailed information"""
    try:
        admins = db.query(models.Admin).all()
        
        admin_data = []
        for admin in admins:
            admin_info = {
                "id": admin.id,
                "name": admin.name,
                "email": admin.email,
                "is_confirmed": admin.is_confirmed,
                "created_at": admin.created_at.isoformat() if admin.created_at else None,
                "has_otp_code": bool(admin.otp_code),
                "otp_expires_at": admin.otp_expires_at.isoformat() if admin.otp_expires_at else None,
                "password_hash_length": len(admin.password_hash) if admin.password_hash else 0
            }
            admin_data.append(admin_info)
        
        return {
            "total_admins": len(admins),
            "admins": admin_data,
            "summary": {
                "confirmed_admins": len([a for a in admins if a.is_confirmed == 1]),
                "unconfirmed_admins": len([a for a in admins if a.is_confirmed == 0]),
                "admins_with_otp": len([a for a in admins if a.otp_code]),
                "recent_admins": len([a for a in admins if a.created_at and (datetime.now() - a.created_at).days <= 7])
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/inspect/admins/{admin_id}")
def delete_admin_by_id(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Delete a specific admin by ID"""
    try:
        # Prevent deleting your own account
        if admin_id == current_admin.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete your own account"
            )
        
        admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
        if not admin:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Admin not found"
            )
        
        # Store admin info before deletion
        admin_info = {
            "id": admin.id,
            "name": admin.name,
            "email": admin.email,
            "is_confirmed": admin.is_confirmed,
            "created_at": admin.created_at.isoformat() if admin.created_at else None
        }
        
        db.delete(admin)
        db.commit()
        
        return {
            "message": "Admin deleted successfully",
            "deleted_admin": admin_info
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.delete("/inspect/admins/cleanup/unconfirmed")
def cleanup_unconfirmed_admins(
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Delete all unconfirmed admins (is_confirmed = 0)"""
    try:
        unconfirmed_admins = db.query(models.Admin).filter(models.Admin.is_confirmed == 0).all()
        
        if not unconfirmed_admins:
            return {
                "message": "No unconfirmed admins found",
                "deleted_count": 0
            }
        
        deleted_info = []
        for admin in unconfirmed_admins:
            admin_info = {
                "id": admin.id,
                "name": admin.name,
                "email": admin.email,
                "created_at": admin.created_at.isoformat() if admin.created_at else None
            }
            deleted_info.append(admin_info)
            db.delete(admin)
        
        db.commit()
        
        return {
            "message": f"Deleted {len(unconfirmed_admins)} unconfirmed admins",
            "deleted_count": len(unconfirmed_admins),
            "deleted_admins": deleted_info
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

# Recipients endpoints (for alerts) - accessible by any authenticated user
@router.get("/recipients", response_model=List[dict])
def get_recipients(
    search: str = None,
    db: Session = Depends(get_db),
    current_user: models.Admin = Depends(auth.get_current_admin)
):
    """Get all users and admins for recipients dropdown"""
    # Get admins
    admin_query = db.query(models.Admin)
    if search:
        search_filter = f"%{search}%"
        admin_query = admin_query.filter(
            (models.Admin.name.ilike(search_filter)) |
            (models.Admin.email.ilike(search_filter))
        )
    admins = admin_query.all()
    
    # Get users
    user_query = db.query(models.User)
    if search:
        search_filter = f"%{search}%"
        user_query = user_query.filter(
            (models.User.name.ilike(search_filter)) |
            (models.User.email.ilike(search_filter))
        )
    users = user_query.all()
    
    # Combine and format results
    recipients = []
    for admin in admins:
        recipients.append({
            "id": admin.id,
            "name": admin.name,
            "email": admin.email,
            "type": "Admin"
        })
    
    for user in users:
        recipients.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "type": "User"
        })
    
    return recipients

# Admin management endpoints
@router.get("/admins", response_model=List[schemas.Admin])
def get_admins(
    search: str = None,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Get all admins with optional search"""
    query = db.query(models.Admin)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.Admin.name.ilike(search_filter)) |
            (models.Admin.email.ilike(search_filter))
        )
    
    admins = query.all()
    return admins

@router.get("/admins/{admin_id}", response_model=schemas.Admin)
def get_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Get a specific admin by ID"""
    admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    return admin

@router.put("/admins/{admin_id}", response_model=schemas.Admin)
def update_admin(
    admin_id: int,
    admin_update: schemas.AdminBase,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Update an admin"""
    admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    for field, value in admin_update.dict(exclude_unset=True).items():
        setattr(admin, field, value)
    
    db.commit()
    db.refresh(admin)
    return admin

@router.delete("/admins/{admin_id}")
def delete_admin(
    admin_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Delete an admin"""
    if current_admin.id == admin_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account"
        )
    
    admin = db.query(models.Admin).filter(models.Admin.id == admin_id).first()
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin not found"
        )
    
    db.delete(admin)
    db.commit()
    return {"message": "Admin deleted successfully"}

@router.post("/admins/send-otp")
def send_otp_to_existing_email(
    email_data: schemas.EmailRequest,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Send OTP to real email address for admin creation"""
    # Check if email is already registered as admin
    existing_admin = auth.get_admin(db, email=email_data.email)
    
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered as admin"
        )
    
    # Check if email is already registered as a regular user
    existing_user = auth.get_user(db, email=email_data.email)
    
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered as a user. Cannot add existing users as admins."
        )
    
    # Generate OTP
    otp_code = auth.generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Send OTP email - this will validate if the email is real and can receive emails
    try:
        auth.send_email_otp(email_data.email, otp_code)
    except Exception as e:
        # If email sending fails, it means the email is invalid or doesn't exist
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail=f"Invalid email address or unable to send email to '{email_data.email}'. Please check the email address and try again."
        )
    
    return {
        "message": "OTP sent successfully",
        "email": email_data.email,
        "otp_expires_at": otp_expires_at
    }

@router.post("/admins/verify-otp")
def verify_otp_and_create_admin(
    admin_data: schemas.AdminCreateWithOTP,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Create admin and issue OTP for first login and password change."""
    print(f"🔧 Admin creation request received: {admin_data}")
    
    # Check if email is already registered as admin
    print(f"🔧 Checking if email {admin_data.email} is already an admin...")
    existing_admin = auth.get_admin(db, email=admin_data.email)
    if existing_admin:
        print(f"❌ Email {admin_data.email} is already registered as admin")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered as admin"
        )
    print(f"✅ Email {admin_data.email} is not registered as admin")
    
    # Check if email is already registered as a regular user
    print(f"🔧 Checking if email {admin_data.email} is already a user...")
    existing_user = auth.get_user(db, email=admin_data.email)
    if existing_user:
        print(f"❌ Email {admin_data.email} is already registered as user")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered as a user. Cannot add existing users as admins."
        )
    print(f"✅ Email {admin_data.email} is not registered as user")

    # Check if there's a stored OTP from the send-otp call
    # For now, we'll generate a new OTP and use it as the password
    otp_code = auth.generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)

    # Set initial password to the OTP so user can log in with it once
    hashed_password = auth.get_password_hash(otp_code)

    db_admin = models.Admin(
        name=admin_data.name,
        email=admin_data.email,
        password_hash=hashed_password,
        is_confirmed=1,
        must_change_password=True,
        otp_code=otp_code,
        otp_expires_at=otp_expires_at,
    )

    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)

    # Send OTP email with the same OTP used as password
    try:
        auth.send_email_otp(admin_data.email, otp_code)
    except Exception as e:
        db.delete(db_admin)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")

    return db_admin

class AdminOTPVerify(BaseModel):
    email: str
    otp_code: str

@router.post("/admins/verify-otp-code")
def verify_admin_otp(
    otp_data: AdminOTPVerify,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Verify OTP code for a newly created admin"""
    email = otp_data.email
    otp_code = otp_data.otp_code
    
    admin = auth.get_admin(db, email=email)
    if not admin:
        raise HTTPException(status_code=404, detail="Admin not found")
    
    if not admin.otp_code or admin.otp_code != otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    
    if admin.otp_expires_at:
        expires_raw = admin.otp_expires_at
        now_utc = datetime.now(timezone.utc)
        if expires_raw.tzinfo is None:
            expires_utc = expires_raw.replace(tzinfo=timezone.utc)
        else:
            expires_utc = expires_raw.astimezone(timezone.utc)
        if expires_utc < now_utc:
            raise HTTPException(status_code=400, detail="OTP expired")
    
    # Clear OTP after successful verification
    admin.otp_code = None
    admin.otp_expires_at = None
    db.commit()
    
    return {"message": "OTP verified successfully"}

@router.post("/admins", response_model=schemas.Admin)
def create_admin(
    admin_create: schemas.AdminCreate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Create a new admin"""
    existing_admin = auth.get_admin(db, email=admin_create.email)
    if existing_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered as admin"
        )
    
    # Check if email is already registered as a regular user
    existing_user = auth.get_user(db, email=admin_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered as a user. Cannot add existing users as admins."
        )
    
    hashed_password = auth.get_password_hash(admin_create.password)
    
    db_admin = models.Admin(
        name=admin_create.name,
        email=admin_create.email,
        password_hash=hashed_password,
        is_confirmed=1
    )
    
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    return db_admin

# User management endpoints
@router.get("/", response_model=List[schemas.User])
def get_users(
    search: str = None,
    db: Session = Depends(get_db),
    current_user: Union[models.Admin, models.User] = Depends(auth.get_current_user)
):
    """Get all users with optional search - accessible by any authenticated user"""
    query = db.query(models.User)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (models.User.name.ilike(search_filter)) |
            (models.User.email.ilike(search_filter))
        )
    
    users = query.all()
    return users

@router.get("/{user_id}", response_model=schemas.User)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Get a specific user by ID"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.put("/{user_id}", response_model=schemas.User)
def update_user(
    user_id: int,
    user_update: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Update a user"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    for field, value in user_update.dict(exclude_unset=True).items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Delete a user and all associated pets (cascade delete)"""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Count associated pets before deletion for informational message
    from core.models import Pet
    pet_count = db.query(Pet).filter(Pet.user_id == user_id).count()
    
    # Delete the user (pets will be cascade deleted automatically by the database)
    db.delete(user)
    db.commit()
    
    message = f"User '{user.name}' deleted successfully"
    if pet_count > 0:
        message += f" along with {pet_count} associated pet(s)"
    
    return {"message": message}

@router.post("/", response_model=schemas.User)
def create_user(
    user_create: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_admin: models.Admin = Depends(auth.get_current_admin)
):
    """Create a new user with OTP verification"""
    existing_user = auth.get_user(db, email=user_create.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    hashed_password = auth.get_password_hash(user_create.password)
    
    # Generate OTP for email verification
    otp_code = auth.generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    db_user = models.User(
        name=user_create.name,
        email=user_create.email,
        password_hash=hashed_password,
        address=user_create.address,
        phone_number=user_create.phone_number,
        otp_code=otp_code,
        otp_expires_at=otp_expires_at,
        is_confirmed=0  # User must verify email with OTP
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send OTP via email
    if user_create.email:
        try:
            email_sent = auth.send_email_otp(user_create.email, otp_code)
            if email_sent:
                print(f"✅ OTP email sent to {user_create.email} for admin-created user")
            else:
                print(f"⚠️ Failed to send OTP email to {user_create.email}")
                raise HTTPException(status_code=500, detail="Failed to send verification email. Please try again.")
        except Exception as e:
            print(f"⚠️ Failed to send OTP email: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")
    
    return db_user

# Mobile-specific endpoints
class UserUpdate(BaseModel):
    # Use extra='ignore' to silently ignore extra fields like user_id
    model_config = ConfigDict(extra='ignore')
    
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
async def update_profile(
    request: Request,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Web app profile update endpoint"""
    # Manually parse request body to avoid FastAPI's automatic validation
    try:
        body_bytes = await request.body()
        body = json.loads(body_bytes)
        
        print(f"🔍 Raw request body: {body}")
        print(f"🔍 Raw body keys: {list(body.keys()) if isinstance(body, dict) else 'Not a dict'}")
        
        # Filter out user_id and other unwanted fields BEFORE Pydantic validation
        allowed_fields = {'name', 'email', 'phone_number', 'address', 'photo_url'}
        filtered_data = {k: v for k, v in body.items() if k in allowed_fields}
        
        print(f"✅ Filtered body: {filtered_data}")
        print(f"✅ Filtered body keys: {list(filtered_data.keys())}")
        
        # Now create UserUpdate from filtered data (user_id is already removed)
        user_update = UserUpdate(**filtered_data)
        print(f"✅ Successfully created UserUpdate from filtered data")
    except json.JSONDecodeError as e:
        print(f"❌ JSON decode error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid JSON: {str(e)}")
    except Exception as e:
        print(f"❌ Error processing request: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=422, detail=f"Validation error: {str(e)}")
    
    # Log received data for debugging
    try:
        update_dict = user_update.model_dump(exclude_unset=True)
        print(f"✅ Successfully parsed UserUpdate")
        print(f"Received update data: {update_dict}")
        print(f"Update data keys: {list(update_dict.keys())}")
        print(f"Current user ID: {current_user.id}")
    except Exception as e:
        print(f"❌ Error logging update data: {e}")
        print(f"Error type: {type(e)}")
        import traceback
        traceback.print_exc()
    
    # Update only the fields that are provided (explicitly check each field)
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
def get_dashboard(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
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