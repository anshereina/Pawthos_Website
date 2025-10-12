# Railway Deployment Guide for Pawthos Backend

## 🎉 Why Railway is Perfect for This Project

Railway is an **excellent choice** for your Pawthos backend because:

✅ **No Size Limits** - Your ML models (PyTorch, OpenCV) deploy without issues  
✅ **Persistent Storage** - File uploads work out of the box  
✅ **Included PostgreSQL** - Free PostgreSQL database included  
✅ **No Cold Starts** - Always warm, fast response times  
✅ **Simple Deployment** - Deploy with one command  
✅ **Free Tier** - $5 credit monthly on free plan  
✅ **Automatic HTTPS** - SSL certificates included  

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Install Railway CLI

**Windows (PowerShell):**
```powershell
iwr https://railway.app/install.ps1 -useb | iex
```

**Or using npm:**
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```
This will open your browser for authentication.

### Step 3: Navigate to Backend Directory
```bash
cd backend
```

### Step 4: Initialize Railway Project
```bash
railway init
```

Answer the prompts:
- **Project name**: `pawthos-backend` (or your preferred name)
- **Environment**: `production`

### Step 5: Add PostgreSQL Database
```bash
railway add --database postgresql
```

This creates a PostgreSQL database and sets the `DATABASE_URL` environment variable automatically!

### Step 6: Set Environment Variables
```bash
# Secret key for JWT
railway variables set SECRET_KEY="your-super-secret-key-min-32-characters-long"

# SMTP configuration
railway variables set SMTP_USER="your-smtp-email@example.com"
railway variables set SMTP_PASS="your-smtp-password"

# Environment flag
railway variables set ENVIRONMENT="production"
```

### Step 7: Deploy! 🚀
```bash
railway up
```

That's it! Your backend is now deployed. Railway will give you a URL like:
```
https://pawthos-backend-production.up.railway.app
```

---

## 📋 Detailed Deployment Steps

### Option 1: Deploy from CLI (Recommended)

#### 1. Prepare Your Project
```bash
cd C:\Users\DELL\OneDrive - Polytechnic University of the Philippines\Documents\Pawthos\backend
```

#### 2. Install Railway CLI
```powershell
# PowerShell (Run as Administrator)
iwr https://railway.app/install.ps1 -useb | iex

# Verify installation
railway --version
```

#### 3. Login
```bash
railway login
```

#### 4. Create New Project
```bash
railway init
```

#### 5. Add PostgreSQL Database
```bash
railway add --database postgresql
```

Railway automatically:
- Creates a PostgreSQL instance
- Sets `DATABASE_URL` environment variable
- Connects your app to the database

#### 6. Configure Environment Variables

```bash
# View current variables
railway variables

# Set required variables
railway variables set SECRET_KEY="generate-a-secure-32-char-min-secret-key"
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASS="your-app-password"
railway variables set ENVIRONMENT="production"
```

**Generate a secure SECRET_KEY:**
```python
# Run in Python
import secrets
print(secrets.token_urlsafe(32))
```

#### 7. Run Database Migrations
```bash
# Railway provides the DATABASE_URL, so just run migrations
railway run alembic upgrade head
```

#### 8. Deploy Your Application
```bash
railway up
```

Wait for deployment to complete. You'll see:
```
✓ Build successful
✓ Deployment live at https://your-app.up.railway.app
```

#### 9. Generate Public Domain
```bash
railway domain
```

This creates a public URL for your API.

---

### Option 2: Deploy from GitHub (Alternative)

#### 1. Push Code to GitHub
```bash
git add .
git commit -m "Add Railway deployment configuration"
git push origin main
```

#### 2. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your `Pawthos` repository
5. Select the `backend` folder as root directory

#### 3. Add PostgreSQL
1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway automatically connects it to your app

#### 4. Configure Settings
1. Click on your service
2. Go to "Settings"
3. Set **Root Directory**: `backend`
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### 5. Add Environment Variables
1. Go to "Variables" tab
2. Add:
   - `SECRET_KEY` → Your secure key
   - `SMTP_USER` → Your SMTP email
   - `SMTP_PASS` → Your SMTP password
   - `ENVIRONMENT` → `production`

#### 6. Deploy
Click "Deploy" - Railway will automatically build and deploy your app.

---

## 🔧 Configuration Files Explained

### `railway.json`
Configures build and deployment settings for Railway.

### `Procfile`
Tells Railway how to start your application.

### `nixpacks.toml`
Specifies system dependencies and build phases.

### `runtime.txt`
Specifies Python version (3.10.12).

---

## 🗄️ Database Setup

### Automatic Setup (Recommended)
Railway automatically provides `DATABASE_URL` when you add PostgreSQL:
```bash
railway add --database postgresql
```

### Manual Connection String
If you need to check your database URL:
```bash
railway variables get DATABASE_URL
```

### Running Migrations
```bash
# Run migrations using Railway's DATABASE_URL
railway run alembic upgrade head

# Or connect to railway environment first
railway shell
alembic upgrade head
exit
```

### Access Database Directly
```bash
# Open PostgreSQL shell
railway run psql $DATABASE_URL

