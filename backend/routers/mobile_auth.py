from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from core import models, schemas, auth
from core.database import get_db
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES
from pydantic import BaseModel
from typing import Optional
import random
import string

router = APIRouter(prefix="/api", tags=["mobile-authentication"])

# Mobile-specific Pydantic models
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

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

@router.post("/register", response_model=schemas.User)
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

@router.post("/verify-otp")
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

@router.post("/login", response_model=Token)
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
        data={"sub": user.email, "user_type": "user"}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "id": user.id,
        "email": user.email,
        "name": user.name,
    }

@router.get("/me", response_model=schemas.User)
def read_users_me_mobile(current_user: models.User = Depends(auth.get_current_mobile_user)):
    """Mobile app current user endpoint"""
    return current_user

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Request password reset for a user"""
    try:
        # Check if user exists
        user = db.query(models.User).filter(models.User.email == request.email).first()
        if not user:
            # Don't reveal if user exists or not for security
            return {"message": "If an account with this email exists, you will receive password reset instructions shortly."}
        
        # Generate reset token
        reset_token = ''.join(random.choices(string.ascii_letters + string.digits, k=32))
        reset_token_expiry = datetime.now(timezone.utc) + timedelta(hours=1)  # 1 hour expiry
        
        # Store reset token in database
        user.reset_token = reset_token
        user.reset_token_expiry = reset_token_expiry
        db.commit()
        
        # Send email with reset link
        reset_link = f"pawthos://reset-password?token={reset_token}"
        
        try:
            # Send email using existing email infrastructure
            subject = "Password Reset Request - Pawthos"
            body = f"""
            Hello,
            
            You have requested to reset your password for your Pawthos account.
            
            Click the following link to reset your password:
            {reset_link}
            
            This link will expire in 1 hour.
            
            If you did not request this password reset, please ignore this email.
            
            Best regards,
            The Pawthos Team
            """
            # Use the send_email_otp function structure but with custom message
            auth.send_email_otp(request.email, f"Reset Token: {reset_token}")
        except Exception as e:
            # Log error but don't reveal to user
            print(f"Error sending reset email: {e}")
        
        return {"message": "If an account with this email exists, you will receive password reset instructions shortly."}
        
    except Exception as e:
        print(f"Password reset request error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process password reset request")

@router.post("/reset-password")
def reset_password(request: ResetPasswordRequest, db: Session = Depends(get_db)):
    """Reset password using reset token"""
    try:
        # Find user with valid reset token
        user = db.query(models.User).filter(
            models.User.reset_token == request.token,
            models.User.reset_token_expiry > datetime.now(timezone.utc)
        ).first()
        
        if not user:
            raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
        # Validate new password
        if len(request.new_password) < 8:
            raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")
        
        # Hash new password
        hashed_password = auth.get_password_hash(request.new_password)
        
        # Update user password and clear reset token
        user.password_hash = hashed_password
        user.reset_token = None
        user.reset_token_expiry = None
        db.commit()
        
        return {"message": "Password reset successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Password reset error: {e}")
        raise HTTPException(status_code=500, detail="Failed to reset password")

