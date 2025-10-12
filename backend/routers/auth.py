from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from core import models, schemas, auth
from core.database import get_db
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register/admin", response_model=schemas.Admin)
def register_admin(admin: schemas.AdminCreate, db: Session = Depends(get_db)):
    db_admin = auth.get_admin(db, email=admin.email)
    if db_admin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = auth.get_password_hash(admin.password)
    otp_code = auth.generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    db_admin = models.Admin(
        name=admin.name,
        email=admin.email,
        password_hash=hashed_password,
        is_confirmed=0,
        otp_code=otp_code,
        otp_expires_at=otp_expires_at
    )
    db.add(db_admin)
    db.commit()
    db.refresh(db_admin)
    # Send OTP email
    try:
        auth.send_email_otp(admin.email, otp_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")
    return db_admin

@router.post("/register/user", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new regular user (staff member)"""
    db_user = auth.get_user(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    hashed_password = auth.get_password_hash(user.password)
    otp_code = auth.generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        address=user.address,
        phone_number=user.phone_number,
        is_confirmed=0,
        otp_code=otp_code,
        otp_expires_at=otp_expires_at
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    # Send OTP email
    try:
        auth.send_email_otp(user.email, otp_code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")
    return db_user



@router.post("/confirm-otp")
def confirm_otp(data: schemas.OTPConfirm, db: Session = Depends(get_db)):
    # Try to find user in both admin and user tables
    user = auth.get_admin(db, email=data.email)
    user_type = "admin"
    
    if not user:
        user = auth.get_user(db, email=data.email)
        user_type = "user"
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_confirmed:
        return {"message": f"{user_type.capitalize()} already confirmed."}
    if not user.otp_code or not user.otp_expires_at:
        raise HTTPException(status_code=400, detail=f"No OTP set for this {user_type}.")
    if user.otp_code != data.otp_code:
        raise HTTPException(status_code=400, detail="Invalid OTP code.")
    if datetime.now(timezone.utc) > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP code expired.")
    user.is_confirmed = 1
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()
    return {"message": f"{user_type.capitalize()} email confirmed successfully."}

@router.post("/login", response_model=schemas.Token)
def login(login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = auth.authenticate_admin(db, login_data.email, login_data.password)
    user_type = "admin"
    if not user:
        user = auth.authenticate_user(db, login_data.email, login_data.password)
        user_type = "user"

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email, password, or account not confirmed",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email, "user_type": user_type}, expires_delta=access_token_expires
    )

    require_password_change = bool(getattr(user, "must_change_password", False)) if user_type == "admin" else False

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_type": user_type,
        "require_password_change": require_password_change,
    }

@router.post("/change-password")
def change_password(
    payload: schemas.ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: models.Admin | models.User = Depends(auth.get_current_active_user),
):
    # If admin flagged for first login, current_password is optional; otherwise verify
    is_admin = isinstance(current_user, models.Admin)
    if not payload.new_password or len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="New password must be at least 6 characters")

    if is_admin:
        # If not flagged, verify current password
        if not getattr(current_user, "must_change_password", False):
            if not payload.current_password or not auth.verify_password(payload.current_password, current_user.password_hash):
                raise HTTPException(status_code=400, detail="Current password is incorrect")
        # Update password and clear flag
        current_user.password_hash = auth.get_password_hash(payload.new_password)
        current_user.must_change_password = False
        db.commit()
        return {"message": "Password updated successfully"}

    # Regular user must provide current_password
    if not payload.current_password or not auth.verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Current password is incorrect")
    current_user.password_hash = auth.get_password_hash(payload.new_password)
    db.commit()
    return {"message": "Password updated successfully"}

@router.get("/me")
def read_users_me(current_user: models.Admin | models.User = Depends(auth.get_current_active_user)):
    return current_user

# Mobile-specific endpoints
class UserCreate(BaseModel):
    name: Optional[str] = None
    email: str
    password: str
    phone_number: Optional[str] = None
    address: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class VerifyOTPRequest(BaseModel):
    contactInfo: str
    otp_code: str
    otpMethod: Optional[str] = 'email'

class Token(BaseModel):
    access_token: str
    token_type: str

@router.post("/api/register", response_model=schemas.User)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Mobile app user registration endpoint"""
    # Check if user already exists
    existing_user = db.query(models.User).filter(models.User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Hash password
    hashed_password = auth.get_password_hash(user.password)
    
    # Generate OTP
    otp_code = auth.generate_otp()
    otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
    
    # Create user
    db_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hashed_password,
        phone_number=user.phone_number,
        address=user.address,
        otp_code=otp_code,
        otp_expires_at=otp_expires_at
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Send OTP via email
    if user.email:
        try:
            auth.send_email_otp(user.email, otp_code)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to send OTP: {str(e)}")
    
    return db_user

@router.post("/api/verify-otp")
def verify_otp(payload: VerifyOTPRequest, db: Session = Depends(get_db)):
    """Mobile app OTP verification endpoint"""
    # Only email OTP supported currently
    email = payload.contactInfo
    otp = payload.otp_code
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_confirmed:
        raise HTTPException(status_code=400, detail="User already verified")
    
    if not user.otp_code or user.otp_code != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    if user.otp_expires_at:
        expires_raw = user.otp_expires_at
        now_utc = datetime.now(timezone.utc)
        if expires_raw.tzinfo is None:
            expires_utc = expires_raw.replace(tzinfo=timezone.utc)
        else:
            expires_utc = expires_raw.astimezone(timezone.utc)
        if expires_utc < now_utc:
            raise HTTPException(status_code=400, detail="OTP expired")
    
    # Mark user as confirmed
    user.is_confirmed = 1
    user.otp_code = None
    user.otp_expires_at = None
    
    db.commit()
    
    return {"message": "Email verified successfully"}

@router.post("/api/login", response_model=Token)
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """Mobile app login endpoint"""
    user = auth.authenticate_user(db, user_credentials.email, user_credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_confirmed:
        raise HTTPException(status_code=400, detail="Please verify your email first")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = auth.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": user.id,
        "email": user.email,
        "name": user.name,
    }

@router.get("/api/me", response_model=schemas.User)
def read_users_me_mobile(current_user: models.User = Depends(auth.get_current_user)):
    """Mobile app current user endpoint"""
    return current_user 