from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from . import models, schemas
from .database import get_db
from .config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES, SMTP_USER, SMTP_PASS
import random
import smtplib
import logging
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

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

def find_placeholder_user_by_name(db: Session, name: str):
    """Find a placeholder user account by name (for claiming during signup)"""
    return db.query(models.User).filter(
        models.User.name == name,
        models.User.is_placeholder == 1
    ).first()

def claim_placeholder_account(db: Session, placeholder_user: models.User, email: str, password: str, 
                             phone_number: str = None, address: str = None):
    """Claim a placeholder account by updating it with real user credentials"""
    # Update the placeholder account with real credentials
    placeholder_user.email = email
    placeholder_user.password_hash = get_password_hash(password)
    placeholder_user.is_placeholder = 0  # No longer a placeholder
    placeholder_user.is_confirmed = 1  # Auto-confirm since they're claiming an existing account
    
    # Update contact info if provided
    if phone_number:
        placeholder_user.phone_number = phone_number
    if address:
        placeholder_user.address = address
    
    # Clear any OTP codes since we're auto-confirming
    placeholder_user.otp_code = None
    placeholder_user.otp_expires_at = None
    
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

def send_email_otp(to_email: str, otp_code: str):
    smtp_server = "smtp.gmail.com"
    smtp_port = 587
    sender_email = SMTP_USER
    password = SMTP_PASS
    
    # Debug logging
    print(f"SMTP_USER: {SMTP_USER}")
    print(f"SMTP_PASS: {'*' * len(SMTP_PASS) if SMTP_PASS else 'None'}")
    print(f"Sending email to: {to_email}")
    
    if not sender_email or not password:
        raise Exception(f"SMTP credentials not configured. SMTP_USER: {sender_email}, SMTP_PASS: {'set' if password else 'not set'}")
    
    subject = "Your Pawthos OTP Code"
    body = f"Your OTP code is: {otp_code}. It will expire in 10 minutes."

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            print(f"Connected to SMTP server: {smtp_server}:{smtp_port}")
            server.starttls()
            print("TLS started successfully")
            server.login(sender_email, password)
            print("SMTP login successful")
            server.sendmail(sender_email, to_email, msg.as_string())
            print("Email sent successfully")
    except smtplib.SMTPAuthenticationError as e:
        print(f"SMTP Authentication Error: {e}")
        raise Exception(f"SMTP authentication failed: {e}")
    except smtplib.SMTPRecipientsRefused as e:
        print(f"SMTP Recipients Refused: {e}")
        raise Exception(f"Email address rejected: {e}")
    except smtplib.SMTPServerDisconnected as e:
        print(f"SMTP Server Disconnected: {e}")
        raise Exception(f"SMTP server disconnected: {e}")
    except Exception as e:
        print(f"SMTP Error: {e}")
        raise Exception(f"Failed to send email: {e}")

def authenticate_admin(db: Session, email: str, password: str):
    user = get_admin(db, email)
    if not user:
        print(f"❌ Admin not found: {email}")
        return False
    if not verify_password(password, user.password_hash):
        print(f"❌ Password verification failed for: {email}")
        return False
    if not user.is_confirmed:
        print(f"❌ Admin not confirmed: {email} (is_confirmed: {user.is_confirmed})")
        return False
    print(f"✅ Admin authentication successful: {email}")
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
    """Send OTP code via email"""
    try:
        if not SMTP_USER or not SMTP_PASS:
            print("⚠️ SMTP credentials not configured, skipping email send")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = email
        msg['Subject'] = "Pawthos OTP Code"
        
        body = f"""
        Your OTP code is: {otp_code}
        
        This code will expire in 10 minutes.
        
        If you did not request this code, please ignore this email.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email with timeout
        print(f"🔧 Attempting to send email to {email}")
        
        # Try multiple SMTP servers and ports
        smtp_configs = [
            ('smtp.gmail.com', 587, False),  # Gmail TLS
            ('smtp.gmail.com', 465, True),   # Gmail SSL
            ('smtp-mail.outlook.com', 587, False),  # Outlook TLS
            ('smtp-mail.outlook.com', 465, True),    # Outlook SSL
        ]
        
        for host, port, use_ssl in smtp_configs:
            try:
                print(f"🔧 Trying {host}:{port} (SSL: {use_ssl})")
                if use_ssl:
                    server = smtplib.SMTP_SSL(host, port, timeout=10)
                    print(f"🔧 SMTP SSL connection established on {host}:{port}")
                else:
                    server = smtplib.SMTP(host, port, timeout=10)
                    print(f"🔧 SMTP connection established on {host}:{port}")
                    server.starttls()
                    print(f"🔧 TLS started")
                
                server.login(SMTP_USER, SMTP_PASS)
                print(f"🔧 SMTP login successful")
                text = msg.as_string()
                server.sendmail(SMTP_USER, email, text)
                print(f"🔧 Email sent successfully")
                server.quit()
                print(f"🔧 SMTP connection closed")
                
                print(f"✅ OTP email sent to {email} via {host}:{port}")
                return True
                
            except Exception as e:
                print(f"❌ Failed {host}:{port}: {str(e)}")
                continue
        
        print(f"❌ All SMTP servers failed for {email}")
        return False
        
    except Exception as e:
        print(f"❌ Error sending email to {email}: {str(e)}")
        return False

def send_password_reset_email(email: str, reset_token: str, reset_link: str):
    """Send password reset email"""
    try:
        if not SMTP_USER or not SMTP_PASS:
            print("⚠️ SMTP credentials not configured, skipping email send")
            return False
        
        # Create message
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = email
        msg['Subject'] = "Password Reset Request - Pawthos"
        
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
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        text = msg.as_string()
        server.sendmail(SMTP_USER, email, text)
        server.quit()
        
        print(f"✅ Password reset email sent to {email}")
        return True
        
    except Exception as e:
        print(f"❌ Error sending password reset email to {email}: {str(e)}")
        return False 