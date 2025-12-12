from sqlalchemy import Column, Integer, String, DateTime, Text, Date, ForeignKey, Boolean, Float, Time
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_confirmed = Column(Integer, nullable=False, default=0)  # 0 = False, 1 = True
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    must_change_password = Column(Boolean, nullable=False, default=False)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=True)  # Made nullable to match mobile backend
    email = Column(String(255), unique=True, index=True, nullable=True)
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    address = Column(Text, nullable=True)
    phone_number = Column(String(20), nullable=True)
    photo_url = Column(String(500), nullable=True)  # Add photo URL column
    is_confirmed = Column(Integer, nullable=False, default=0)  # 0 = False, 1 = True
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)
    reset_token = Column(String(255), nullable=True)  # Password reset token
    reset_token_expiry = Column(DateTime(timezone=True), nullable=True)  # Password reset token expiry
    
    # Relationship
    pets = relationship("Pet", back_populates="user", cascade="all, delete-orphan")

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(String(20), nullable=False)  # Character varying field - not unique to match mobile backend
    name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)  # Keep for backward compatibility
    owner_birthday = Column(String(255), nullable=True)  # Owner's birthday
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)  # New foreign key
    species = Column(String(50), nullable=False)  # feline, canine, etc.
    date_of_birth = Column(String(255), nullable=True)  # Changed to String to match mobile backend
    color = Column(String(100), nullable=True)
    breed = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)  # male, female
    reproductive_status = Column(String(20), nullable=True)  # intact, castrated, spayed
    photo_url = Column(String(500), nullable=True)  # URL to pet photo
    created_at = Column(DateTime(timezone=True), nullable=True)  # Made nullable to match mobile backend
    updated_at = Column(DateTime(timezone=True), nullable=True)  # Made nullable to match mobile backend
    
    # Relationship
    user = relationship("User", back_populates="pets") 

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(20), unique=True, index=True, nullable=False)  # REP-0001 format
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="New")  # New, In Progress, Resolved
    submitted_by = Column(String(255), nullable=False)
    submitted_by_email = Column(String(255), nullable=False)
    image_url = Column(String(500), nullable=True)  # Optional image URL
    recipient = Column(String(255), nullable=True)  # Optional recipient
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)  # Admin who handles the report
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    admin = relationship("Admin")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_id = Column(String(20), unique=True, index=True, nullable=False)  # ALT-0001 format
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    priority = Column(String(20), nullable=False, default="Medium")  # Low, Medium, High, Critical
    submitted_by = Column(String(255), nullable=False)
    submitted_by_email = Column(String(255), nullable=False)
    recipients = Column(Text, nullable=True)  # JSON string of recipient emails
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)  # Admin who handles the alert
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    admin = relationship("Admin") 

class AnimalControlRecord(Base):
    __tablename__ = "animal_control_records"

    id = Column(Integer, primary_key=True, index=True)
    owner_name = Column(String(255), nullable=False)
    contact_number = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    record_type = Column(String(20), nullable=False)  # 'catch' or 'surrendered'
    detail = Column(Text, nullable=True)  # For surrendered: purpose/detail
    species = Column(String(50), nullable=True)  # feline, canine, etc.
    breed = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)  # male, female
    date = Column(Date, nullable=False)
    image_url = Column(String(500), nullable=True)  # URL to animal photo
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)  # Admin who handles the record
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    admin = relationship("Admin") 

class MeatInspectionRecord(Base):
    __tablename__ = "meat_inspection_records"

    id = Column(Integer, primary_key=True, index=True)
    date_of_inspection = Column(Date, nullable=False)
    time = Column(String(10), nullable=False)  # Format: "HH:MM"
    dealer_name = Column(String(255), nullable=False)
    barangay = Column(String(255), nullable=True)
    kilos = Column(Float, nullable=False)
    date_of_slaughter = Column(Date, nullable=False)
    certificate_issued = Column(Boolean, nullable=False, default=False)
    status = Column(String(20), nullable=False, default="Pending")  # Pending, Approved, Rejected
    remarks = Column(Text, nullable=True)
    inspector_name = Column(String(255), nullable=True)
    picture_url = Column(String(500), nullable=True)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)  # Admin who handles the record
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationship
    admin = relationship("Admin") 

