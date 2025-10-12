# Vercel Deployment Guide for Pawthos Backend

## ⚠️ Important Considerations

Before deploying to Vercel, please be aware of these limitations:

### 1. **Serverless Function Size Limit (50MB)**
Your application includes large ML models:
- `models/best_efficientnet_model.pth` (PyTorch model)
- `eld/eld_pain_model.pkl` (scikit-learn model)
- Dependencies like `torch`, `torchvision`, `opencv-python`

These may exceed Vercel's 50MB limit. **Solutions:**
- Store models in cloud storage (AWS S3, Google Cloud Storage, Azure Blob)
- Use lighter model alternatives
- Consider alternative platforms (AWS Lambda with EFS, Railway, Render, or Heroku)

### 2. **Execution Time Limits**
- Hobby Plan: 10 seconds
- Pro Plan: 60 seconds
- ML inference may take longer with cold starts

### 3. **File Uploads**
- Vercel's filesystem is read-only and ephemeral
- Current `uploads/` directory won't work
- **Must integrate external storage:**
  - AWS S3
  - Cloudinary
  - Vercel Blob Storage
  - Supabase Storage

### 4. **Database Migrations**
- Alembic migrations cannot run automatically
- Must run migrations separately before deployment
- Consider using Vercel's `@vercel/postgres` or external PostgreSQL (Supabase, Neon, etc.)

## 📋 Pre-Deployment Checklist

### Step 1: Install Vercel CLI
```bash
npm install -g vercel
```

### Step 2: Set Up Environment Variables
In Vercel Dashboard or via CLI, add these environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key
- `SMTP_USER` - Email SMTP username
- `SMTP_PASS` - Email SMTP password

### Step 3: Optimize Requirements
Create a minimal `requirements.txt` if ML features exceed limits:

**Option A: Without ML Features**
```txt
fastapi==0.104.1
uvicorn==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
python-dotenv==1.0.0
authlib
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
bcrypt==4.0.1
python-multipart==0.0.6
email-validator
alembic==1.12.1
pydantic==2.10.4
pydantic-settings==2.6.1
fastapi-mail==1.5.0
```

**Option B: With ML Features (may exceed limits)**
Keep current requirements.txt

### Step 4: Update CORS Origins
In `main.py`, update CORS to include your Vercel domain:
```python
allow_origins=[
    "https://your-frontend-domain.vercel.app",
    "http://localhost:3000",
    # ... other origins
]
```

### Step 5: Handle File Uploads
If using AI predictions with image uploads, integrate cloud storage:

```python
# Example: Using Cloudinary
import cloudinary
import cloudinary.uploader

# In your upload endpoint
result = cloudinary.uploader.upload(file)
image_url = result['secure_url']
```

## 🚀 Deployment Commands

### Option 1: Deploy via CLI
```bash
# Navigate to backend directory
cd backend

# Login to Vercel
vercel login

# Deploy
vercel

# Or deploy to production
vercel --prod
```

### Option 2: Deploy via GitHub
1. Push your code to GitHub
2. Connect repository in Vercel Dashboard
3. Set Root Directory to `backend`
4. Add environment variables
5. Deploy

## 🔧 Alternative Platforms (Recommended for ML)

Given the ML model requirements, consider these alternatives:

### 1. **Railway.app** (Recommended)
- No serverless limits
- Persistent storage
- Easy deployment
- Free tier available
```bash
npm install -g railway
railway login
railway init
railway up
```

### 2. **Render.com** (Recommended)
- Free tier
- Persistent disks
- Good for ML apps
- PostgreSQL included

### 3. **Fly.io**
- Persistent volumes
- Better for stateful apps
- Great for ML models

### 4. **AWS Lambda + EFS**
- Mount EFS for large models
- More complex setup
- No size limits

### 5. **Google Cloud Run**
- Container-based
- No package size limits
- Good for ML

## 📝 Post-Deployment Steps

1. **Test all endpoints**: Verify each API route works
2. **Monitor performance**: Check cold start times
3. **Set up monitoring**: Use Vercel Analytics or external tools
4. **Update frontend**: Point API calls to Vercel URL
5. **Set up custom domain** (optional)

## 🐛 Troubleshooting

### Issue: Function size exceeded
**Solution**: 
- Use lighter dependencies
- Move ML models to cloud storage
- Consider alternative platforms

### Issue: Timeout errors
**Solution**:
- Optimize ML inference
- Use model quantization
- Increase timeout (Pro plan)
- Use async processing with queues

### Issue: Database connection errors
**Solution**:
- Use connection pooling
- Configure proper DATABASE_URL
- Use Vercel Postgres or external DB

### Issue: CORS errors
**Solution**:
- Add Vercel domain to allowed origins
- Check environment variables

## 📚 Resources

- [Vercel Python Documentation](https://vercel.com/docs/functions/runtimes/python)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Vercel Limits](https://vercel.com/docs/functions/limitations)

## ⚡ Quick Start

If you want to proceed with Vercel despite limitations:

```bash
cd backend
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **pawthos-backend**
- In which directory is your code located? **./**
- Want to override settings? **N**

Then set environment variables:
```bash
vercel env add DATABASE_URL
vercel env add SECRET_KEY
vercel env add SMTP_USER
vercel env add SMTP_PASS
```

Deploy to production:
```bash
vercel --prod
```

---

**Recommendation**: Given your ML models and file upload requirements, I strongly recommend using **Railway.app** or **Render.com** instead of Vercel. They're better suited for your use case and won't require significant refactoring.

