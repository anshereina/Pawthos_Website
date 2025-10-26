@echo off
set DATABASE_URL=postgresql://postgres:pawthos@localhost/cityvet_db
set SECRET_KEY=pawthos_secret_key_change_in_production
set ENVIRONMENT=development
set AI_API_KEY=AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk
set SMTP_USER=sanpedrocityvetpawthos@gmail.com
set SMTP_PASS=pawthos_cityvet

echo Starting server with SMTP configuration...
echo SMTP_USER: %SMTP_USER%
echo SMTP_PASS: ********

call venv\Scripts\activate.bat
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

