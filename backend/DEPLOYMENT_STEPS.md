# Step-by-Step Deployment to Vercel

## ⚠️ Before You Start

**IMPORTANT**: Your backend includes ML models (PyTorch, OpenCV) and file uploads that may not work well with Vercel's serverless functions. Please read `VERCEL_DEPLOYMENT.md` for full details.

**Recommended alternatives**: Railway.app or Render.com (see bottom of this file)

---

## Option 1: Deploy to Vercel (Quick Start)

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Navigate to Backend Directory
```bash
cd backend
```

### Step 3: Login to Vercel
```bash
vercel login
```

### Step 4: Deploy
```bash
vercel
```

Answer the prompts:
- **Set up and deploy?** → `Y`
- **Which scope?** → Select your account
- **Link to existing project?** → `N` (first time)
- **Project name?** → `pawthos-backend`
- **In which directory is your code located?** → `./`
- **Want to override settings?** → `N`

### Step 5: Add Environment Variables
```bash
# Database URL
vercel env add DATABASE_URL
# Paste your PostgreSQL connection string when prompted

# Secret Key for JWT
vercel env add SECRET_KEY
# Paste a secure secret key (minimum 32 characters)

# SMTP Configuration
vercel env add SMTP_USER
# Paste your SMTP username

vercel env add SMTP_PASS
# Paste your SMTP password

# Environment flag
vercel env add ENVIRONMENT
# Type: production
```

### Step 6: Deploy to Production
```bash
vercel --prod
```

### Step 7: Update Frontend
Update your frontend's API URL to the Vercel deployment URL:
```
https://pawthos-backend.vercel.app
```

---

## Option 2: Deploy via Vercel Dashboard (GitHub Integration)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### Step 2: Import to Vercel
1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Configure project:
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty

### Step 3: Add Environment Variables
In the Vercel Dashboard:
1. Go to Project Settings → Environment Variables
2. Add the following:
   - `DATABASE_URL` → Your PostgreSQL connection string
   - `SECRET_KEY` → Your JWT secret key
   - `SMTP_USER` → Your SMTP username
   - `SMTP_PASS` → Your SMTP password
   - `ENVIRONMENT` → `production`

### Step 4: Deploy
Click "Deploy" and wait for deployment to complete.

---

## Testing Your Deployment

### Test Health Endpoint
```bash
curl https://your-deployment-url.vercel.app/health
```

Expected response:
```json
{"status": "healthy"}
```

### Test Root Endpoint
```bash
curl https://your-deployment-url.vercel.app/
```

Expected response:
```json
{"message": "Welcome to Pawthos API"}
```

### Test Authentication
Use Postman or curl to test your authentication endpoints:
```bash
curl -X POST https://your-deployment-url.vercel.app/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "test@example.com", "password": "testpassword"}'
```

---

## Troubleshooting Common Issues

### Issue 1: Deployment Size Exceeds 50MB
**Symptoms**: Error during deployment about function size
**Solution**: 
1. Use `requirements-vercel-minimal.txt` instead of `requirements.txt`
2. Rename it to `requirements.txt` before deploying
3. Or move ML models to external storage (S3, Cloudinary)

### Issue 2: Module Import Errors
**Symptoms**: `ModuleNotFoundError` or import errors
**Solution**:
1. Ensure all dependencies are in `requirements.txt`
2. Check that `api/index.py` is correctly set up
3. Verify Root Directory is set to `backend` in Vercel settings

### Issue 3: Database Connection Errors
**Symptoms**: Cannot connect to database
**Solution**:
1. Verify `DATABASE_URL` environment variable is set correctly
2. Ensure your database allows connections from Vercel's IPs
3. For Supabase/Neon, use connection pooling mode
4. Check database is running and accessible

### Issue 4: CORS Errors
**Symptoms**: Frontend can't connect to backend
**Solution**:
1. Update CORS origins in `main.py` to include your frontend URL
2. Ensure environment variables are set in Vercel
3. Redeploy after making changes

### Issue 5: File Upload Failures
**Symptoms**: Image upload for pain assessment fails
**Solution**:
1. Vercel's filesystem is read-only and ephemeral
2. Must use external storage (S3, Cloudinary, etc.)
3. See cloud storage integration guide below

---

## Database Setup for Production

### Option 1: Supabase (Recommended - Free)
1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Get connection string from Settings → Database
4. Use as `DATABASE_URL`

### Option 2: Neon (Recommended - Free)
1. Create account at [neon.tech](https://neon.tech)
2. Create new project
3. Copy connection string
4. Use as `DATABASE_URL`

### Option 3: Railway PostgreSQL
1. Create account at [railway.app](https://railway.app)
2. Create new PostgreSQL database
3. Copy connection URL
4. Use as `DATABASE_URL`

### Running Migrations
Before your first deployment, run migrations:
```bash
# Set DATABASE_URL locally
export DATABASE_URL="your-production-database-url"

# Run migrations
alembic upgrade head
```

---

## Cloud Storage Integration (for File Uploads)

Since Vercel's filesystem is ephemeral, you need cloud storage for uploads.

### Option 1: Cloudinary (Easiest)
```bash
pip install cloudinary
```

Add to environment variables:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

### Option 2: AWS S3
```bash
pip install boto3
```

Add to environment variables:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET`

---

## 🚀 RECOMMENDED: Alternative Platforms

Given your ML requirements, consider these instead of Vercel:

### Railway.app (Recommended) ⭐
**Why?** No limits on model size, persistent storage, very easy to deploy

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Add environment variables in Railway dashboard
```

**Pros**: 
- ✅ No serverless limitations
- ✅ Persistent file storage
- ✅ Great for ML applications
- ✅ Free tier available
- ✅ PostgreSQL included

### Render.com (Recommended) ⭐
**Why?** Free tier, persistent disks, PostgreSQL included

1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create "Web Service"
4. Configure:
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Deploy

**Pros**:
- ✅ Free tier with 750 hours/month
- ✅ Persistent disks
- ✅ PostgreSQL included
- ✅ No cold starts (on paid plans)

### Fly.io
**Why?** Persistent volumes, great performance

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
fly launch

# Deploy
fly deploy
```

---

## Post-Deployment Checklist

- [ ] Test all API endpoints
- [ ] Verify database connections
- [ ] Test authentication flow
- [ ] Test file uploads (if configured)
- [ ] Update frontend API URL
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS
- [ ] Set up monitoring/logging
- [ ] Configure backup strategy
- [ ] Document API URL for mobile app

---

## Getting Help

- **Vercel Docs**: https://vercel.com/docs/functions/runtimes/python
- **FastAPI Docs**: https://fastapi.tiangolo.com/deployment/
- **Railway Docs**: https://docs.railway.app/
- **Render Docs**: https://render.com/docs

---

## Summary

**For Vercel deployment**: Follow Option 1 or Option 2 above, but be aware of the 50MB limit and serverless constraints.

**Better alternatives**: Railway or Render are strongly recommended for your use case with ML models and file uploads.

Choose the platform that best fits your needs! 🚀

