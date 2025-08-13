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

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    address = Column(Text, nullable=True)
    phone_number = Column(String(20), nullable=True)
    is_confirmed = Column(Integer, nullable=False, default=0)  # 0 = False, 1 = True
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)

class Pet(Base):
    __tablename__ = "pets"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(String(20), unique=True, index=True, nullable=False)  # PET-0001 format
    name = Column(String(255), nullable=False)
    owner_name = Column(String(255), nullable=False)
    species = Column(String(50), nullable=False)  # feline, canine, etc.
    date_of_birth = Column(Date, nullable=True)
    color = Column(String(100), nullable=True)
    breed = Column(String(100), nullable=True)
    gender = Column(String(20), nullable=True)  # male, female
    reproductive_status = Column(String(20), nullable=True)  # intact, castrated, spayed
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    report_id = Column(String(20), unique=True, index=True, nullable=False)  # REP-0001 format
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    status = Column(String(20), nullable=False, default="New")  # New, In Progress, Resolved
    submitted_by = Column(String(255), nullable=False)
    submitted_by_email = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

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
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 

class AnimalControlRecord(Base):
    __tablename__ = "animal_control_records"

    id = Column(Integer, primary_key=True, index=True)
    owner_name = Column(String(255), nullable=False)
    contact_number = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    record_type = Column(String(20), nullable=False)  # 'catch' or 'surrendered'
    detail = Column(Text, nullable=True)  # For surrendered: purpose/detail
    species = Column(String(50), nullable=True)  # feline, canine, etc.
    gender = Column(String(20), nullable=True)  # male, female
    date = Column(Date, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 

class MeatInspectionRecord(Base):
    __tablename__ = "meat_inspection_records"

    id = Column(Integer, primary_key=True, index=True)
    date_of_inspection = Column(Date, nullable=False)
    time = Column(String(10), nullable=False)  # Format: "HH:MM"
    dealer_name = Column(String(255), nullable=False)
    kilos = Column(Float, nullable=False)
    date_of_slaughter = Column(Date, nullable=False)
    certificate_issued = Column(Boolean, nullable=False, default=False)
    status = Column(String(20), nullable=False, default="Pending")  # Pending, Approved, Rejected
    remarks = Column(Text, nullable=True)
    inspector_name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now()) 

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
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 

class VaccinationRecord(Base):
    __tablename__ = "vaccination_records"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    date_of_vaccination = Column(Date, nullable=False)
    vaccine_used = Column(String(255), nullable=False)
    batch_no_lot_no = Column(String(100), nullable=False)
    date_of_next_vaccination = Column(Date, nullable=True)
    veterinarian_lic_no_ptr = Column(String(100), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    pet = relationship("Pet") 

class VaccinationEvent(Base):
    __tablename__ = "vaccination_events"

    id = Column(Integer, primary_key=True, index=True)
    event_date = Column(Date, nullable=False)
    barangay = Column(String(255), nullable=False)
    service_coordinator = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="Scheduled")  # Scheduled, Confirmed, Completed, Cancelled
    event_title = Column(String(255), nullable=False)
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
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=False)
    reason_for_visit = Column(String(255), nullable=False)
    date_of_visit = Column(Date, nullable=False)
    next_visit = Column(Date, nullable=True)
    procedure_done = Column(Text, nullable=False)
    findings = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)
    vaccine_used_medication = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(Integer, ForeignKey("pets.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    type = Column(String(255), nullable=False)  # service type
    date = Column(Date, nullable=False)
    time = Column(Time, nullable=False)  # time without time zone
    veterinarian = Column(String(255), nullable=True, default="Dr. Ma Fe Templado")
    notes = Column(Text, nullable=True)
    status = Column(String(255), nullable=True, default="Pending")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    pet = relationship("Pet")
    user = relationship("User")

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