# Pawthos Deployment Checklist

Quick reference checklist for deploying Pawthos to production.

---

## Pre-Deployment Preparation

### Accounts & Access
- [ ] Railway account created and verified
- [ ] Vercel account created and verified
- [ ] GitHub repository access confirmed
- [ ] Namecheap domain access (`cityvetsanpedro.me`)
- [ ] Gmail account with App Password generated

### Code Ready
- [ ] All code pushed to GitHub main branch
- [ ] `.env.example` file up to date
- [ ] Frontend `.env` configured locally and tested
- [ ] Backend `requirements.txt` finalized
- [ ] Database migrations tested locally
- [ ] `_redirects` file present in `frontend/public/`

---

## Backend Deployment (Railway)

### Railway Project Setup
- [ ] New Railway project created from GitHub repo
- [ ] PostgreSQL database added to project
- [ ] Root directory set to `backend`
- [ ] Start command verified: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Environment Variables
- [ ] `DATABASE_URL` copied from PostgreSQL service
- [ ] `SECRET_KEY` generated (min 32 characters)
- [ ] `SMTP_USER` set (Gmail address)
- [ ] `SMTP_PASS` set (Gmail App Password)
- [ ] `ENVIRONMENT` set to `production`
- [ ] `CORS_ORIGINS` includes frontend URL

### Database & Deployment
- [ ] Initial deployment completed
- [ ] Railway CLI installed (`npm install -g @railway/cli`)
- [ ] Railway project linked (`railway link`)
- [ ] Database migrations run (`railway run alembic upgrade head`)
- [ ] Backend URL noted: `https://____________.railway.app`
- [ ] API docs accessible at `/docs` endpoint
- [ ] Health check passed: `curl https://your-backend.railway.app/`

---

## Frontend Deployment (Vercel)

### Vercel Project Setup
- [ ] New Vercel project created from GitHub
- [ ] Framework preset set to "Create React App"
- [ ] Root directory set to `frontend`
- [ ] Build command: `npm run build`
- [ ] Output directory: `build`

### Environment Variables
- [ ] `REACT_APP_API_URL` set to Railway backend URL

### Deployment
- [ ] Initial deployment completed
- [ ] Preview URL working
- [ ] SPA routing working (test refresh on different routes)
- [ ] API calls working from frontend
- [ ] No CORS errors in browser console

---

## Domain Configuration (Namecheap)

### Vercel Domain Setup
- [ ] `cityvetsanpedro.me` added to Vercel
- [ ] `www.cityvetsanpedro.me` added to Vercel
- [ ] DNS records noted from Vercel

### Namecheap DNS Configuration
- [ ] Logged into Namecheap account
- [ ] Navigated to Advanced DNS for domain
- [ ] A Record added: `@` → `76.76.19.19`
- [ ] CNAME Record added: `www` → `cname.vercel-dns.com`
- [ ] Old conflicting records removed
- [ ] DNS changes saved

### Domain Verification
- [ ] Domain verified in Vercel (may take 1-2 hours)
- [ ] SSL certificate auto-provisioned by Vercel
- [ ] `https://cityvetsanpedro.me` accessible
- [ ] `https://www.cityvetsanpedro.me` accessible
- [ ] Both URLs redirect correctly

---

## Post-Deployment Configuration

### CORS Update
- [ ] Railway `CORS_ORIGINS` includes both domain URLs
- [ ] Backend redeployed after CORS update
- [ ] CORS tested from live frontend

### Admin Account Setup
- [ ] First user registered via API or frontend
- [ ] OTP email received and verified
- [ ] User promoted to admin in database
- [ ] Admin login tested
- [ ] Admin dashboard accessible

### Testing Full Application

#### Authentication & Users
- [ ] New user registration works
- [ ] OTP email delivery works
- [ ] Email verification works
- [ ] Login works
- [ ] Password reset works
- [ ] User profile updates work

