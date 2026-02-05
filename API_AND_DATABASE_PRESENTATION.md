# API Architecture & Database Design - Panel Presentation Guide

## Overview
This document outlines the key API endpoints and database structure for the Feline Pain Assessment System that should be discussed with the panel.

---

## 1. API Architecture

### 1.1 RESTful API Design
- **Framework**: FastAPI (Python)
- **Architecture**: RESTful API with JSON responses
- **Authentication**: JWT Token-based authentication
- **Base URL**: `/api` for mobile endpoints

### 1.2 Core Pain Assessment API Endpoints

#### **POST `/api/predict-eld`** - ELD Model Prediction
- **Purpose**: Main endpoint for feline pain assessment using ELD (Ensemble Landmark Detector) model
- **Method**: POST
- **Authentication**: Required (Bearer Token)
- **Request**: 
  - `file`: Image file (multipart/form-data)
- **Response**:
  ```json
  {
    "success": true,
    "pain_level": "Level 0 (No Pain)" | "Level 1 (Mild Pain)" | "Level 2 (Moderate/Severe Pain)",
    "pain_score": 0-10,
    "confidence": 0.0-1.0,
    "landmarks_detected": 48,
    "expected_landmarks": 48,
    "fgs_breakdown": {
      "ear_position": {"score": 0-2, "description": "..."},
      "orbital_tightening": {"score": 0-2, "description": "..."},
      "muzzle_tension": {"score": 0-2, "description": "..."},
      "whiskers_change": {"score": 0-2, "description": "..."},
      "head_position": {"score": 0-2, "description": "..."}
    },
    "detailed_explanation": {...},
    "actionable_advice": {...},
    "visual_landmarks": {...},
    "model_type": "ELD (48 Landmarks)"
  }
  ```

#### **POST `/api/pain-assessments`** - Create Assessment (JSON)
- **Purpose**: Save pain assessment data to database
- **Method**: POST
- **Authentication**: Required
- **Request Body**: JSON with assessment data
- **Response**: Created assessment record

#### **POST `/api/pain-assessments/with-image/`** - Create Assessment with Image
- **Purpose**: Save pain assessment with uploaded image
- **Method**: POST
- **Authentication**: Required
- **Request**: Multipart form data with image file
- **Response**: Created assessment record with image URL

#### **GET `/api/pain-assessments`** - Get All Assessments
- **Purpose**: Retrieve all pain assessments for the authenticated user
- **Method**: GET
- **Authentication**: Required
- **Query Parameters**: 
  - `skip`: Pagination offset (default: 0)
  - `limit`: Results per page (default: 100)
- **Response**: List of assessment records

#### **GET `/api/pain-assessments/{assessment_id}`** - Get Specific Assessment
- **Purpose**: Retrieve a specific pain assessment by ID
- **Method**: GET
- **Authentication**: Required
- **Response**: Single assessment record

#### **PUT `/api/pain-assessments/{assessment_id}`** - Update Assessment
- **Purpose**: Update an existing pain assessment
- **Method**: PUT
- **Authentication**: Required
- **Response**: Updated assessment record

#### **DELETE `/api/pain-assessments/{assessment_id}`** - Delete Assessment
- **Purpose**: Delete a pain assessment
- **Method**: DELETE
- **Authentication**: Required
- **Response**: 204 No Content

### 1.3 Other Supporting APIs

#### **GET `/api/health`** - Health Check
- **Purpose**: Check API service status and ELD model availability
- **Method**: GET
- **Response**: Service health status

#### **POST `/api/predict`** - Basic Prediction (Legacy)
- **Purpose**: Basic pain prediction endpoint (redirects to ELD)
- **Method**: POST
- **Authentication**: Required

---

## 2. Database Schema

### 2.1 Pain Assessment Table (`pain_assessments`)

**Purpose**: Stores all feline pain assessment records

