# 🚂 Railway Deployment - Complete Guide

## 📦 What's Been Set Up

Your backend is now **ready to deploy to Railway** with all necessary configuration files!

### Files Created:
1. ✅ `railway.json` - Railway deployment configuration
2. ✅ `Procfile` - Process/startup configuration  
3. ✅ `nixpacks.toml` - Build configuration
4. ✅ `runtime.txt` - Python version specification
5. ✅ `.railwayignore` - Files to exclude from deployment
6. ✅ `start.sh` - Startup script with migrations
7. ✅ `check_deployment.py` - Deployment verification script

### Documentation Created:
1. 📖 `RAILWAY_DEPLOYMENT.md` - Complete detailed guide
2. 📖 `QUICK_DEPLOY_RAILWAY.md` - Quick reference
3. 📖 `DEPLOY_NOW.md` - Copy-paste commands (⭐ START HERE)
4. 📖 `WHY_RAILWAY.md` - Platform comparison & benefits
5. 📖 `MODEL_DEPLOYMENT.md` - ML model handling guide

### Also Created (for reference):
- `vercel.json` - Vercel config (if you change your mind)
- `VERCEL_DEPLOYMENT.md` - Vercel guide
- `DEPLOYMENT_STEPS.md` - Vercel steps

---

## 🎯 Next Steps (Choose One)

### Quick Deploy (Recommended) ⚡
**Time: ~5 minutes**

Open `DEPLOY_NOW.md` and copy-paste the commands!

Or run this now:
```powershell
iwr https://railway.app/install.ps1 -useb | iex
cd backend
railway login
railway init
railway add --database postgresql
railway variables set SECRET_KEY="$(python -c 'import secrets; print(secrets.token_urlsafe(32))')"
railway variables set SMTP_USER="your-email@gmail.com"
railway variables set SMTP_PASS="your-app-password"
railway variables set ENVIRONMENT="production"
railway run alembic upgrade head
railway up
railway domain
```

### Detailed Setup
**Time: ~15 minutes**

Read `RAILWAY_DEPLOYMENT.md` for complete step-by-step instructions.

---

## ⚠️ Important: ML Models

Your `.gitignore` currently excludes model files. You need to either:

**Option 1: Use Git LFS (Recommended)**
```bash
git lfs install
git lfs track "*.pth"
git lfs track "*.pkl"
# Then remove model exclusions from .gitignore
# See MODEL_DEPLOYMENT.md for details
```

**Option 2: Deploy without models, use cloud storage**
- See `MODEL_DEPLOYMENT.md` for cloud storage setup

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] Railway account (sign up at https://railway.app)
- [ ] Git LFS set up (for ML models) - See `MODEL_DEPLOYMENT.md`
- [ ] Models either committed or in cloud storage
- [ ] SMTP credentials ready (Gmail app password)
- [ ] Tested backend locally

---

## 🚀 Deployment Options

### Option A: CLI Deployment (Fastest)
1. Install Railway CLI
2. Run `railway login`
3. Run commands from `DEPLOY_NOW.md`
4. Done! ✨

### Option B: GitHub Integration
1. Push code to GitHub
2. Connect repository in Railway Dashboard
3. Add PostgreSQL database
4. Set environment variables
5. Deploy automatically

See `RAILWAY_DEPLOYMENT.md` for detailed instructions.

---

## 🧪 After Deployment

### Test Your API
```bash
# Replace YOUR_URL with your Railway URL
python check_deployment.py YOUR_URL
```

### Update Your Apps
**Web Frontend:** Update API URL to Railway URL  
**Mobile App:** Update API URL to Railway URL

---

## 💰 Cost Estimate

- **Free Plan**: $5 credit/month
- **Your app**: ~$3-5/month (within free tier!)
- **Includes**: PostgreSQL, SSL, storage, bandwidth

Monitor usage: `railway open` → Usage tab

---

## 📚 Quick Reference

### Essential Commands
```bash
railway login          # Authenticate
railway init          # Create project
railway up            # Deploy
railway logs          # View logs
railway open          # Open dashboard
railway domain        # Generate URL
```

### Environment Variables
Required variables:
- `DATABASE_URL` (auto-set with PostgreSQL)
- `SECRET_KEY` (generate: `python -c "import secrets; print(secrets.token_urlsafe(32))"`)
- `SMTP_USER` (your email)
- `SMTP_PASS` (app password)
- `ENVIRONMENT` (set to "production")

---

## 🆘 Need Help?

### Read These Guides:
1. **First time?** → `DEPLOY_NOW.md`
2. **Want details?** → `RAILWAY_DEPLOYMENT.md`
3. **Quick command?** → `QUICK_DEPLOY_RAILWAY.md`
4. **Why Railway?** → `WHY_RAILWAY.md`
5. **Model issues?** → `MODEL_DEPLOYMENT.md`

### External Resources:
- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- FastAPI Docs: https://fastapi.tiangolo.com/

---

## ✨ What You'll Get

After deployment:
- ✅ Production API with HTTPS
- ✅ PostgreSQL database with backups
- ✅ ML models working (PyTorch, OpenCV)
- ✅ File uploads functional
- ✅ Fast response times (no cold starts)
- ✅ Monitoring and logs
- ✅ Automatic scaling
- ✅ Railway subdomain (e.g., `pawthos-backend-production.up.railway.app`)

---

## 🎉 Ready to Deploy?

### Three Simple Steps:

1. **Open PowerShell**
   ```powershell
   cd "C:\Users\DELL\OneDrive - Polytechnic University of the Philippines\Documents\Pawthos\backend"
   ```

2. **Read the guide**
   ```powershell
   notepad DEPLOY_NOW.md
   ```

3. **Deploy!**
   ```powershell
   # Copy commands from DEPLOY_NOW.md and run them
   ```

---

## 🔗 Your URLs After Deployment

- **API**: `https://pawthos-backend-production.up.railway.app`
- **Docs**: `https://pawthos-backend-production.up.railway.app/docs`
- **Health**: `https://pawthos-backend-production.up.railway.app/health`
- **Dashboard**: Run `railway open`

---

## 📞 Support

If you run into issues:
1. Check logs: `railway logs`
2. Read troubleshooting in `RAILWAY_DEPLOYMENT.md`
3. Check Railway status: https://status.railway.app/
4. Ask on Railway Discord: https://discord.gg/railway

---

**Your backend is ready for production! Let's deploy! 🚀**

Start with: `DEPLOY_NOW.md`

