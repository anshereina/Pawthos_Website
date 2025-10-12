# Pawthos System – Overview and Setup Guide

This repository contains the Pawthos system: a FastAPI backend with a React (TypeScript + Tailwind) frontend for pet, medical, vaccination, appointments, reports/alerts, and administrative record management.

## Project Structure

```
Pawthos/
  backend/                # FastAPI app, SQLAlchemy models, Alembic migrations
    core/                 # auth, config, database, models, schemas
    routers/              # feature routers (auth, users, pets, medical, etc.)
    alembic/              # migrations and config
    main.py               # FastAPI app entrypoint (run with uvicorn)
  frontend/               # React app (CRA + TypeScript + Tailwind)
    public/               # static assets, redirects (SPA routing)
    src/                  # UI, hooks, services, router
  documentation/          # this guide and feature docs
```

## GitHub Repository Location

- The `Pawthos` folder is the repository root on GitHub. Access it at: `https://github.com/<your-username-or-org>/Pawthos` (replace with your actual GitHub path).

## Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- PostgreSQL 13+

## Setup

1. **Install backend dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Environment Configuration:**
   - Copy `env.example` to `.env` (in `backend/`)
   - Update the following variables:
     - `DATABASE_URL`: Your PostgreSQL connection string
     - `SECRET_KEY`: A secure random string for JWT tokens
     - `SMTP_USER`: Your Gmail address (for sending OTP)
     - `SMTP_PASS`: Your Gmail App Password (not your Gmail login password)

3. **Database Setup:**
   - Ensure PostgreSQL is running and accessible
   - Apply migrations (from `backend/`):
     ```bash
     alembic upgrade head
     ```

4. **Run the backend (dev):**
   ```bash
   uvicorn main:app --reload --port 8000
   ```

5. **Run the frontend (dev):**
   ```bash
   cd ../frontend
   npm install
   npm start
   ```

Backend: `http://localhost:8000`
Frontend: `http://localhost:3000`

## Authentication and Roles

- Registration sends OTP via email; account must be confirmed before login
- Passwords are hashed with bcrypt (passlib)
- JWT issued on login; include header: `Authorization: Bearer <token>`
- Supports Users and Admins

## Backend Modules (key)

- `core/models.py` – SQLAlchemy models
- `core/schemas.py` – Pydantic schemas
- `core/database.py` – engine/session
- `core/auth.py` – hashing and helpers
- `routers/*` – feature endpoints (auth, users, pets, medical, vaccination, appointments, reports/alerts, animal control, shipping permits, meat inspection)

## Database Migrations (Alembic)

From `backend/`:
```bash
alembic revision -m "<message>"   # generate new migration after model changes
alembic upgrade head               # apply
alembic downgrade -1               # rollback last
```

## Frontend Build and SPA Routing

```bash
cd frontend
npm run build
```

Serve `frontend/build/` with a static host and enable SPA fallback to `index.html` for unknown routes. See `documentation/frontend-README.md` for examples (Netlify, Vercel, Nginx, Apache).

## Development Notes

- Do not commit local artifacts: `backend/venv/`, `frontend/build/`
- CORS allows `http://localhost:3000` by default
- Keep Alembic migrations consistent with `core/models.py`

## Quickstart (copy/paste)

```bash
# Backend
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload --port 8000

# Frontend
cd ../frontend
npm install
npm start
```
