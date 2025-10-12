# Pawthos Unified Backend

This is the consolidated backend that serves both the web application and mobile application. It combines the functionality from both the original web backend and mobile backend into a single, unified FastAPI application.

## Features

### Core Functionality
- **User Management**: Registration, authentication, profile management
- **Pet Management**: Pet registration, profiles, medical records
- **Appointment System**: Scheduling and management
- **Vaccination Records**: Tracking and management
- **Medical Records**: Health history tracking
- **Pain Assessment**: AI-powered pain assessment for cats using ELD (Ensemble Landmark Detector)

### AI/ML Features
- **Cat Pain Assessment**: Advanced pain detection using 48 landmark facial analysis
- **Fallback Detection**: Haar cascade-based detection when ML models are unavailable
- **Image Processing**: Support for various image formats with EXIF orientation correction

## Architecture

### Modular Structure
```
backend/
├── core/                    # Core functionality
│   ├── auth.py             # Authentication utilities
│   ├── config.py           # Configuration
│   ├── database.py         # Database connection
│   ├── models.py           # SQLAlchemy models
│   └── schemas.py          # Pydantic schemas
├── routers/                # API route handlers
│   ├── auth.py             # Authentication endpoints
│   ├── users.py            # User management
│   ├── pets.py             # Pet management
│   ├── appointments.py     # Appointment system
│   ├── medical_records.py  # Medical records
│   ├── vaccination_records.py # Vaccination tracking
│   ├── pain_assessments.py # Pain assessment
│   └── ai_predictions.py   # AI/ML endpoints
├── services/               # Business logic services
│   └── ai_service.py       # AI/ML service
├── eld/                    # ELD model files
└── models/                 # ML model files
```

## API Endpoints

### Authentication
- `POST /auth/api/register` - User registration
- `POST /auth/api/login` - User login
- `POST /auth/api/verify-otp` - OTP verification
- `GET /auth/api/me` - Get current user

### User Management
- `PUT /users/api/update-profile` - Update user profile
- `GET /users/api/dashboard` - Get user dashboard

### Pet Management
- `GET /pets/` - Get user's pets
- `POST /pets/` - Create new pet
- `GET /pets/{pet_id}` - Get pet details
- `PUT /pets/{pet_id}` - Update pet
- `DELETE /pets/{pet_id}` - Delete pet

### AI/ML Endpoints
- `POST /api/predict` - Basic pain prediction
- `POST /api/predict-eld` - Advanced ELD-based prediction
- `GET /api/health` - AI service health check

### Medical & Vaccination
- `GET /medical-records/` - Get medical records
- `POST /medical-records/` - Create medical record
- `GET /vaccination-records/` - Get vaccination records
- `POST /vaccination-records/` - Create vaccination record

## Setup Instructions

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Environment Configuration
Create a `.env` file with the following variables:
```env
DATABASE_URL=postgresql://username:password@localhost/database_name
SECRET_KEY=your_secret_key_here
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Database Setup
```bash
# Run migrations
python migrate_schema.py

# Create database tables
python -c "from core.database import engine; from core import models; models.Base.metadata.create_all(bind=engine)"
```

### 4. Start the Server
```bash
python main.py
```

The server will start on `http://localhost:8000`

## Database Schema

The unified backend supports both web and mobile frontend schemas with backward compatibility. Key tables include:

- `users` - User accounts with mobile-specific fields
- `pets` - Pet information with flexible schema
- `appointments` - Appointment scheduling
- `pain_assessments` - AI pain assessment results
- `medical_records` - Medical history
- `vaccination_records` - Vaccination tracking

## AI/ML Models

### ELD Model
- **File**: `eld/eld_model.py`
- **Purpose**: Cat pain assessment using 48 facial landmarks
- **Requirements**: OpenCV, NumPy, scikit-learn

### Haar Cascades
- **File**: `models/haarcascade_frontalcatface_extended.xml`
- **Purpose**: Cat face detection for preprocessing

### EfficientNet Model
- **File**: `models/best_efficientnet_model.pth`
- **Purpose**: Advanced pain classification

## CORS Configuration

The backend is configured to accept requests from:
- Web frontend: `http://localhost:3000`
- Mobile app: `http://192.168.1.13:3000`
- Development: All origins (`*`)

## Migration from Separate Backends

### From Mobile Backend
1. Update mobile app config to point to unified backend
2. Run schema migration script
3. Test all mobile app functionality

### From Web Backend
1. Existing web backend endpoints remain unchanged
2. New mobile endpoints added with `/api` prefix
3. Database models updated for compatibility

## Development

### Adding New Endpoints
1. Create route handler in appropriate router file
2. Add Pydantic schemas if needed
3. Update this README with endpoint documentation

### AI Model Updates
1. Update model files in `models/` or `eld/` directories
2. Modify `services/ai_service.py` as needed
3. Test with both basic and ELD endpoints

## Troubleshooting

### Common Issues
1. **Database Connection**: Check DATABASE_URL in .env
2. **AI Models**: Ensure model files are in correct locations
3. **CORS**: Verify origin URLs in main.py
4. **Dependencies**: Install all requirements from requirements.txt

### Logs
Check application logs for detailed error information. The backend uses Python logging with INFO level by default.

## Production Deployment

1. Set `REACT_APP_API_BASE_URL` environment variable
2. Configure proper CORS origins
3. Use production database
4. Set secure SECRET_KEY
5. Configure SMTP for email functionality