| Column Name | Data Type | Constraints | Description |
|------------|-----------|-------------|-------------|
| `id` | Integer | Primary Key, Index | Unique assessment identifier |
| `pet_id` | Integer | Not Null | Reference to pet (no foreign key constraint) |
| `user_id` | Integer | Not Null | Reference to user who created assessment |
| `pet_name` | String(255) | Nullable | Pet's name |
| `pet_type` | String(255) | Nullable | Type of pet (e.g., "cat", "feline") |
| `pain_level` | String(255) | Nullable | Pain level: "Level 0 (No Pain)", "Level 1 (Mild Pain)", "Level 2 (Moderate/Severe Pain)" |
| `pain_score` | Integer | Not Null | Pain score (0-10 scale) |
| `assessment_date` | DateTime | Default: now() | Date and time of assessment |
| `recommendations` | Text | Nullable | Veterinary recommendations |
| `notes` | Text | Nullable | Additional notes about the assessment |
| `image_url` | String(255) | Nullable | URL path to uploaded cat image |
| `created_at` | DateTime | Default: now() | Record creation timestamp |
| `basic_answers` | Text | Nullable | JSON string of basic assessment answers |
| `assessment_answers` | Text | Nullable | JSON string of detailed assessment answers |
| `questions_completed` | Boolean | Nullable | Whether assessment questions were completed |

**Key Features**:
- Stores complete assessment data including FGS breakdown
- Links to user and pet (flexible foreign key design)
- Supports image storage via URL reference
- JSON fields for flexible answer storage

### 2.2 Related Tables

#### **Users Table (`users`)**
- Stores user account information
- Links to pain assessments via `user_id`
- Fields: id, name, email, password_hash, phone_number, address, etc.

#### **Pets Table (`pets`)**
- Stores pet information
- Links to pain assessments via `pet_id`
- Fields: id, pet_id, name, species, breed, date_of_birth, user_id, etc.

---

## 3. Data Flow Architecture

### 3.1 Pain Assessment Workflow

```
1. User uploads cat image
   ↓
2. Frontend sends POST /api/predict-eld
   ↓
3. Backend processes image with ELD model
   ↓
4. ELD model returns assessment results
   ↓
5. User reviews results
   ↓
6. Frontend sends POST /api/pain-assessments/with-image/
   ↓
7. Backend saves assessment + image to database
   ↓
8. Response with saved assessment record
```

### 3.2 ELD Model Processing Flow

```
Image Upload
  ↓
Face Detection (Haar Cascade)
  ↓
Region Detection (5 regions)
  ↓
Multi-Scale Magnification (1.0x, 1.5x, 2.0x)
  ↓
48 Landmark Detection (Specialist CNNs)
  ↓
Feature Extraction (70-dimensional vector)
  ↓
Pain Classification (Random Forest)
  ↓
Result Formatting (matching Gemini format)
  ↓
API Response
```

---

## 4. Key Technical Points to Discuss

### 4.1 API Design Principles
- **RESTful Architecture**: Standard HTTP methods (GET, POST, PUT, DELETE)
- **Stateless**: Each request contains all necessary information
- **Resource-Based URLs**: Clear, intuitive endpoint naming
- **JSON Responses**: Consistent data format
- **Error Handling**: Proper HTTP status codes (400, 401, 403, 404, 500)

### 4.2 Security Features
- **JWT Authentication**: Secure token-based authentication
- **User Authorization**: Users can only access their own assessments
- **File Validation**: Image type and size validation
- **Input Sanitization**: Protection against malicious inputs

### 4.3 Database Design Principles
- **Normalization**: Proper table structure
- **Flexibility**: JSON fields for extensible data storage
- **Performance**: Indexed primary keys and foreign keys
- **Data Integrity**: Constraints ensure data consistency

### 4.4 Scalability Considerations
- **Pagination**: GET endpoints support skip/limit for large datasets
- **File Storage**: Images stored separately, referenced by URL
- **Modular Design**: Separate routers for different features
- **API Versioning**: Clear endpoint organization

---

## 5. Sample API Request/Response

### Request Example
```http
POST /api/predict-eld HTTP/1.1
Host: your-api-domain.com
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: [binary image data]
```