class PostAbattoirRecord(Base):
    __tablename__ = "post_abattoir_records"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    time = Column(String(10), nullable=False)
    barangay = Column(String(255), nullable=False)
    establishment = Column(String(255), nullable=False)
    # Documents checklist
    doc_mic = Column(Boolean, nullable=False, default=False)
    doc_vhc = Column(Boolean, nullable=False, default=False)
    doc_sp = Column(Boolean, nullable=False, default=False)
    # Meat appearance checks
    color_ok = Column(Boolean, nullable=False, default=False)
    texture_ok = Column(Boolean, nullable=False, default=False)
    odor_ok = Column(Boolean, nullable=False, default=False)
    condem = Column(Boolean, nullable=False, default=False)
    owner = Column(String(255), nullable=False)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    admin = relationship("Admin")

class ShippingPermitRecord(Base):
    __tablename__ = "shipping_permit_records"

    id = Column(Integer, primary_key=True, index=True)
    owner_name = Column(String(255), nullable=False)
    contact_number = Column(String(50))
    birthdate = Column(Date, nullable=False)
    pet_name = Column(String(255), nullable=False)
    pet_age = Column(Integer, nullable=False)
    pet_species = Column(String(100))
    pet_breed = Column(String(100))
    destination = Column(String(255))
    purpose = Column(String(255))
    permit_number = Column(String(100), unique=True)
    issue_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    status = Column(String(50), default="Active")  # Active, Expired, Cancelled
    remarks = Column(Text)
    admin_id = Column(Integer, ForeignKey("admins.id"), nullable=True)  # Admin who handles the record
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationship
    admin = relationship("Admin") 

class VaccinationRecord(Base):
    __tablename__ = "vaccination_records"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=False)  # Removed ForeignKey to match mobile backend
    user_id = Column(Integer, nullable=False)  # Removed ForeignKey to match mobile backend
    vaccine_name = Column(String(255), nullable=False)
    vaccination_date = Column(DateTime(timezone=True), nullable=False)  # Changed from date_given to vaccination_date to match DB
    next_due_date = Column(DateTime(timezone=True), nullable=True)  # Changed to match mobile backend
    veterinarian = Column(String(255), nullable=True)  # Made nullable to match mobile backend
    clinic = Column(String(255), nullable=True)  # Added to match mobile backend
    notes = Column(Text, nullable=True)  # Added to match mobile backend
    batch_lot_no = Column(String(255), nullable=False)      # Added to match your DB
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True)  # Made nullable to match mobile backend 

class VaccinationEvent(Base):
    __tablename__ = "vaccination_events"

    id = Column(Integer, primary_key=True, index=True)
    event_title = Column(String(255), nullable=False)  # Moved to match mobile backend order
    barangay = Column(String(255), nullable=False)
    event_date = Column(DateTime(timezone=True), nullable=False)  # Changed to DateTime to match mobile backend
    status = Column(String(50), nullable=False, default="Scheduled")  # Scheduled, Confirmed, Completed, Cancelled
    service_coordinator = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class VaccinationDrive(Base):
    __tablename__ = "vaccination_drives"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("vaccination_events.id"), nullable=False)
    vaccine_used = Column(String(255), nullable=False)
    batch_no_lot_no = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    event = relationship("VaccinationEvent")

class VaccinationDriveRecord(Base):
    __tablename__ = "vaccination_drive_records"

    id = Column(Integer, primary_key=True, index=True)
    drive_id = Column(Integer, ForeignKey("vaccination_drives.id"), nullable=False)
    owner_name = Column(String(255), nullable=False)
    pet_name = Column(String(255), nullable=False)
    owner_contact = Column(String(50), nullable=False)
    species = Column(String(50), nullable=False)
    breed = Column(String(100), nullable=True)
    color = Column(String(100), nullable=True)
    age = Column(String(20), nullable=True)
    sex = Column(String(20), nullable=True)
    other_services = Column(Text, nullable=True)  # JSON string
    vaccine_used = Column(String(255), nullable=False)
    batch_no_lot_no = Column(String(100), nullable=False)
    vaccination_date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    drive = relationship("VaccinationDrive")