#### Core Features
- [ ] Pet registration works
- [ ] Pet list displays correctly
- [ ] Medical records creation works
- [ ] Vaccination records creation works
- [ ] Appointment scheduling works
- [ ] Appointment list displays
- [ ] Walk-in registration works

#### Admin Features
- [ ] Admin dashboard loads
- [ ] User management works
- [ ] Reports generation works
- [ ] Vaccination drives creation works
- [ ] Animal control records work
- [ ] Shipping permits work
- [ ] Meat inspection records work
- [ ] Pain assessment features work

---

## Monitoring & Maintenance

### Railway Monitoring
- [ ] Deployment logs reviewed
- [ ] No errors in recent logs
- [ ] Metrics checked (CPU, Memory, Network)
- [ ] PostgreSQL database connection stable
- [ ] Auto-deploy from GitHub enabled

### Vercel Monitoring
- [ ] Build logs reviewed
- [ ] No build warnings or errors
- [ ] Analytics configured
- [ ] Auto-deploy from GitHub enabled

### Application Health
- [ ] API response times acceptable (<2s)
- [ ] Frontend load times acceptable (<3s)
- [ ] Database queries optimized
- [ ] No JavaScript errors in browser console
- [ ] Mobile responsiveness checked

---

## Security Checklist

- [ ] `.env` files not committed to Git
- [ ] `SECRET_KEY` is strong and unique
- [ ] Database password is strong
- [ ] Gmail App Password used (not regular password)
- [ ] HTTPS enforced on all endpoints
- [ ] CORS properly restricted to frontend domain
- [ ] API rate limiting considered
- [ ] Input validation working
- [ ] SQL injection protection verified (SQLAlchemy ORM)
- [ ] XSS protection in place

---

## Backup & Recovery

- [ ] Railway automatic backups verified
- [ ] Manual database backup tested:
  ```bash
  railway run pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
  ```
- [ ] Backup restoration process documented
- [ ] Environment variables backed up securely
- [ ] GitHub repository access documented

---

## Documentation

- [ ] README.md updated with production URLs
- [ ] API documentation accessible at `/docs`
- [ ] Deployment guide reviewed
- [ ] Admin credentials documented securely
- [ ] Emergency contacts list created

---

## Final Verification

- [ ] All checklist items completed
- [ ] Production URLs noted below
- [ ] Team notified of deployment
- [ ] Users can access application
- [ ] Support channels ready

---

## Production URLs

**Frontend**: https://cityvetsanpedro.me

**Backend API**: https://____________.railway.app

**API Docs**: https://____________.railway.app/docs

**Database**: Railway PostgreSQL (internal)

---

## Deployment Information

**Deployment Date**: ___________________

**Deployed By**: ___________________

**Version**: ___________________

**Notes**:
```
[Add any deployment notes, issues encountered, or special configurations]
```

---

## Rollback Plan (If Needed)

If deployment fails or critical issues occur:

1. **Frontend Rollback**:
   - Go to Vercel → Deployments
   - Find previous working deployment
   - Click "Promote to Production"

2. **Backend Rollback**:
   - Go to Railway → Deployments
   - Click on previous working deployment
   - Click "Redeploy"

3. **Database Rollback**:
   ```bash
   railway run alembic downgrade -1
   ```

4. **Emergency Contacts**:
   - Railway Support: support@railway.app
   - Vercel Support: support@vercel.com
   - Development Team: [Your contact info]

---

## Post-Launch Tasks

After successful deployment:

- [ ] Monitor application for 24 hours
- [ ] Collect user feedback
- [ ] Document any issues
- [ ] Plan first maintenance window
- [ ] Schedule regular backups
- [ ] Set up uptime monitoring (UptimeRobot, etc.)
- [ ] Configure error tracking (Sentry, etc.)
- [ ] Set up usage analytics

---

**Status**: ⬜ Not Started | 🟡 In Progress | ✅ Completed | ❌ Failed

**Overall Deployment Status**: _____________

---

*Keep this checklist updated for future deployments and reference.*

