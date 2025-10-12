# 🚀 Quick Deploy to Railway - 5 Minutes

## Prerequisites
- Git installed
- GitHub account
- Railway account (sign up at https://railway.app)

---

## Method 1: One-Command Deploy (Fastest) ⚡

### Step 1: Install Railway CLI
**Windows PowerShell (Run as Administrator):**
```powershell
iwr https://railway.app/install.ps1 -useb | iex
```

**Or using npm:**
```bash
npm install -g @railway/cli
```

### Step 2: Deploy Everything
```bash
# Navigate to backend
cd backend

# Login to Railway
railway login

# Initialize and deploy
railway init
railway add --database postgresql

# Set environment variables
railway variables set SECRET_KEY="your-32-char-secret-key-here"
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASS="your-smtp-password"
railway variables set ENVIRONMENT="production"

# Run migrations
railway run alembic upgrade head

# Deploy!
railway up

# Get your URL
railway domain
```

**Done!** 🎉 Your API is now live at `https://your-app.up.railway.app`

---

## Method 2: GitHub Integration (No CLI Needed) 🐙

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### Step 2: Deploy on Railway Website
1. Go to https://railway.app
2. Click "New Project"
3. Choose "Deploy from GitHub repo"
4. Select your repository
5. Click "Deploy Now"

### Step 3: Add PostgreSQL
1. Click "New" → "Database" → "Add PostgreSQL"
2. Wait for it to provision (30 seconds)

### Step 4: Configure Service
1. Click on your web service
2. Go to "Settings"
3. Set **Root Directory**: `backend` (if monorepo)
4. Set **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 5: Add Environment Variables
1. Click "Variables" tab
2. Add these variables:
   - `SECRET_KEY`: Generate with `python -c "import secrets; print(secrets.token_urlsafe(32))"`
   - `SMTP_USER`: Your email
   - `SMTP_PASS`: Your email app password
   - `ENVIRONMENT`: `production`

### Step 6: Run Migrations
1. Click your service → "Settings"
2. In "Deploy" section, scroll to "Custom Start Command"
3. Temporarily set: `alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Save and redeploy

### Step 7: Get Your URL
1. Go to "Settings" → "Networking"
2. Click "Generate Domain"
3. Copy your URL: `https://pawthos-backend-production.up.railway.app`

**Done!** 🎉

---

## What You Get

✅ **Backend API**: Live at `https://your-app.up.railway.app`  
✅ **PostgreSQL Database**: Automatically connected  
✅ **File Uploads**: Working with persistent storage  
✅ **ML Models**: PyTorch & OpenCV fully supported  
✅ **HTTPS**: SSL certificate included  
✅ **No Cold Starts**: Always fast  

---

## Update Your Apps

### Web Frontend
Update API base URL in your environment config:
```javascript
// .env or config file
REACT_APP_API_URL=https://your-app.up.railway.app
```

### Mobile App
Update API endpoint:
```typescript
// config/api.ts
export const API_BASE_URL = 'https://your-app.up.railway.app';
```

---

## Test Your API

```bash
# Health check
curl https://your-app.up.railway.app/health

# Root endpoint
curl https://your-app.up.railway.app/

# Test CORS
curl https://your-app.up.railway.app/test-cors
```

---

## Useful Commands

```bash
# View logs
railway logs

# Open dashboard
railway open

# Check variables
railway variables

# Run migrations
railway run alembic upgrade head

# Shell access
railway shell
```

---

## Cost Estimate

- **Free Plan**: $5 credit/month
- **Your app usage**: ~$3-5/month (within free tier)
- **PostgreSQL**: Included in usage
- **No surprise charges**: Railway notifies before exceeding free tier

---

## Need Help?

Read the full guide: `RAILWAY_DEPLOYMENT.md`

**Happy deploying!** 🚂

