from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from core.database import engine, get_db
from core import models
from core.models import User, Pet
from core.auth import get_current_user
import os
from dotenv import load_dotenv
from routers import auth, users, pets, reports, alerts, animal_control_records, meat_inspection_records, shipping_permit_records
from routers import vaccination_records
from routers import reproductive_records
from routers import post_abattoir_records
from routers import medical_records
from routers import vaccination_events
from routers import vaccination_drives
from routers import appointments
from routers import walk_ins
from routers import pain_assessments
from routers import file_uploads

try:
    from routers import ai_predictions
    AI_ENABLED = True
except ImportError:
    AI_ENABLED = False

from routers import mobile_auth
from routers import mobile_dashboard
from datetime import datetime
from pathlib import Path


ALLOWED_ORIGINS = [
    "https://cityvetsanpedro.me",
    "https://www.cityvetsanpedro.me",
]


load_dotenv()

if not os.getenv("DATABASE_URL"):
    os.environ["DATABASE_URL"] = "sqlite:///./pawthos.db"

print("Creating database tables...")
try:
    from core.database import Base

    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully")
except Exception as e:
    print(f"Error creating database tables: {e}")

print("Creating bootstrap admin account...")
try:
    from core.database import SessionLocal
    from core.models import Admin
    from core.auth import get_password_hash

    db = SessionLocal()
    bootstrap_email = os.getenv("ADMIN_BOOTSTRAP_EMAIL")
    bootstrap_password = os.getenv("ADMIN_BOOTSTRAP_PASSWORD")

    if bootstrap_email and bootstrap_password:
        existing_admin = db.query(Admin).filter(Admin.email == bootstrap_email).first()

        if not existing_admin:
            admin = Admin(
                name="Administrator",
                email=bootstrap_email,
                password_hash=get_password_hash(bootstrap_password),
                is_confirmed=1,
                must_change_password=True,
            )
            db.add(admin)
            db.commit()
            print(f"Bootstrap admin account created for {bootstrap_email}")
        else:
            print(f"Bootstrap admin already exists for {bootstrap_email}; no changes made.")
    else:
        print("ADMIN_BOOTSTRAP_EMAIL/ADMIN_BOOTSTRAP_PASSWORD not set; skipping bootstrap admin creation.")

    db.close()
except Exception as e:
    print(f"Error creating bootstrap admin account: {e}")

if os.getenv("ENVIRONMENT") != "production":
    models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pawthos API", version="1.0.0", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["Authorization", "Content-Type", "Accept"],
    expose_headers=["*"],
    max_age=3600,
)

# Include routers
app.include_router(auth.router)  # Web frontend: /auth/*
app.include_router(users.router)
app.include_router(pets.router)
app.include_router(reports.router)
app.include_router(alerts.router)
app.include_router(animal_control_records.router)
app.include_router(meat_inspection_records.router)
app.include_router(shipping_permit_records.router)
app.include_router(vaccination_records.router)
app.include_router(medical_records.router)
app.include_router(vaccination_events.router)
app.include_router(vaccination_drives.router)
app.include_router(appointments.router)
app.include_router(walk_ins.router)
app.include_router(pain_assessments.router)
app.include_router(file_uploads.router)
app.include_router(reproductive_records.router)
app.include_router(post_abattoir_records.router)

# AI predictions (only if available)
if AI_ENABLED:
    app.include_router(ai_predictions.router)

# Mobile-specific endpoints with /api prefix
app.include_router(mobile_auth.router)  # Mobile: /api/register, /api/login, /api/verify-otp, /api/me
app.include_router(mobile_dashboard.router)  # Mobile: /api/dashboard, /api/update-profile
app.include_router(pets.router, prefix="/api")  # Mobile: /api/pets
app.include_router(appointments.router, prefix="/api")  # Mobile: /api/appointments
app.include_router(vaccination_events.router, prefix="/api")  # Mobile: /api/vaccination-events
app.include_router(vaccination_records.router, prefix="/api")  # Mobile: /api/vaccination-records
app.include_router(medical_records.router, prefix="/api")  # Mobile: /api/medical-records
app.include_router(pain_assessments.router, prefix="/api")  # Mobile: /api/pain-assessments
# AI predictions (only if available)
if AI_ENABLED:
    app.include_router(ai_predictions.router, prefix="/api")  # Mobile: /api/predict, /api/predict-eld
