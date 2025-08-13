# Pawthos Backend API

A FastAPI backend for the Pawthos pet management system with user authentication.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Configuration:**
   - Copy `env.example` to `.env`
   - Update the following variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `SECRET_KEY`: A secure random string for JWT tokens
     - `SMTP_USER`: Your Gmail address (for sending OTP)
     - `SMTP_PASS`: Your Gmail App Password (not your Gmail login password)

3. **Database Setup:**
   - Ensure your PostgreSQL database is running
   - Run database migrations to add new columns:
     ```bash
     alembic upgrade head
     ```

4. **Run the application:**
   ```bash
   uvicorn main:app --reload
   ```

## API Endpoints

### Authentication

- **POST** `/auth/register` - Register a new user (sends OTP to email)
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "user",
    "address": "123 Main St",
    "phone_number": "+1234567890"
  }
  ```

- **POST** `/auth/confirm-otp` - Confirm email with OTP
  ```json
  {
    "email": "john@example.com",
    "otp_code": "123456"
  }
  ```

- **POST** `/auth/login` - Login user (only after confirming email)
  ```json
  {
    "username": "john@example.com",
    "password": "securepassword"
  }
  ```

- **GET** `/auth/me` - Get current user info (requires authentication)

### Other Endpoints

- **GET** `/` - Welcome message
- **GET** `/health` - Health check

## Authentication Flow

1. User registers with email and password
2. Password is hashed using bcrypt
3. OTP is generated and sent to user's email
4. User confirms OTP via `/auth/confirm-otp`
5. User logs in with email/password (only after confirmation)
6. JWT token is returned for authentication
7. Include token in Authorization header: `Bearer <token>`

## Database Schema

The `users` table includes:
- `