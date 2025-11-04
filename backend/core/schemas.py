from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
from typing import Optional
from datetime import datetime, date, time

class AdminBase(BaseModel):
    name: str
    email: EmailStr

class AdminCreate(AdminBase):
    password: str

class AdminCreateWithOTP(AdminBase):
    password: str
    otp_code: str

class Admin(BaseModel):
    id: int
    name: str
    email: EmailStr
    created_at: datetime
    is_confirmed: int
    must_change_password: bool | None = None

    class Config:
        from_attributes = True

class ChangePasswordRequest(BaseModel):
    current_password: str | None = None
    new_password: str

class UserBase(BaseModel):
    name: str
    email: EmailStr
    address: Optional[str] = None
    phone_number: Optional[str] = None
    photo_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None
    photo_url: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    is_confirmed: int

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class EmailRequest(BaseModel):
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str
    user_type: str
    require_password_change: bool | None = None

class TokenData(BaseModel):
    email: Optional[str] = None
    user_type: Optional[str] = None

class OTPConfirm(BaseModel):
    email: EmailStr
    otp_code: str

class ReportBase(BaseModel):
    title: str
    description: str
    status: Optional[str] = "New"
    submitted_by: str
    submitted_by_email: EmailStr
    image_url: Optional[str] = None
    recipient: Optional[str] = None
    admin_id: Optional[int] = None

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    image_url: Optional[str] = None
    recipient: Optional[str] = None
    admin_id: Optional[int] = None

class Report(ReportBase):
    id: int
    report_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    admin: Optional[Admin] = None

    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    title: str
    message: str
    priority: Optional[str] = "Medium"
    submitted_by: str
    submitted_by_email: EmailStr
    recipients: Optional[str] = None  # JSON string of recipient emails
    admin_id: Optional[int] = None

class AlertCreate(AlertBase):
    recipients: Optional[str] = None  # JSON string of recipient emails

class AlertUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    priority: Optional[str] = None
    recipients: Optional[str] = None
    admin_id: Optional[int] = None

class Alert(AlertBase):
    id: int
    alert_id: str
    recipients: Optional[str] = None  # JSON string of recipient emails
    created_at: datetime
    updated_at: Optional[datetime] = None
    admin: Optional[Admin] = None

    class Config:
        from_attributes = True

class PetBase(BaseModel):
    name: str
    owner_name: str
    species: str
    date_of_birth: Optional[date] = None
    color: Optional[str] = None
    breed: Optional[str] = None
    gender: Optional[str] = None
    reproductive_status: Optional[str] = None
    photo_url: Optional[str] = None

class PetCreate(PetBase):
    pass

class PetUpdate(BaseModel):
    name: Optional[str] = None
    owner_name: Optional[str] = None
    species: Optional[str] = None
    date_of_birth: Optional[date] = None
    color: Optional[str] = None
    breed: Optional[str] = None
    gender: Optional[str] = None
    reproductive_status: Optional[str] = None
    photo_url: Optional[str] = None

class Pet(BaseModel):
    id: int
    pet_id: str
    name: str
    owner_name: str
    species: str
    date_of_birth: Optional[date] = None
    color: Optional[str] = None
    breed: Optional[str] = None
    gender: Optional[str] = None
    reproductive_status: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AnimalControlRecordBase(BaseModel):
    owner_name: str
    contact_number: Optional[str] = None
    address: Optional[str] = None
    record_type: str  # 'catch' or 'surrendered'
    detail: Optional[str] = None
    species: Optional[str] = None  # feline, canine, etc.
    breed: Optional[str] = None
    gender: Optional[str] = None  # male, female
    date: date
    image_url: Optional[str] = None  # URL to animal photo
    admin_id: Optional[int] = None

class AnimalControlRecordCreate(AnimalControlRecordBase):
    pass