app.include_router(file_uploads.router, prefix="/api")  # Mobile: /api/uploads
app.include_router(alerts.router, prefix="/api")  # Mobile: /api/alerts
app.include_router(post_abattoir_records.router, prefix="/api")

# Mount static files for serving uploaded images (AFTER routers to avoid conflicts)
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.get("/")
def read_root():
    return {
        "message": "Welcome to Pawthos API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat(),
        "cors_status": "RESTRICTED"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "code_version": "2024-10-21-v3",
    }

# Mobile app photo upload endpoints (UPLOAD_DIR already created above)
@app.post("/api/upload-user-photo")
async def upload_user_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user profile photo (for mobile app)"""
    try:
        # Read file content first
        content = await file.read()
        
        # Validate file type - be more lenient for React Native FormData
        # React Native might not send content-type correctly, so check file extension and magic bytes
        file_extension = Path(file.filename).suffix.lower() if file.filename else '.jpg'
        valid_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
        
        # Check if content-type is valid, or if extension is valid (React Native fallback)
        content_type_valid = file.content_type and file.content_type.startswith('image/')
        extension_valid = file_extension in valid_extensions
        
        if not content_type_valid and not extension_valid:
            raise HTTPException(status_code=400, detail=f"File must be an image. Received: content_type={file.content_type}, extension={file_extension}")
        
        # Validate magic bytes (first few bytes of file to confirm it's an image)
        if len(content) < 4:
            raise HTTPException(status_code=400, detail="File is too small to be a valid image")
        
        # Check common image file signatures
        is_image = (
            content[:2] == b'\xff\xd8' or  # JPEG
            content[:8] == b'\x89PNG\r\n\x1a\n' or  # PNG
            content[:6] in (b'GIF87a', b'GIF89a') or  # GIF
            content[:4] == b'RIFF' and content[8:12] == b'WEBP'  # WEBP
        )
        
        if not is_image:
            raise HTTPException(status_code=400, detail="File does not appear to be a valid image format")
        
        # Generate unique filename
        if not file_extension or file_extension not in valid_extensions:
            file_extension = '.jpg'  # Default to jpg if extension is invalid
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"user_{current_user.id}_{timestamp}{file_extension}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Update user photo URL in database
        photo_url = f"/uploads/{filename}"
        current_user.photo_url = photo_url
        db.commit()
        db.refresh(current_user)
        
        return {"photo_url": photo_url}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to upload photo: {str(e)}")

@app.post("/api/upload-pet-photo")
async def upload_pet_photo(
    pet_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload pet photo (for mobile app)"""
    try:
        # Verify pet belongs to user
        pet = db.query(Pet).filter(Pet.id == pet_id, Pet.user_id == current_user.id).first()
        if not pet:
            raise HTTPException(status_code=404, detail="Pet not found")
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower() if file.filename else '.jpg'
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"pet_{pet_id}_{timestamp}{file_extension}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Update pet photo URL in database
        photo_url = f"/uploads/{filename}"
        pet.photo_url = photo_url
        pet.updated_at = datetime.utcnow()
        db.commit()
        
        return {"photo_url": photo_url}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload photo: {str(e)}")

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    origin = request.headers.get("origin")
    allow_origin = origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0]
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers={
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    origin = request.headers.get("origin")
    allow_origin = origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGINS[0]
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"},
        headers={
            "Access-Control-Allow-Origin": allow_origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
        }
    )

if __name__ == "__main__":
    import uvicorn
    # Use PORT from environment (Railway, Render, etc.) or default to 8000
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)