# Or use Railway's built-in database viewer
railway open
# Then click on PostgreSQL service
```

---

## 📦 File Uploads & Storage

Railway provides **persistent volumes** for file storage!

### Enable Persistent Volume (If Needed)
```bash
railway volume create uploads
railway volume mount uploads /app/uploads
```

Your current `uploads/` directory will work perfectly on Railway! 🎉

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain
1. Go to Railway Dashboard
2. Click your service → Settings → Networking
3. Click "Generate Domain" for Railway subdomain
4. Or add your custom domain:
   - Click "Custom Domain"
   - Enter your domain (e.g., `api.pawthos.com`)
   - Update your DNS records as instructed

---

## 📊 Monitoring & Logs

### View Live Logs
```bash
railway logs
```

### Open Railway Dashboard
```bash
railway open
```

### Check Deployment Status
```bash
railway status
```

### View Metrics
Go to Railway Dashboard → Your Service → Metrics to see:
- CPU usage
- Memory usage
- Request volume
- Response times

---

## 🔒 Environment Variables Reference

Required variables:

```bash
# Database (automatically set by Railway when you add PostgreSQL)
DATABASE_URL=postgresql://user:pass@host:5432/railway

# JWT Configuration
SECRET_KEY=your-super-secret-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email Configuration
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-specific-password

# Environment
ENVIRONMENT=production
```

---

## 🧪 Testing Your Deployment

### 1. Test Health Endpoint
```bash
curl https://your-app.up.railway.app/health
```

Expected response:
```json
{"status": "healthy"}
```

### 2. Test Root Endpoint
```bash
curl https://your-app.up.railway.app/
```

Expected response:
```json
{"message": "Welcome to Pawthos API"}
```

### 3. Test Authentication
```bash
curl -X POST https://your-app.up.railway.app/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "testpass123",
    "full_name": "Test User"
  }'
```

### 4. Test AI Prediction (if endpoints are public)
```bash
curl -X POST https://your-app.up.railway.app/api/predict \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test_image.jpg"
```

---

## 🐛 Troubleshooting

### Issue: Build Fails
**Solution:**
```bash
# Check logs
railway logs

# Ensure requirements.txt is correct
railway run pip install -r requirements.txt

# Rebuild
railway up --detach
```

### Issue: App Crashes on Startup
**Solution:**
```bash
# Check logs for errors
railway logs

# Common causes:
# - Missing environment variables
# - Database connection issues
# - Import errors

# Test locally with Railway env
railway run python main.py
```

### Issue: Database Connection Error
**Solution:**
```bash
# Verify DATABASE_URL is set
railway variables get DATABASE_URL

# Check PostgreSQL is running
railway open  # Check PostgreSQL service status

# Run migrations
railway run alembic upgrade head
```

### Issue: CORS Errors
**Solution:**
Update `main.py` CORS configuration to include your Railway URL:
```python
allow_origins=[
    "https://your-frontend.vercel.app",
    "https://your-app.up.railway.app",
    "http://localhost:3000",
    "*"  # Remove in production
]
```

### Issue: File Upload Fails
**Solution:**
```bash
# Create uploads directory
railway run mkdir -p uploads

# Or enable persistent volume (see above)
```

---

## 💰 Pricing & Free Tier

### Free Plan (Starter)
- **$5 in credit per month** (resets monthly)
- Usage-based billing
- Includes PostgreSQL database
- Perfect for development and small projects

### Typical Usage for Your App
- **Small traffic**: ~$3-5/month (within free tier)
- **Medium traffic**: ~$10-20/month
- **High traffic**: $30+/month

### Monitor Usage
```bash
railway open
# Go to project settings → Usage
```

---

## 📱 Update Your Frontend & Mobile App

After deployment, update your API URLs:

### Web Frontend (React)
Update your API base URL to:
```
https://pawthos-backend-production.up.railway.app
```

### Mobile App (React Native)
Update API endpoint in your config:
```typescript
const API_URL = 'https://pawthos-backend-production.up.railway.app';
```

---

## 🔄 Continuous Deployment

### Automatic Deploys from GitHub
1. Connect your GitHub repository in Railway Dashboard
2. Select branch (e.g., `main`)
3. Every push to `main` automatically deploys

### Manual Deploys
```bash
railway up
```

### Rollback to Previous Deployment
1. Go to Railway Dashboard
2. Click your service → Deployments
3. Click "Rollback" on any previous deployment

---

## 🎯 Next Steps After Deployment

- [ ] Test all API endpoints
- [ ] Run database migrations
- [ ] Update frontend API URL
- [ ] Update mobile app API URL  
- [ ] Test authentication flow
- [ ] Test file uploads
- [ ] Test AI predictions
- [ ] Set up custom domain (optional)
- [ ] Configure monitoring/alerts
- [ ] Share API URL with team

---

## 📚 Useful Commands Reference

```bash
# Login
railway login

# Initialize project
railway init

# Add PostgreSQL
railway add --database postgresql

# Set environment variable
railway variables set KEY=value

# Get environment variable
railway variables get KEY

# List all variables
railway variables

# Deploy
railway up

# View logs
railway logs

# Run command in Railway environment
railway run <command>

# Open Railway dashboard
railway open

# Check status
railway status

# Generate domain
railway domain

# Shell into Railway environment
railway shell
```

---

## 🆘 Getting Help

- **Railway Docs**: https://docs.railway.app/
- **Railway Discord**: https://discord.gg/railway
- **FastAPI Docs**: https://fastapi.tiangolo.com/
- **Railway Status**: https://status.railway.app/

---

## ✅ Quick Deployment Checklist

1. ☐ Install Railway CLI
2. ☐ Login to Railway (`railway login`)
3. ☐ Navigate to backend directory
4. ☐ Initialize project (`railway init`)
5. ☐ Add PostgreSQL (`railway add --database postgresql`)
6. ☐ Set environment variables
7. ☐ Run migrations (`railway run alembic upgrade head`)
8. ☐ Deploy (`railway up`)
9. ☐ Generate domain (`railway domain`)
10. ☐ Test endpoints
11. ☐ Update frontend/mobile app URLs
12. ☐ Celebrate! 🎉

---

**Your backend with ML models, file uploads, and PostgreSQL will work perfectly on Railway!** 🚀