class AnimalControlRecordUpdate(BaseModel):
    owner_name: Optional[str] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    record_type: Optional[str] = None
    detail: Optional[str] = None
    species: Optional[str] = None
    breed: Optional[str] = None
    gender: Optional[str] = None
    date: Optional[str] = None  # Changed from Optional[date] to Optional[str] to handle string dates
    image_url: Optional[str] = None  # URL to animal photo
    admin_id: Optional[int] = None

    class Config:
        from_attributes = True
        # Allow extra fields to be ignored
        extra = "ignore"

class AnimalControlRecord(AnimalControlRecordBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    admin: Optional[Admin] = None

    class Config:
        from_attributes = True 

class MeatInspectionRecordBase(BaseModel):
    date_of_inspection: date
    time: str  # Format: "HH:MM"
    dealer_name: str
    barangay: Optional[str] = None
    kilos: float
    date_of_slaughter: date
    certificate_issued: bool = False
    status: str = "Pending"  # Pending, Approved, Rejected
    remarks: Optional[str] = None
    inspector_name: Optional[str] = None
    picture_url: Optional[str] = None
    admin_id: Optional[int] = None

class MeatInspectionRecordCreate(MeatInspectionRecordBase):
    pass

class MeatInspectionRecordUpdate(BaseModel):
    date_of_inspection: Optional[date] = None
    time: Optional[str] = None
    dealer_name: Optional[str] = None
    barangay: Optional[str] = None
    kilos: Optional[float] = None
    date_of_slaughter: Optional[date] = None
    certificate_issued: Optional[bool] = None
    status: Optional[str] = None
    remarks: Optional[str] = None
    inspector_name: Optional[str] = None
    picture_url: Optional[str] = None
    admin_id: Optional[int] = None

class MeatInspectionRecord(MeatInspectionRecordBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    admin: Optional[Admin] = None

    class Config:
        from_attributes = True 

# Post Abattoir Record Schemas
class PostAbattoirRecordBase(BaseModel):
    date: date
    time: str
    barangay: str
    establishment: str
    doc_mic: bool = False
    doc_vhc: bool = False
    doc_sp: bool = False
    color_ok: bool = False
    texture_ok: bool = False
    odor_ok: bool = False
    condem: bool = False
    owner: str
    admin_id: Optional[int] = None

class PostAbattoirRecordCreate(PostAbattoirRecordBase):
    pass

class PostAbattoirRecordUpdate(BaseModel):
    date: Optional[date] = None
    time: Optional[str] = None
    barangay: Optional[str] = None
    establishment: Optional[str] = None
    doc_mic: Optional[bool] = None
    doc_vhc: Optional[bool] = None
    doc_sp: Optional[bool] = None
    color_ok: Optional[bool] = None
    texture_ok: Optional[bool] = None
    odor_ok: Optional[bool] = None
    condem: Optional[bool] = None
    owner: Optional[str] = None
    admin_id: Optional[int] = None

class PostAbattoirRecord(PostAbattoirRecordBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    admin: Optional[Admin] = None

    class Config:
        from_attributes = True

# Shipping Permit Record Schemas
class ShippingPermitRecordBase(BaseModel):
    owner_name: str
    contact_number: Optional[str] = None
    birthdate: date
    pet_name: str
    pet_age: int
    pet_species: Optional[str] = None
    pet_breed: Optional[str] = None
    destination: Optional[str] = None
    purpose: Optional[str] = None
    permit_number: Optional[str] = None
    issue_date: date
    expiry_date: date
    status: Optional[str] = "Active"
    remarks: Optional[str] = None
    admin_id: Optional[int] = None

class ShippingPermitRecordCreate(ShippingPermitRecordBase):
    pass

class ShippingPermitRecordUpdate(BaseModel):
    owner_name: Optional[str] = None
    contact_number: Optional[str] = None
    birthdate: Optional[date] = None
    pet_name: Optional[str] = None
    pet_age: Optional[int] = None
    pet_species: Optional[str] = None
    pet_breed: Optional[str] = None
    destination: Optional[str] = None
    purpose: Optional[str] = None
    permit_number: Optional[str] = None
    issue_date: Optional[date] = None
    expiry_date: Optional[date] = None
    status: Optional[str] = None
    remarks: Optional[str] = None
    admin_id: Optional[int] = None

class ShippingPermitRecord(ShippingPermitRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime
    admin: Optional[Admin] = None

    class Config:
        from_attributes = True 

class OwnerSearchResult(BaseModel):
    owner_name: str
    contact_number: Optional[str] = None
    pet_name: str
    birthdate: date
    pet_age: int
    pet_species: Optional[str] = None
    pet_breed: Optional[str] = None

    class Config:
        from_attributes = True

class VaccinationRecordBase(BaseModel):
    pet_id: int
    user_id: Optional[int] = None
    vaccine_name: str
    date_given: Optional[datetime] = None
    next_due_date: Optional[datetime] = None
    veterinarian: Optional[str] = None
    batch_lot_no: str
    clinic: Optional[str] = None
    notes: Optional[str] = None
    
    @model_validator(mode='before')
    @classmethod
    def map_vaccination_date(cls, data):
        """Map vaccination_date from model to date_given in schema"""
        if isinstance(data, dict):
            if 'vaccination_date' in data and 'date_given' not in data:
                data['date_given'] = data.get('vaccination_date')
        elif hasattr(data, 'vaccination_date'):
            # Handle SQLAlchemy model instance
            if not hasattr(data, 'date_given') or getattr(data, 'date_given') is None:
                setattr(data, 'date_given', getattr(data, 'vaccination_date', None))
        return data

class VaccinationRecordCreate(VaccinationRecordBase):
    pass

class VaccinationRecordUpdate(BaseModel):
    vaccine_name: Optional[str] = None
    date_given: Optional[datetime] = None
    next_due_date: Optional[datetime] = None
    veterinarian: Optional[str] = None
    batch_lot_no: Optional[str] = None
    clinic: Optional[str] = None
    notes: Optional[str] = None

class VaccinationRecord(VaccinationRecordBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
        populate_by_name = True  # Allow both date_given and vaccination_date 

class VaccinationEventBase(BaseModel):
    event_date: date
    barangay: str
    service_coordinator: str
    status: str = "Scheduled"
    event_title: str

class VaccinationEventCreate(VaccinationEventBase):
    pass

class VaccinationEventUpdate(BaseModel):
    event_date: Optional[date] = None
    barangay: Optional[str] = None
    service_coordinator: Optional[str] = None
    status: Optional[str] = None
    event_title: Optional[str] = None

class VaccinationEvent(VaccinationEventBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class VaccinationDriveBase(BaseModel):
    event_id: int
    vaccine_used: str
    batch_no_lot_no: str

class VaccinationDriveCreate(VaccinationDriveBase):
    pass

class VaccinationDrive(VaccinationDriveBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class VaccinationDriveRecordBase(BaseModel):
    drive_id: int
    owner_name: str
    pet_name: str
    owner_contact: str
    species: str
    breed: Optional[str] = None
    color: Optional[str] = None
    age: Optional[str] = None
    sex: Optional[str] = None
    other_services: Optional[str] = None
    vaccine_used: str
    batch_no_lot_no: str
    vaccination_date: date

class VaccinationDriveRecordCreate(VaccinationDriveRecordBase):
    pass

class VaccinationDriveRecord(VaccinationDriveRecordBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MedicalRecordBase(BaseModel):
    reason_for_visit: str
    date_visited: date
    date_of_next_visit: Optional[date] = None
    procedures_done: Optional[str] = None
    findings: Optional[str] = None
    recommendations: Optional[str] = None
    medications: Optional[str] = None
    vaccine_used: Optional[str] = None
    veterinarian: Optional[str] = None

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    reason_for_visit: Optional[str] = None
    date_visited: Optional[date] = None
    date_of_next_visit: Optional[date] = None
    procedures_done: Optional[str] = None
    findings: Optional[str] = None
    recommendations: Optional[str] = None
    medications: Optional[str] = None
    vaccine_used: Optional[str] = None
    veterinarian: Optional[str] = None

class MedicalRecord(MedicalRecordBase):
    id: int
    pet_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    pet: Optional["Pet"] = None
    user: Optional["User"] = None

    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    pet_id: Optional[int] = None
    user_id: Optional[int] = None
    type: str  # service type
    date: date
    time: str  # Accept time as string (e.g., "01:00 PM" or "13:00")
    veterinarian: Optional[str] = "Dr. Templado"
    notes: Optional[str] = None
    status: Optional[str] = "scheduled"
    # Pet details
    pet_name: Optional[str] = None
    pet_species: Optional[str] = None
    pet_breed: Optional[str] = None
    pet_age: Optional[str] = None
    pet_gender: Optional[str] = None
    pet_weight: Optional[str] = None
    owner_name: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    pet_id: Optional[int] = None
    user_id: Optional[int] = None
    type: Optional[str] = None
    date: Optional[date] = None
    time: Optional[str] = None
    veterinarian: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    # Pet details
    pet_name: Optional[str] = None
    pet_species: Optional[str] = None
    pet_breed: Optional[str] = None
    pet_age: Optional[str] = None
    pet_gender: Optional[str] = None
    pet_weight: Optional[str] = None
    owner_name: Optional[str] = None

class Appointment(AppointmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    pet: Optional[Pet] = None
    user: Optional[User] = None
    client_name: Optional[str] = None

    class Config:
        from_attributes = True
        
    @classmethod
    def from_orm(cls, obj):
        # Convert time to string format
        if hasattr(obj, 'time') and obj.time:
            obj.time = obj.time.strftime("%H:%M")
        return super().from_orm(obj)

# Service Request Schemas
class ServiceRequestBase(BaseModel):
    client_name: str
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    requested_services: str
    request_details: Optional[str] = None
    preferred_date: Optional[date] = None
    preferred_time: Optional[str] = None
    status: Optional[str] = "Pending"
    notes: Optional[str] = None
    handled_by: Optional[str] = None

class ServiceRequestCreate(ServiceRequestBase):
    pass

class ServiceRequestUpdate(BaseModel):
    client_name: Optional[str] = None
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    requested_services: Optional[str] = None
    request_details: Optional[str] = None
    preferred_date: Optional[date] = None
    preferred_time: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    handled_by: Optional[str] = None

class ServiceRequest(ServiceRequestBase):
    id: int
    request_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 

class PainAssessmentBase(BaseModel):
    pet_id: int
    user_id: int
    pet_name: str
    pet_type: str
    pain_level: str
    pain_score: Optional[int] = None  # Add pain_score field (0-2)
    assessment_date: str
    recommendations: Optional[str] = None
    notes: Optional[str] = None  # Add notes field
    image_url: Optional[str] = None
    basic_answers: Optional[str] = None
    assessment_answers: Optional[str] = None
    questions_completed: Optional[bool] = None

class PainAssessmentCreate(PainAssessmentBase):
    pass

class PainAssessmentUpdate(BaseModel):
    pet_id: Optional[int] = None
    user_id: Optional[int] = None
    pet_name: Optional[str] = None
    pet_type: Optional[str] = None
    pain_level: Optional[str] = None
    pain_score: Optional[int] = None  # Add pain_score field
    assessment_date: Optional[str] = None
    recommendations: Optional[str] = None
    notes: Optional[str] = None  # Add notes field
    image_url: Optional[str] = None
    basic_answers: Optional[str] = None
    assessment_answers: Optional[str] = None
    questions_completed: Optional[bool] = None

class PainAssessment(PainAssessmentBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True 