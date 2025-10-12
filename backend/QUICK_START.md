# Quick Start Guide - Unified Backend

## Starting the Server

### Method 1: Using the Batch File (Easiest)
1. Navigate to the backend directory
2. Double-click `START_SERVER.bat`
3. The server will start and be accessible at:
   - `http://localhost:8000` (for local access)
   - `http://192.168.1.13:8000` (for network access from mobile device)

### Method 2: Using Command Line
```bash
cd "C:\Users\DELL\OneDrive - Polytechnic University of the Philippines\Documents\Pawthos\backend"
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Method 3: Using Python Script
```bash
cd "C:\Users\DELL\OneDrive - Polytechnic University of the Philippines\Documents\Pawthos\backend"
python start_server.py
```

## Testing the Server

Once the server is running, you can test it:

### From Command Line:
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/health" -Method GET
Invoke-WebRequest -Uri "http://192.168.1.13:8000/health" -Method GET
```

### From Browser:
- Open http://localhost:8000/docs (Swagger API documentation)
- Open http://192.168.1.13:8000/docs (from any device on the same network)

## Mobile App Configuration

Your mobile app is already configured to connect to the unified backend at:
- **Development**: `http://192.168.1.13:8000/api`
- **Localhost**: `http://localhost:8000/api`

The app automatically detects the platform and uses the appropriate URL.

## Troubleshooting

### Problem: Network request failed error on mobile

**Solutions:**
1. **Check if server is running on all interfaces (0.0.0.0)**
   ```bash
   netstat -an | findstr :8000
   ```
   You should see: `TCP    0.0.0.0:8000` or `[::]:8000`

2. **Check firewall settings**
   - Windows Defender Firewall might be blocking port 8000
   - Add an inbound rule to allow port 8000

3. **Verify both devices are on the same network**
   - Your computer and mobile device must be connected to the same Wi-Fi network
   - Check your computer's IP address: `ipconfig`

4. **Test connection from mobile device browser**
   - Open mobile browser and go to: `http://192.168.1.13:8000/health`
   - If this works, the problem is with the app configuration
   - If this doesn't work, the problem is with network/firewall

### Problem: Port 8000 already in use

**Solution:**
Kill all Python processes and restart:
```powershell
taskkill /IM python.exe /F
taskkill /IM python3.11.exe /F
```

Then start the server again.

### Problem: Import errors

**Solution:**
Install/update dependencies:
```bash
pip install -r requirements.txt
```

## API Endpoints

### Health Check
- `GET /health` - Main health check
- `GET /api/health` - AI service health check

### Authentication (Mobile)
- `POST /auth/api/register` - User registration
- `POST /auth/api/login` - User login  
- `POST /auth/api/verify-otp` - OTP verification
- `GET /auth/api/me` - Get current user

### AI Predictions
- `POST /api/predict` - Basic pain prediction
- `POST /api/predict-eld` - Advanced ELD prediction

## Notes

- The server uses **hot reload** mode, so code changes will automatically restart the server
- Make sure you have a `.env` file with proper configuration (see `env.example`)
- The ELD model requires scikit-learn - there might be version warnings but they're not critical
- Both web and mobile frontends use the same unified backend

## Next Steps

1. Start the backend server using one of the methods above
2. Start your mobile app: `npm start` or `npx expo start`
3. Test the connection from your mobile device
4. If you encounter "Network request failed", follow the troubleshooting steps above
