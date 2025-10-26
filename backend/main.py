from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from core.database import engine, get_db
from core import models
from core.models import User, Pet
from core.auth import get_current_user

# Load environment variables
import os
from dotenv import load_dotenv

# Try to load from .env file first, then use system environment variables
try:
    load_dotenv()
    print("✅ .env file loaded successfully")
except Exception as e:
    print(f"⚠️ .env file loading failed: {e}")
    print("📋 Using environment variables from run.txt instead")

# Debug: Check if AI_API_KEY is loaded
ai_key = os.getenv("AI_API_KEY")
if ai_key:
    print(f"✅ AI_API_KEY loaded: {ai_key[:10]}...")
else:
    print("❌ AI_API_KEY not found in environment variables")

# Environment variables are set in run.txt
from routers import auth, users, pets, reports, alerts, animal_control_records, meat_inspection_records, shipping_permit_records
from routers import vaccination_records
from routers import reproductive_records
from routers import medical_records
from routers import vaccination_events
from routers import vaccination_drives
from routers import appointments
from routers import pain_assessments
from routers import file_uploads
# AI features (optional - may not be available in Railway)
try:
    from routers import ai_predictions
    AI_ENABLED = True
except ImportError as e:
    print(f"⚠️ AI features disabled: {e}")
    AI_ENABLED = False
from routers import mobile_auth
from routers import mobile_dashboard
from datetime import datetime
from pathlib import Path
import os

# Create database tables (skip in production/serverless environments)
# Use Alembic migrations instead for production deployments
if os.getenv("ENVIRONMENT") != "production":
    models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pawthos API", version="1.0.0")

# Global CORS handler
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "*"
    response.headers["Access-Control-Expose-Headers"] = "*"
    return response

# Configure CORS - SUPER PERMISSIVE
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow ALL origins
    allow_credentials=False,  # Disable credentials for wildcard
    allow_methods=["*"],  # Allow ALL methods
    allow_headers=["*"],  # Allow ALL headers
    expose_headers=["*"],  # Expose ALL headers
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
app.include_router(pain_assessments.router)
app.include_router(file_uploads.router)
app.include_router(reproductive_records.router)

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

# Mount static files for serving uploaded images (AFTER routers to avoid conflicts)
UPLOAD_DIR = Path(__file__).resolve().parent / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

@app.get("/")
def read_root():
    return {"message": "Welcome to Pawthos API"}

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "version": "1.0.0",
        "code_version": "2024-10-21-v3"
    } 

@app.get("/api/test")
def test_endpoint():
    """Test endpoint to verify server is running latest code"""
    return {
        "message": "Server is running with latest code - Oct 21, 2024 v3 (location field removed)",
        "timestamp": datetime.utcnow().isoformat(),
        "appointments_endpoint": "/api/appointments"
    }

@app.get("/test-cors")
def test_cors():
    return {
        "message": "CORS is working", 
        "timestamp": datetime.utcnow().isoformat(),
        "cors_origins": ["*", "https://pawthos-website.vercel.app"]
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
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = Path(file.filename).suffix.lower() if file.filename else '.jpg'
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"user_{current_user.id}_{timestamp}{file_extension}"
        file_path = UPLOAD_DIR / filename
        
        # Save file
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Update user photo URL in database
        photo_url = f"/uploads/{filename}"
        current_user.photo_url = photo_url
        db.commit()
        
        return {"photo_url": photo_url}
    except HTTPException:
        raise
    except Exception as e:
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

if __name__ == "__main__":
    import uvicorn
    # Use PORT from environment (Railway, Render, etc.) or default to 8000
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)