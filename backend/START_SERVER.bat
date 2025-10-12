@echo off
echo ========================================
echo Starting Pawthos Unified Backend Server
echo ========================================
echo.
echo Server will be accessible at:
echo   - http://localhost:8000 (local)
echo   - http://192.168.1.13:8000 (network)
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

uvicorn main:app --host 0.0.0.0 --port 8000 --reload

pause

