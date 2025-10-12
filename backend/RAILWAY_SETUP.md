# Railway Setup Guide - Fix Pre-Deploy Command Error

## 🚨 Current Error: Pre-deploy command failed

The error occurs because `alembic upgrade head` runs before the database is ready.

---

## ✅ Solution: Use Simple Start Command

### Step 1: Update Start Command in Railway

Go to Railway Dashboard:
1. Click your service
2. Go to **Settings** → **Deploy**
3. Find **Start Command**
4. Change it to:

```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Remove the `alembic upgrade head &&` part for now.

### Step 2: Add PostgreSQL Database (If Not Added)

1. In your Railway project, click **"+ New"**
2. Select **"Database"**
3. Choose **"Add PostgreSQL"**
4. Wait for it to provision (~30 seconds)

Railway automatically sets `DATABASE_URL` environment variable!

### Step 3: Set Environment Variables

Click your service → **Variables** tab:

Add these variables:
```
SECRET_KEY = sYIjB_9LQSAWKqs-70Dxhk2ASS3Rq1rf3L4wdMbpGRw
SMTP_USER = your-email@gmail.com
SMTP_PASS = your-app-password
ENVIRONMENT = production
```

### Step 4: Redeploy

Click **"Deploy"** → **"Redeploy"**

---

## 🔧 Run Migrations Manually (After First Deploy)

Once your app is deployed successfully:

### Option A: Using Railway CLI (Local)

```bash
# Install Railway CLI if not installed
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Run migrations
railway run alembic upgrade head
```

### Option B: Using Railway Dashboard Shell

1. Go to your service in Railway
2. Click **"Shell"** tab
3. Run:
```bash
alembic upgrade head
```

### Option C: Let App Create Tables (Temporary)

Your `main.py` already has this code:
```python
if os.getenv("ENVIRONMENT") != "production":
    models.Base.metadata.create_all(bind=engine)
```

To enable it even in production (temporarily), comment out the condition:
```python
# Always create tables on startup (temporary solution)
models.Base.metadata.create_all(bind=engine)
```

Then redeploy. This creates tables automatically.

⚠️ **Not recommended long-term**, but works for initial setup.

---

## 📋 Complete Setup Checklist

- [ ] PostgreSQL database added to project
- [ ] Environment variables set (SECRET_KEY, SMTP_USER, SMTP_PASS, ENVIRONMENT)
- [ ] Start command updated to: `uvicorn main:app --host 0.0.0.0 --port $PORT`
- [ ] Redeployed successfully
- [ ] Migrations run (via CLI or dashboard shell)
- [ ] Health endpoint working: `https://your-app.railway.app/health`

---

## 🧪 Test After Deployment

### 1. Health Check
```bash
curl https://your-app.railway.app/health
```

Expected: `{"status": "healthy"}`

### 2. Root Endpoint
```bash
curl https://your-app.railway.app/
```

Expected: `{"message": "Welcome to Pawthos API"}`

### 3. API Documentation
Visit: `https://your-app.railway.app/docs`

---

## 🔍 Common Issues

### Issue: "relation does not exist"
**Cause:** Database tables not created  
**Solution:** Run migrations manually (Option A, B, or C above)

### Issue: "could not connect to server"
**Cause:** DATABASE_URL not set  
**Solution:** Check PostgreSQL is added and DATABASE_URL variable exists

### Issue: "Authentication failed"
**Cause:** SECRET_KEY not set  
**Solution:** Add SECRET_KEY environment variable

### Issue: Build succeeds but app crashes
**Cause:** Missing environment variables  
**Solution:** Add all required variables (see Step 3)

---

## 🎯 Recommended Start Command

For now, use this simple command:
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Later, after tables are created, you can optionally add migrations back:
```
alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT
```

But only after confirming migrations work manually first!

---

## 📝 Environment Variables Reference

Required variables in Railway:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Auto-set by PostgreSQL | Don't manually set |
| `SECRET_KEY` | `sYIjB_9LQSAWKqs-70Dxhk2ASS3Rq1rf3L4wdMbpGRw` | From your run.txt |
| `SMTP_USER` | Your email | For sending emails |
| `SMTP_PASS` | App password | Gmail app password |
| `ENVIRONMENT` | `production` | Skips auto-creating tables |

---

## ✅ Quick Fix Summary

1. **Change start command to**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
2. **Add PostgreSQL** if not added
3. **Set environment variables**
4. **Redeploy**
5. **Run migrations manually** after first successful deploy

This will get your backend running! 🚀

