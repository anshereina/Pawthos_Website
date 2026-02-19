from datetime import datetime, timedelta, date
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import models, schemas
from .database import get_db
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, RESEND_API_KEY
import random

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
oauth2_scheme_mobile = OAuth2PasswordBearer(tokenUrl="api/login", auto_error=False)


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password):
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def verify_token(token: str, credentials_exception):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_type = payload.get("user_type")
        if email is None or user_type is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email, user_type=user_type)
    except JWTError:
        raise credentials_exception
    return token_data

def get_admin(db: Session, email: str):
    return db.query(models.Admin).filter(models.Admin.email == email).first()

def get_user(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def find_placeholder_user_by_name(db: Session, name: str):
    """Find a placeholder user account by name (for claiming during signup)"""
    return db.query(models.User).filter(
        models.User.name == name,
        models.User.is_placeholder == 1
    ).first()

def claim_placeholder_account(db: Session, placeholder_user: models.User, email: str, password: str, 
                             phone_number: str = None, address: str = None, birthday: date = None,
                             otp_code: str = None, otp_expires_at: datetime = None):
    """Claim a placeholder account by updating it with real user credentials"""
    # Update the placeholder account with real credentials
    placeholder_user.email = email
    placeholder_user.password_hash = get_password_hash(password)
    placeholder_user.is_placeholder = 0  # No longer a placeholder
    placeholder_user.is_confirmed = 0  # Require OTP verification
    
    # Update contact info if provided
    if phone_number:
        placeholder_user.phone_number = phone_number
    if address:
        placeholder_user.address = address
    if birthday:
        placeholder_user.birthday = birthday
    
    # Set OTP for email verification
    if otp_code:
        placeholder_user.otp_code = otp_code
    if otp_expires_at:
        placeholder_user.otp_expires_at = otp_expires_at
    
    db.commit()
    db.refresh(placeholder_user)
    return placeholder_user

def get_user_by_type(db: Session, email: str, user_type: str):
    if user_type == "admin":
        return get_admin(db, email)
    elif user_type == "user":
        return get_user(db, email)
    return None

def generate_otp(length=6):
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

def authenticate_admin(db: Session, email: str, password: str):
    user = get_admin(db, email)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    if not user.is_confirmed:
        return False
    return user

def authenticate_user(db: Session, email: str, password: str):
    """Authenticate a regular user (not admin)"""
    user = get_user(db, email)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    if not user.is_confirmed:
        return False
    return user

def authenticate_user_by_type(db: Session, email: str, password: str, user_type: str):
    """Authenticate user by type (admin or user)"""
    user = get_user_by_type(db, email, user_type)
    if not user:
        return False
    if not verify_password(password, user.password_hash):
        return False
    if not user.is_confirmed:
        return False
    return user

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        token_data = verify_token(token, credentials_exception)
        user = get_user_by_type(db, email=token_data.email, user_type=token_data.user_type)
        if user is None:
            raise credentials_exception
        return user
    except HTTPException:
        raise
    except Exception:
        raise credentials_exception

def get_current_active_user(current_user: Union[models.Admin, models.User] = Depends(get_current_user)):
    return current_user

def get_current_admin(current_user: Union[models.Admin, models.User] = Depends(get_current_user)):
    if not isinstance(current_user, models.Admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user

def get_current_mobile_user(token: str = Depends(oauth2_scheme_mobile), db: Session = Depends(get_db)):
    """Get current authenticated mobile user (regular user)."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_data = verify_token(token, credentials_exception)
    if token_data.user_type != "user":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User access required"
        )
    user = get_user(db, token_data.email)
    if user is None:
        raise credentials_exception
    return user


def send_email_otp(email: str, otp_code: str):
    """Send OTP code via email using Resend API only."""
    try:
        if not RESEND_API_KEY:
            return False

        import resend

        resend.api_key = RESEND_API_KEY
        params = {
            "from": "Pawthos <noreply@cityvetsanpedro.me>",
            "to": [email],
            "subject": "Pawthos Email Verification",
            "html": f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #045b26;">Pawthos Email Verification</h2>
                <p>Your OTP code is:</p>
                <h1 style="color: #D37F52; font-size: 32px; letter-spacing: 5px;">{otp_code}</h1>
                <p>This code will expire in 10 minutes.</p>
                <p style="color: #666;">If you did not request this code, please ignore this email.</p>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #999; font-size: 12px;">City Veterinary Office of San Pedro</p>
            </div>
            """,
        }
        resend.Emails.send(params)
        return True
    except Exception:
        return False