# 🚂 Deploy to Railway NOW - Copy & Paste Commands

## ⚡ Super Quick Deploy (5 Commands)

Open PowerShell and run these commands:

```powershell
# 1. Install Railway CLI
iwr https://railway.app/install.ps1 -useb | iex

# 2. Navigate to backend folder
cd "C:\Users\DELL\OneDrive - Polytechnic University of the Philippines\Documents\Pawthos\backend"

# 3. Login and initialize
railway login
railway init

# 4. Add PostgreSQL database
railway add --database postgresql

# 5. Deploy!
railway up
```

That's it! 🎉

---

## 📋 Complete Setup (With Environment Variables)

### Step 1: Install Railway CLI
```powershell
iwr https://railway.app/install.ps1 -useb | iex
```

### Step 2: Navigate to Backend
```powershell
cd "C:\Users\DELL\OneDrive - Polytechnic University of the Philippines\Documents\Pawthos\backend"
```

### Step 3: Login to Railway
```powershell
railway login
```
*Browser will open for authentication*

### Step 4: Initialize Project
```powershell
railway init
```
- Project name: `pawthos-backend` (or whatever you prefer)

### Step 5: Add PostgreSQL Database
```powershell
railway add --database postgresql
```
*This automatically sets DATABASE_URL for you!*

### Step 6: Set Environment Variables

First, generate a secure secret key:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(32))"
```
Copy the output, then run:

```powershell
# Replace with the generated secret key
railway variables set SECRET_KEY="paste-your-generated-secret-key-here"

# Replace with your actual email credentials
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASS="your-app-password"

# Set environment to production
railway variables set ENVIRONMENT="production"
```

**For Gmail SMTP Password:**
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Create an "App Password" for "Mail"
4. Use that 16-character password

### Step 7: Run Database Migrations
```powershell
railway run alembic upgrade head
```

### Step 8: Deploy Your Application
```powershell
railway up
```

### Step 9: Generate Public Domain
```powershell
railway domain
```

Copy the URL that appears (e.g., `https://pawthos-backend-production.up.railway.app`)

---

## 🧪 Test Your Deployment

Replace `YOUR_URL` with your actual Railway URL:

```powershell
# Test health endpoint
curl https://YOUR_URL/health

# Test root endpoint
curl https://YOUR_URL/

# Test CORS
curl https://YOUR_URL/test-cors
```

Or use the provided script:
```powershell
python check_deployment.py https://YOUR_URL
```

---

## 📱 Update Your Apps with New URL

### Web Frontend
Update your API base URL in environment config:
```javascript
// src/config.ts or .env file
REACT_APP_API_URL=https://your-railway-url.up.railway.app
```

### Mobile App
Update in your API config file:
```typescript
// utils/api.ts or similar
const API_BASE_URL = 'https://your-railway-url.up.railway.app';
```

---

## 🔄 Redeploy After Changes

Whenever you make changes to your code:

```powershell
# Option 1: Deploy from local
railway up

# Option 2: If using GitHub integration
git add .
git commit -m "Your changes"
git push origin main
# Railway auto-deploys
```

---

## 📊 View Logs and Monitor

```powershell
# View live logs
railway logs

# Open Railway dashboard
railway open

# Check deployment status
railway status

# List all environment variables
railway variables
```

---

## 💰 Check Usage

```powershell
railway open
```
Then go to: Project Settings → Usage

You get **$5 credit monthly** on the free plan!

---

## 🆘 Common Issues

### "railway: command not found"
**Solution:** Restart PowerShell after installing Railway CLI

### "Failed to authenticate"
**Solution:** 
```powershell
railway logout
railway login
```

### "Build failed"
**Solution:** Check logs:
```powershell
railway logs
```

### "Database connection error"
**Solution:** Verify DATABASE_URL is set:
```powershell
railway variables get DATABASE_URL
```

### "Port already in use" (local testing)
**Solution:** Kill the process:
```powershell
# Find process using port 8000
netstat -ano | findstr :8000

# Kill it (replace PID with actual process ID)
taskkill /PID <PID> /F
```

---

## ✅ Deployment Checklist

- [ ] Railway CLI installed
- [ ] Logged in to Railway
- [ ] Project initialized
- [ ] PostgreSQL database added
- [ ] Environment variables set (SECRET_KEY, SMTP_USER, SMTP_PASS, ENVIRONMENT)
- [ ] Migrations run successfully
- [ ] Application deployed
- [ ] Public domain generated
- [ ] Health endpoint responding
- [ ] Frontend updated with new URL
- [ ] Mobile app updated with new URL
- [ ] Tested authentication
- [ ] Tested file upload
- [ ] Tested AI prediction endpoints

---

## 🎯 Your URLs After Deployment

After deployment, you'll have:

- **API Base URL**: `https://pawthos-backend-production.up.railway.app`
- **API Docs**: `https://pawthos-backend-production.up.railway.app/docs`
- **Health Check**: `https://pawthos-backend-production.up.railway.app/health`
- **Railway Dashboard**: Access via `railway open`

---

## 📚 Additional Resources

- **Full Guide**: See `RAILWAY_DEPLOYMENT.md`
- **Quick Reference**: See `QUICK_DEPLOY_RAILWAY.md`
- **Railway Docs**: https://docs.railway.app/
- **Discord Support**: https://discord.gg/railway

---

## 🎉 Success!

Once deployed, you'll have:
- ✅ Production-ready API with HTTPS
- ✅ PostgreSQL database with automatic backups
- ✅ ML models working (PyTorch, OpenCV)
- ✅ File uploads working
- ✅ No cold starts
- ✅ Automatic scaling
- ✅ Monitoring and logs

**Go ahead and run those commands!** 🚀

