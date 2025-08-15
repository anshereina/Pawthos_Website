from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from core import models, schemas, auth
from core.database import get_db
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES

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
    # Try to authenticate as admin first
    user = auth.authenticate_admin(db, login_data.email, login_data.password)
    user_type = "admin"
    
    # If not admin, try as regular user
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
    return {"access_token": access_token, "token_type": "bearer", "user_type": user_type}

@router.get("/me")
def read_users_me(current_user: models.Admin | models.User = Depends(auth.get_current_active_user)):
    return current_user 