from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime, date, time

class AdminBase(BaseModel):
    name: str
    email: EmailStr

class AdminCreate(AdminBase):
    password: str

class Admin(AdminBase):
    id: int
    created_at: datetime
    is_confirmed: int

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: EmailStr
    address: Optional[str] = None
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    phone_number: Optional[str] = None

class User(UserBase):
    id: int
    created_at: datetime
    is_confirmed: int

    class Config:
        from_attributes = True

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

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

class ReportCreate(ReportBase):
    pass

class ReportUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class Report(ReportBase):
    id: int
    report_id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AlertBase(BaseModel):
    title: str
    message: str
    priority: Optional[str] = "Medium"
    submitted_by: str
    submitted_by_email: EmailStr
    recipients: Optional[str] = None  # JSON string of recipient emails

class AlertCreate(AlertBase):
    recipients: Optional[str] = None  # JSON string of recipient emails

class AlertUpdate(BaseModel):
    title: Optional[str] = None
    message: Optional[str] = None
    priority: Optional[str] = None
    recipients: Optional[str] = None

class Alert(AlertBase):
    id: int
    alert_id: str
    recipients: Optional[str] = None  # JSON string of recipient emails
    created_at: datetime
    updated_at: Optional[datetime] = None

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
    created_at: datetime
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
    gender: Optional[str] = None  # male, female
    date: date

class AnimalControlRecordCreate(AnimalControlRecordBase):
    pass

class AnimalControlRecordUpdate(BaseModel):
    owner_name: Optional[str] = None
    contact_number: Optional[str] = None
    address: Optional[str] = None
    record_type: Optional[str] = None
    detail: Optional[str] = None
    species: Optional[str] = None
    gender: Optional[str] = None
    date: Optional[str] = None  # Changed from Optional[date] to Optional[str] to handle string dates

    class Config:
        from_attributes = True
        # Allow extra fields to be ignored
        extra = "ignore"

class AnimalControlRecord(AnimalControlRecordBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 

class MeatInspectionRecordBase(BaseModel):
    date_of_inspection: date
    time: str  # Format: "HH:MM"
    dealer_name: str
    kilos: float
    date_of_slaughter: date
    certificate_issued: bool = False
    status: str = "Pending"  # Pending, Approved, Rejected
    remarks: Optional[str] = None
    inspector_name: Optional[str] = None

class MeatInspectionRecordCreate(MeatInspectionRecordBase):
    pass

class MeatInspectionRecordUpdate(BaseModel):
    date_of_inspection: Optional[date] = None
    time: Optional[str] = None
    dealer_name: Optional[str] = None
    kilos: Optional[float] = None
    date_of_slaughter: Optional[date] = None
    certificate_issued: Optional[bool] = None
    status: Optional[str] = None
    remarks: Optional[str] = None
    inspector_name: Optional[str] = None

class MeatInspectionRecord(MeatInspectionRecordBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

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

class ShippingPermitRecord(ShippingPermitRecordBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 

class VaccinationRecordBase(BaseModel):
    pet_id: int
    date_of_vaccination: date
    vaccine_used: str
    batch_no_lot_no: str
    date_of_next_vaccination: Optional[date] = None
    veterinarian_lic_no_ptr: str

class VaccinationRecordCreate(VaccinationRecordBase):
    pass

class VaccinationRecordUpdate(BaseModel):
    date_of_vaccination: Optional[date] = None
    vaccine_used: Optional[str] = None
    batch_no_lot_no: Optional[str] = None
    date_of_next_vaccination: Optional[date] = None
    veterinarian_lic_no_ptr: Optional[str] = None

class VaccinationRecord(VaccinationRecordBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        orm_mode = True 

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
    date_of_visit: date
    next_visit: Optional[date] = None
    procedure_done: str
    findings: str
    recommendation: str
    vaccine_used_medication: str

class MedicalRecordCreate(MedicalRecordBase):
    pass

class MedicalRecordUpdate(BaseModel):
    reason_for_visit: Optional[str] = None
    date_of_visit: Optional[date] = None
    next_visit: Optional[date] = None
    procedure_done: Optional[str] = None
    findings: Optional[str] = None
    recommendation: Optional[str] = None
    vaccine_used_medication: Optional[str] = None

class MedicalRecord(MedicalRecordBase):
    id: int
    pet_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Appointment Schemas
class AppointmentBase(BaseModel):
    pet_id: Optional[int] = None
    user_id: Optional[int] = None
    type: str  # service type
    date: date
    time: time  # datetime.time object
    veterinarian: Optional[str] = "Dr. Ma Fe Templado"
    notes: Optional[str] = None
    status: Optional[str] = "Pending"

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    pet_id: Optional[int] = None
    user_id: Optional[int] = None
    type: Optional[str] = None
    date: Optional[date] = None
    time: Optional[time] = None
    veterinarian: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None

class Appointment(AppointmentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    pet: Optional[Pet] = None

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