class MedicalRecord(Base):
    __tablename__ = "medical_records"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=False)  # Removed ForeignKey to match mobile backend
    user_id = Column(Integer, nullable=False)  # Removed ForeignKey to match mobile backend
    record_type = Column(String(255), nullable=True)  # Added to match mobile backend
    title = Column(String(255), nullable=True)  # Added to match mobile backend
    description = Column(Text, nullable=True)  # Added to match mobile backend
    date = Column(DateTime(timezone=True), nullable=False)  # Changed to DateTime to match mobile backend
    veterinarian = Column(String(255), nullable=True)
    clinic = Column(String(255), nullable=True)  # Added to match mobile backend
    next_due_date = Column(DateTime(timezone=True), nullable=True)  # Changed to DateTime to match mobile backend
    reason_for_visit = Column(String(255), nullable=False)
    date_visited = Column(Date, nullable=False)
    date_of_next_visit = Column(Date, nullable=True)
    procedures_done = Column(Text, nullable=True)
    findings = Column(Text, nullable=True)
    recommendations = Column(Text, nullable=True)
    medications = Column(Text, nullable=True)
    vaccine_used = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True)  # Made nullable to match mobile backend

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=True)  # Removed ForeignKey to match mobile backend
    user_id = Column(Integer, nullable=True)  # Removed ForeignKey to match mobile backend
    type = Column(String(255), nullable=False)  # service type
    date = Column(String(255), nullable=False)  # Changed to String to match mobile backend
    time = Column(String(255), nullable=False)  # Changed to String to match mobile backend
    veterinarian = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    status = Column(String(255), nullable=True, default="scheduled")  # Changed default to scheduled
    # Pet details columns
    pet_name = Column(String(255), nullable=True)
    pet_species = Column(String(255), nullable=True)
    pet_breed = Column(String(255), nullable=True)
    pet_age = Column(String(50), nullable=True)
    pet_gender = Column(String(50), nullable=True)
    pet_weight = Column(String(50), nullable=True)
    owner_name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=True)  # Made nullable to match mobile backend

class ServiceRequest(Base):
    __tablename__ = "service_requests"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(String(255), nullable=False, unique=True, index=True)
    client_name = Column(String(255), nullable=False)
    client_email = Column(String(255), nullable=True)
    client_phone = Column(String(255), nullable=True)
    requested_services = Column(Text, nullable=False)
    request_details = Column(Text, nullable=True)
    preferred_date = Column(Date, nullable=True)
    preferred_time = Column(String(255), nullable=True)
    status = Column(String(255), nullable=False, default="Pending")
    notes = Column(Text, nullable=True)
    handled_by = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 

class PainAssessment(Base):
    __tablename__ = "pain_assessments"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, nullable=False)  # Removed ForeignKey to match mobile backend
    user_id = Column(Integer, nullable=False)  # Removed ForeignKey to match mobile backend
    pet_name = Column(String(255), nullable=True)  # Made nullable to match mobile backend
    pet_type = Column(String(255), nullable=True)  # Made nullable to match mobile backend
    pain_level = Column(String(255), nullable=True)  # Made nullable to match mobile backend
    pain_score = Column(Integer, nullable=False)  # Made required to match mobile backend
    assessment_date = Column(DateTime(timezone=True), server_default=func.now())  # Changed to DateTime with default
    recommendations = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    image_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())  # Changed to DateTime with default
    basic_answers = Column(Text, nullable=True)
    assessment_answers = Column(Text, nullable=True)
    questions_completed = Column(Boolean, nullable=True) 

class ReproductiveRecord(Base):
    __tablename__ = "reproductive_records"

    id = Column(Integer, primary_key=True, index=True)
    pet_name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)
    species = Column(String(50), nullable=False)
    color = Column(String(100), nullable=True)
    breed = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)
    reproductive_status = Column(String(20), nullable=True)
    date = Column(Date, nullable=True)
    contact_number = Column(String(50), nullable=True)
    owner_birthday = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())