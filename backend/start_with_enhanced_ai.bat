@echo off
echo Starting Pawthos Backend with Enhanced AI...
echo.

REM Set environment variables
set AI_API_KEY=AIzaSyB3XDsEqilYW6BefX4SzOWYgC_dKyputmk
set SECRET_KEY=sYIjB_9LQSAWKqs-70Dxhk2ASS3Rq1rf3L4wdMbpGRw
set REACT_APP_API_URL=pawthoswebsite-production.up.railway.app

echo Environment variables set:
echo - AI_API_KEY: %AI_API_KEY:~0,10%...
echo - SECRET_KEY: %SECRET_KEY:~0,10%...
echo.

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Test Enhanced AI availability
echo Testing Enhanced AI availability...
python test_enhanced_ai.py

echo.
echo Starting server with Enhanced AI support...
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload




