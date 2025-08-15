from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from core import models, schemas
from core.database import get_db
from core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, SMTP_USER, SMTP_PASS
import random
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

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
        user_type: str = payload.get("user_type", "admin")  # Default to admin
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email, user_type=user_type)
    except JWTError:
        raise credentials_exception
    return token_data

def get_admin(db: Session, email: str):
    return db.query(models.Admin).filter(models.Admin.email == email).first()

def get_user(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_type(db: Session, email: str, user_type: str):
    if user_type == "admin":
        return get_admin(db, email)
    elif user_type == "user":
        return get_user(db, email)
    return None

def generate_otp(length=6):
    return ''.join([str(random.randint(0, 9)) for _ in range(length)])

def send_email_otp(to_email: str, otp_code: str):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = SMTP_USER
    password = SMTP_PASS
    subject = "Your Pawthos OTP Code"
    body = f"Your OTP code is: {otp_code}. It will expire in 10 minutes."

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, to_email, msg.as_string())

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
    token_data = verify_token(token, credentials_exception)
    user = get_user_by_type(db, email=token_data.email, user_type=token_data.user_type)
    if user is None:
        raise credentials_exception
    return user

def get_current_active_user(current_user: Union[models.Admin, models.User] = Depends(get_current_user)):
    return current_user

def get_current_admin(current_user: Union[models.Admin, models.User] = Depends(get_current_user)):
    if not isinstance(current_user, models.Admin):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user 