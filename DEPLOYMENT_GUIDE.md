# Pawthos Deployment Guide

Complete guide for deploying the Pawthos system to production using Railway (backend), Vercel (frontend), and Namecheap (domain).

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment (Railway)](#backend-deployment-railway)
3. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
4. [Domain Configuration (Namecheap)](#domain-configuration-namecheap)
5. [Post-Deployment Setup](#post-deployment-setup)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:
- [ ] GitHub repository with your Pawthos code
- [ ] Railway account (sign up at https://railway.app)
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Namecheap domain (`cityvetsanpedro.me`)
- [ ] Gmail account with App Password for email notifications

---

## Backend Deployment (Railway)

Railway provides PostgreSQL database and hosting for Python applications.

### Step 1: Create New Railway Project

1. Go to https://railway.app and sign in
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Authorize Railway to access your GitHub account
5. Select your **Pawthos repository**

### Step 2: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Wait for the database to provision (~1 minute)
4. Click on the PostgreSQL service
5. Go to **"Variables"** tab
6. Copy the `DATABASE_URL` value (starts with `postgresql://`)

### Step 3: Configure Backend Service

1. Click on your backend service (the one connected to your GitHub repo)
2. Go to **"Settings"** tab
3. Under **"Root Directory"**, set it to: `backend`
4. Under **"Start Command"**, verify it shows: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Step 4: Set Environment Variables

In your backend service, go to **"Variables"** tab and add:

```env
# Database (copy from PostgreSQL service)
DATABASE_URL=postgresql://postgres:***@***.***.railway.app:5432/railway

# JWT Secret (generate a secure random string)
SECRET_KEY=your_secure_random_secret_key_here

# SMTP for Email Notifications
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Environment
ENVIRONMENT=production

# CORS Origins (your Vercel frontend URL)
CORS_ORIGINS=https://cityvetsanpedro.me,https://www.cityvetsanpedro.me
```

**Important Notes:**
- **SECRET_KEY**: Generate using: `python -c "import secrets; print(secrets.token_urlsafe(32))"`
- **SMTP_PASS**: Create Gmail App Password at https://myaccount.google.com/apppasswords

### Step 5: Deploy and Run Migrations

1. Railway will automatically deploy after adding variables
2. Wait for deployment to complete (~3-5 minutes)
3. Open **"Deployments"** tab and check logs for errors
4. Once deployed, note your Railway backend URL (e.g., `https://your-app.railway.app`)

### Step 6: Run Database Migrations

**Option A: Using Railway CLI (Recommended)**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Run migrations
railway run alembic upgrade head
```

**Option B: Using Railway Dashboard**

1. In Railway project, click your backend service
2. Go to **"Deployments"** tab
3. Click the latest deployment → **"View Logs"**
4. Check if migrations ran automatically (look for "Running migrations")
5. If not, you may need to manually run: `railway run alembic upgrade head`

### Step 7: Verify Backend Deployment

Test your backend:
```bash
curl https://your-backend-url.railway.app/
```

You should see: `{"message":"Pawthos API is running"}`

Test API docs:
- Visit: `https://your-backend-url.railway.app/docs`

---

## Frontend Deployment (Vercel)

Vercel provides optimal hosting for React applications with automatic builds.

### Step 1: Create New Vercel Project

1. Go to https://vercel.com and sign in
2. Click **"Add New"** → **"Project"**
3. Import your **Pawthos** GitHub repository
4. Vercel will auto-detect it's a React app

### Step 2: Configure Build Settings

In the project configuration screen:

```
Framework Preset: Create React App
Root Directory: frontend
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

### Step 3: Set Environment Variables

Click **"Environment Variables"** and add:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app
```

**Important:** Replace `your-backend-url.railway.app` with your actual Railway backend URL.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (~2-4 minutes)
3. Vercel will provide a preview URL: `https://pawthos-username.vercel.app`

### Step 5: Test Frontend

1. Visit your Vercel deployment URL
2. Try accessing different pages (should work due to `_redirects` file)
3. Test API connectivity (try logging in)

**If API calls fail:**
- Check browser console for CORS errors
- Verify `CORS_ORIGINS` in Railway includes your Vercel URL
- Update Railway environment variables and redeploy

---

## Domain Configuration (Namecheap)

Connect your domain `cityvetsanpedro.me` to Vercel.

### Step 1: Add Domain to Vercel

1. In your Vercel project, go to **"Settings"** → **"Domains"**
2. Click **"Add"**
3. Enter: `cityvetsanpedro.me`
4. Click **"Add"**
5. Also add: `www.cityvetsanpedro.me`

### Step 2: Get Vercel DNS Records

Vercel will show you required DNS records. Typically:

**For root domain (cityvetsanpedro.me):**
```
Type: A
Name: @
Value: 76.76.19.19
```

**For www subdomain:**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Step 3: Configure Namecheap DNS

1. Log in to Namecheap
2. Go to **Domain List** → Click **"Manage"** next to `cityvetsanpedro.me`
3. Go to **"Advanced DNS"** tab
4. Click **"Add New Record"**

Add these records:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A Record | @ | 76.76.19.19 | Automatic |
| CNAME Record | www | cname.vercel-dns.com | Automatic |

5. Remove any conflicting records (old A records or CNAME for @)
6. Save changes

### Step 4: Verify Domain

1. Back in Vercel, wait for domain verification (~5-60 minutes)
2. Vercel will automatically provision SSL certificate
3. Visit `https://cityvetsanpedro.me` to test

**Note:** DNS propagation can take up to 48 hours, but usually happens within 1-2 hours.

---

## Post-Deployment Setup

### 1. Update CORS Settings

Ensure Railway backend has correct CORS origins:

```env
CORS_ORIGINS=https://cityvetsanpedro.me,https://www.cityvetsanpedro.me
```

Redeploy backend if changed.

### 2. Create Admin Account

Using Railway backend URL:

```bash
# Register first user
curl -X POST "https://your-backend-url.railway.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cityvetsanpedro.me",
    "username": "admin",
    "password": "SecurePassword123!",
    "first_name": "Admin",
    "last_name": "User"
  }'

# Check email for OTP and verify
curl -X POST "https://your-backend-url.railway.app/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cityvetsanpedro.me",
    "otp": "123456"
  }'
```

### 3. Promote User to Admin

Connect to Railway PostgreSQL:

```bash
railway connect postgres
```

Run SQL:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@cityvetsanpedro.me';
```

### 4. Test Full Application Flow

- [ ] Register new user
- [ ] Verify email OTP
- [ ] Login with credentials
- [ ] Create a pet record
- [ ] Create medical record
- [ ] Schedule appointment
- [ ] Generate reports
- [ ] Test pain assessment features

### 5. Monitor Application

**Railway Monitoring:**
- Go to your Railway project
- Check **"Metrics"** tab for CPU/Memory usage
- Check **"Logs"** tab for errors

**Vercel Monitoring:**
- Go to your Vercel project
- Check **"Analytics"** for traffic
- Check **"Deployments"** for build status

---

## Troubleshooting

### Backend Issues

#### Error: "Database connection failed"
**Solution:**
1. Check `DATABASE_URL` is correctly set in Railway variables
2. Verify PostgreSQL service is running
3. Check Railway logs for specific error

#### Error: "CORS policy blocked"
**Solution:**
1. Add frontend URL to `CORS_ORIGINS` in Railway
2. Format: `https://cityvetsanpedro.me,https://www.cityvetsanpedro.me` (no spaces)
3. Redeploy backend

#### Error: "Email sending failed"
**Solution:**
1. Verify `SMTP_USER` and `SMTP_PASS` are correct
2. Ensure Gmail App Password is created (not regular password)
3. Enable "Less secure app access" or use App Password

#### Error: "Migration failed"
**Solution:**
```bash
# Connect to Railway
railway link

# Check current migration status
railway run alembic current

# Reset to head
railway run alembic upgrade head
```

### Frontend Issues

#### Error: "Failed to load API"
**Solution:**
1. Check `REACT_APP_API_URL` in Vercel environment variables
2. Ensure URL includes `https://` and no trailing slash
3. Redeploy frontend after changing env vars

#### Error: "404 on page refresh"
**Solution:**
- Ensure `_redirects` file exists in `frontend/public/`
- Content: `/*    /index.html   200`
- Vercel should automatically handle SPA routing

#### Error: "Build failed"
**Solution:**
1. Check Vercel build logs
2. Common issues:
   - Missing dependencies: Run `npm install` locally first
   - TypeScript errors: Fix errors shown in logs
   - Build directory wrong: Verify "Output Directory" is `build`

### Domain Issues

#### Domain not connecting
**Solution:**
1. Wait 1-2 hours for DNS propagation
2. Check DNS records in Namecheap:
   ```bash
   nslookup cityvetsanpedro.me
   ```
3. Verify Vercel shows "Valid Configuration"

#### SSL certificate not working
**Solution:**
1. Vercel automatically provisions SSL
2. Wait up to 24 hours after domain verification
3. If still failing, remove and re-add domain in Vercel

---

## Deployment Checklist

Before going live, ensure:

- [ ] Backend deployed to Railway
- [ ] PostgreSQL database connected and migrated
- [ ] All environment variables set in Railway
- [ ] Backend API accessible at Railway URL
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variables set
- [ ] Domain connected to Vercel
- [ ] DNS records configured in Namecheap
- [ ] SSL certificate active
- [ ] CORS properly configured
- [ ] Admin account created and verified
- [ ] Full application flow tested
- [ ] Email notifications working
- [ ] Pain assessment features working

---

## Security Recommendations

1. **Never commit `.env` files** - Already in `.gitignore`
2. **Use strong SECRET_KEY** - Generate random 32+ character string
3. **Enable Railway's built-in DDoS protection**
4. **Set up Vercel's security headers** in `vercel.json`
5. **Regular backups** - Railway provides automatic PostgreSQL backups
6. **Monitor logs** regularly for suspicious activity
7. **Keep dependencies updated** - Run `pip-audit` and `npm audit`

---

## Maintenance

### Update Backend
```bash
# Push changes to GitHub
git push origin main

# Railway auto-deploys on push
# Check deployment status in Railway dashboard
```

### Update Frontend
```bash
# Push changes to GitHub
git push origin main

# Vercel auto-deploys on push
# Check deployment status in Vercel dashboard
```

### Database Backup
```bash
# Railway provides automatic daily backups
# To manually backup:
railway run pg_dump $DATABASE_URL > backup.sql
```

### View Logs
```bash
# Backend logs
railway logs

# Frontend logs (in Vercel dashboard)
# Go to Deployments → Select deployment → View Function Logs
```

---

## Cost Estimates

### Railway (Backend + Database)
- **Starter Plan**: $5/month
  - 500 execution hours
  - 8GB RAM
  - Shared CPU
  - PostgreSQL included

### Vercel (Frontend)
- **Hobby Plan**: Free
  - Unlimited deployments
  - Automatic SSL
  - 100GB bandwidth/month

### Namecheap (Domain)
- **Domain Registration**: ~$10-15/year
- **DNS Hosting**: Free

**Total**: ~$5-10/month + domain cost

---

## Support Resources

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **React Docs**: https://react.dev
- **Namecheap Support**: https://www.namecheap.com/support/

---

## Next Steps

After successful deployment:

1. **Set up monitoring** - Use Railway and Vercel analytics
2. **Configure backups** - Railway auto-backups + manual exports
3. **Set up alerts** - Railway can send deployment notifications
4. **Document API** - Your FastAPI `/docs` endpoint is auto-generated
5. **User training** - Share application URL with users
6. **Gather feedback** - Monitor usage and iterate

---

**Deployment Date**: _________

**Deployed By**: _________

**Backend URL**: https://____________.railway.app

**Frontend URL**: https://cityvetsanpedro.me

**Database**: Railway PostgreSQL

---

*For questions or issues, contact your development team.*