### Response Example
```json
{
  "success": true,
  "pain_level": "Level 1 (Mild Pain)",
  "pain_score": 4,
  "confidence": 0.85,
  "landmarks_detected": 48,
  "expected_landmarks": 48,
  "fgs_breakdown": {
    "ear_position": {
      "score": 1,
      "description": "Ears showing slight rotation"
    },
    "orbital_tightening": {
      "score": 1,
      "description": "Eyes partially closed"
    },
    "muzzle_tension": {
      "score": 0,
      "description": "Muzzle relaxed"
    },
    "whiskers_change": {
      "score": 1,
      "description": "Whiskers slightly straight"
    },
    "head_position": {
      "score": 0,
      "description": "Head position normal"
    }
  },
  "detailed_explanation": {
    "eyes": "The cat's eyes show mild to moderate discomfort based on orbital tightening analysis.",
    "ears": "Ear position indicates mild to moderate discomfort.",
    "muzzle_mouth": "Muzzle appears relaxed with normal tension.",
    "whiskers": "Whisker position suggests mild to moderate discomfort.",
    "overall_expression": "Overall facial expression indicates mild to moderate discomfort."
  },
  "actionable_advice": {
    "immediate_actions": [
      "Monitor closely for worsening signs",
      "Ensure cat has comfortable resting area",
      "Limit physical activity"
    ],
    "monitoring_guidelines": "Monitor every few hours for changes. Watch for decreased appetite or increased discomfort.",
    "when_to_contact_vet": "Contact veterinarian within 24 hours if symptoms persist or worsen.",
    "home_care_tips": [
      "Provide soft, comfortable bedding",
      "Ensure easy access to food and water",
      "Minimize stress and handling"
    ]
  },
  "visual_landmarks": {
    "left_eye_landmarks": [...],
    "right_eye_landmarks": [...],
    "left_ear_landmarks": [...],
    "right_ear_landmarks": [...],
    "nose_whisker_landmarks": [...]
  },
  "model_type": "ELD (48 Landmarks)"
}
```

---

## 6. Discussion Points for Panel

### 6.1 Why This API Design?
- **RESTful principles** ensure standard, predictable endpoints
- **Separation of concerns**: Prediction endpoint separate from storage endpoint
- **Flexibility**: Can add new features without breaking existing functionality
- **Mobile-friendly**: Optimized for mobile app consumption

### 6.2 Why This Database Structure?
- **Flexible schema**: JSON fields allow storing complex assessment data
- **Scalable**: Can handle large volumes of assessments
- **User-centric**: Links assessments to users for privacy
- **Audit trail**: Timestamps track when assessments were created

### 6.3 Security & Privacy
- **Authentication required** for all assessment operations
- **User isolation**: Users can only see their own assessments
- **Image storage**: Secure file upload and storage
- **Data validation**: Input validation prevents errors and attacks

### 6.4 Performance Considerations
- **Efficient queries**: Indexed columns for fast lookups
- **Pagination**: Prevents loading too much data at once
- **Image optimization**: Separate storage reduces database size
- **Caching potential**: API responses can be cached for better performance

---

## 7. API Endpoint Summary Table

| Endpoint | Method | Purpose | Auth Required |
|----------|--------|---------|---------------|
| `/api/predict-eld` | POST | ELD model pain assessment | Yes |
| `/api/pain-assessments` | POST | Create assessment (JSON) | Yes |
| `/api/pain-assessments/with-image/` | POST | Create assessment with image | Yes |
| `/api/pain-assessments` | GET | Get all assessments | Yes |
| `/api/pain-assessments/{id}` | GET | Get specific assessment | Yes |
| `/api/pain-assessments/{id}` | PUT | Update assessment | Yes |
| `/api/pain-assessments/{id}` | DELETE | Delete assessment | Yes |
| `/api/health` | GET | Health check | No |

---

## 8. Database Relationships

```
users (1) ────< (many) pain_assessments
                    │
                    └───> pet_id (references pets, but no FK constraint)
```

**Note**: The system uses flexible foreign key design where `pet_id` and `user_id` are stored as integers without strict foreign key constraints, allowing for more flexible data management.

---

## 9. Conclusion

The API and database design support:
- ✅ Secure, authenticated access
- ✅ Scalable architecture
- ✅ Flexible data storage
- ✅ Complete assessment history
- ✅ User privacy and data isolation
- ✅ Integration with ELD model
- ✅ Mobile app compatibility

This architecture provides a solid foundation for the feline pain assessment system while maintaining security, scalability, and user experience.


