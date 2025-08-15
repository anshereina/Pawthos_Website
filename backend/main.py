from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine
from core import models
from routers import auth, users, pets, reports, alerts, animal_control_records, meat_inspection_records, shipping_permit_records
from routers import vaccination_records
from routers import medical_records
from routers import vaccination_events
from routers import vaccination_drives
from routers import appointments
from routers import pain_assessments

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pawthos API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Allow both localhost and 127.0.0.1
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
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
    uvicorn.run(app, host="0.0.0.0", port=8000)