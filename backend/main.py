from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine
from core import models
from routers import auth, users, pets, reports, alerts, animal_control_records, meat_inspection_records, shipping_permit_records
from routers import vaccination_records
from routers import reproductive_records
from routers import medical_records
from routers import vaccination_events
from routers import vaccination_drives
from routers import appointments
from routers import pain_assessments
from routers import file_uploads
# AI features temporarily disabled to reduce deployment size
# from routers import ai_predictions
from routers import mobile_auth
from routers import mobile_dashboard
import os

# Create database tables (skip in production/serverless environments)
# Use Alembic migrations instead for production deployments
if os.getenv("ENVIRONMENT") != "production":
    models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pawthos API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000", 
        "http://127.0.0.1:3000",
        "http://192.168.1.13:8000",  # Mobile app backend IP
        "http://192.168.1.13:3000",  # Mobile app frontend IP
        "https://your-frontend.vercel.app",  # TODO: Replace with your actual Vercel URL
        "*"  # Allow all origins for development (remove in production)
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
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

# Mobile-specific endpoints with /api prefix
app.include_router(mobile_auth.router)  # Mobile: /api/register, /api/login, /api/verify-otp, /api/me
app.include_router(mobile_dashboard.router)  # Mobile: /api/dashboard, /api/update-profile
app.include_router(pets.router, prefix="/api")  # Mobile: /api/pets
app.include_router(appointments.router, prefix="/api")  # Mobile: /api/appointments
app.include_router(vaccination_events.router, prefix="/api")  # Mobile: /api/vaccination-events
app.include_router(vaccination_records.router, prefix="/api")  # Mobile: /api/vaccination-records
app.include_router(medical_records.router, prefix="/api")  # Mobile: /api/medical-records
app.include_router(pain_assessments.router, prefix="/api")  # Mobile: /api/pain-assessments
# AI predictions temporarily disabled to reduce deployment size
# app.include_router(ai_predictions.router, prefix="/api")  # Mobile: /api/predict, /api/predict-eld
app.include_router(file_uploads.router, prefix="/api")  # Mobile: /api/uploads

@app.get("/")
def read_root():
    return {"message": "Welcome to Pawthos API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"} 

@app.get("/test-cors")
def test_cors():
    return {"message": "CORS is working"}

if __name__ == "__main__":
    import uvicorn
    # Use PORT from environment (Railway, Render, etc.) or default to 8000
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)