# Pawthos Deployment Quick Reference

Fast reference for common deployment tasks and commands.

---

## Railway Commands

### Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
railway link

# Show current project info
railway status
```

### Database Operations
```bash
# Connect to PostgreSQL
railway connect postgres

# Run migrations
railway run alembic upgrade head

# Check migration status
railway run alembic current

# Rollback one migration
railway run alembic downgrade -1

# Create manual backup
railway run pg_dump $DATABASE_URL > backup.sql

# Restore from backup
railway run psql $DATABASE_URL < backup.sql
```

### Deployment
```bash
# View logs (real-time)
railway logs

# View specific service logs
railway logs --service backend

# Run command in Railway environment
railway run <command>

# SSH into service (if needed)
railway shell
```

### Environment Variables
```bash
# List all variables
railway variables

# Set a variable
railway variables set KEY=value

# Delete a variable
railway variables delete KEY
```

---

## Vercel Commands

### Setup
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link to project
vercel link
```

### Deployment
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs <deployment-url>

# List deployments
vercel ls

# View project info
vercel inspect
```

### Environment Variables
```bash
# Add environment variable
vercel env add REACT_APP_API_URL

# List variables
vercel env ls

# Remove variable
vercel env rm REACT_APP_API_URL
```

---

## Common SQL Queries

### User Management
```sql
-- View all users
SELECT id, email, username, role, is_active, created_at FROM users;

-- Promote user to admin
UPDATE users SET role = 'admin' WHERE email = 'user@example.com';

-- Verify user without OTP
UPDATE users SET is_active = true WHERE email = 'user@example.com';

-- Count users by role
SELECT role, COUNT(*) FROM users GROUP BY role;

-- View recent registrations
SELECT email, username, created_at FROM users ORDER BY created_at DESC LIMIT 10;
```

### Database Stats
```sql
-- Count all records
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM pets) as pets,
  (SELECT COUNT(*) FROM medical_records) as medical_records,
  (SELECT COUNT(*) FROM vaccination_records) as vaccination_records,
  (SELECT COUNT(*) FROM appointments) as appointments;

-- View database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- List all tables
\dt

-- Show table structure
\d table_name
```

---

## Testing API Endpoints

### Health Check
```bash
curl https://your-backend.railway.app/
```

### Register User
```bash
curl -X POST "https://your-backend.railway.app/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

### Verify OTP
```bash
curl -X POST "https://your-backend.railway.app/api/auth/verify-otp" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### Login
```bash
curl -X POST "https://your-backend.railway.app/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

### Test Authenticated Endpoint
```bash
curl -X GET "https://your-backend.railway.app/api/users/me" \
  -H "Authorization: Bearer <your_token_here>"
```

---

## DNS Troubleshooting

### Check DNS Records
```bash
# Check A record
nslookup cityvetsanpedro.me

# Check CNAME record
nslookup www.cityvetsanpedro.me

# Detailed DNS lookup
dig cityvetsanpedro.me

# Check from different DNS servers
nslookup cityvetsanpedro.me 8.8.8.8
```

### Check SSL Certificate
```bash
# Verify SSL certificate
openssl s_client -connect cityvetsanpedro.me:443 -servername cityvetsanpedro.me

# Check certificate expiry
echo | openssl s_client -connect cityvetsanpedro.me:443 2>/dev/null | openssl x509 -noout -dates
```

---

## Common Issues & Solutions

### Issue: CORS Error

**Symptom**: Browser console shows CORS policy error

**Solution**:
```bash
# In Railway, set CORS_ORIGINS
railway variables set CORS_ORIGINS="https://cityvetsanpedro.me,https://www.cityvetsanpedro.me"

# Redeploy
railway up
```

### Issue: Database Connection Failed

**Symptom**: Backend logs show "could not connect to server"

**Solution**:
```bash
# Check DATABASE_URL is set
railway variables | grep DATABASE_URL

# Verify PostgreSQL is running
railway status

# Restart PostgreSQL service
# (Go to Railway dashboard → PostgreSQL service → Restart)
```

### Issue: Migration Failed

**Symptom**: Alembic upgrade fails with conflict

**Solution**:
```bash
# Check current migration version
railway run alembic current

# View migration history
railway run alembic history

# Force to specific version (careful!)
railway run alembic stamp head
```

### Issue: Email Not Sending

**Symptom**: OTP emails not received

**Solution**:
```bash
# Verify SMTP credentials
railway variables | grep SMTP

# Test Gmail App Password
# 1. Go to https://myaccount.google.com/apppasswords
# 2. Generate new App Password
# 3. Update in Railway:
railway variables set SMTP_PASS="your_new_app_password"
```

### Issue: Frontend Can't Reach API

**Symptom**: API calls return 404 or connection refused

**Solution**:
```bash
# Check environment variable
vercel env ls

# Update API URL
vercel env add REACT_APP_API_URL production

# Redeploy
vercel --prod
```

### Issue: High Memory Usage

**Symptom**: Railway shows high memory consumption

**Solution**:
```bash
# Check Railway metrics
railway logs | grep "Memory"

# Restart service
railway restart

# Consider upgrading Railway plan if persistent
```

---

## Environment Variables Reference

### Required Backend Variables (Railway)
```env
DATABASE_URL=postgresql://...                    # Auto-set by PostgreSQL service
SECRET_KEY=32+_character_random_string           # Generate new
SMTP_USER=your_email@gmail.com                   # Your Gmail
SMTP_PASS=xxxx_xxxx_xxxx_xxxx                   # Gmail App Password
ENVIRONMENT=production                           # Set to production
CORS_ORIGINS=https://cityvetsanpedro.me,...     # Frontend URLs
```

### Optional Backend Variables
```env
RESEND_API_KEY=your_resend_api_key              # Alternative email service
```

### Required Frontend Variables (Vercel)
```env
REACT_APP_API_URL=https://your-backend.railway.app    # Backend URL (no trailing slash)
```

---

## Monitoring URLs

### Railway
- **Dashboard**: https://railway.app/dashboard
- **Project**: https://railway.app/project/your-project-id
- **Logs**: Click service → "Logs" tab
- **Metrics**: Click service → "Metrics" tab

### Vercel
- **Dashboard**: https://vercel.com/dashboard
- **Project**: https://vercel.com/your-username/pawthos
- **Analytics**: Project → "Analytics" tab
- **Logs**: Project → "Deployments" → Click deployment → "Functions"

### Domain
- **Namecheap**: https://ap.www.namecheap.com/domains/list/
- **DNS Management**: Domain → "Advanced DNS"

---

## Quick Deployment Workflow

### Making Backend Changes
```bash
# 1. Make changes locally
# 2. Test locally
uvicorn main:app --reload

# 3. Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# 4. Railway auto-deploys
# 5. Monitor deployment
railway logs

# 6. If migrations needed
railway run alembic upgrade head
```

### Making Frontend Changes
```bash
# 1. Make changes locally
# 2. Test locally
npm start

# 3. Build and test
npm run build

# 4. Commit and push
git add .
git commit -m "Description of changes"
git push origin main

# 5. Vercel auto-deploys
# 6. Verify at https://cityvetsanpedro.me
```

---

## Emergency Procedures

### Complete System Down
1. Check Railway status: https://railway.app/status
2. Check Vercel status: https://vercel.com/status
3. Check backend logs: `railway logs`
4. Check frontend logs: Vercel dashboard
5. Verify DNS: `nslookup cityvetsanpedro.me`

### Database Corruption
```bash
# 1. Stop accepting new connections (pause frontend in Vercel)
# 2. Create backup
railway run pg_dump $DATABASE_URL > emergency_backup.sql

# 3. Check for issues
railway connect postgres
# Run: \d to list tables
# Run: SELECT * FROM users LIMIT 1; to test queries

# 4. If needed, restore from backup
railway run psql $DATABASE_URL < emergency_backup.sql
```

### Rollback Deployment
```bash
# Backend (Railway)
# Go to dashboard → Deployments → Click previous deployment → Redeploy

# Frontend (Vercel)
vercel rollback

# Or in dashboard:
# Go to Deployments → Click working deployment → "Promote to Production"
```

---

## Performance Optimization

### Backend
- Enable Railway's caching
- Optimize database queries (add indexes)
- Use database connection pooling
- Consider Redis for caching (add Redis service in Railway)

### Frontend
- Enable Vercel's edge caching
- Optimize images (use WebP format)
- Code splitting (React.lazy)
- Enable compression

### Database
```sql
-- Add indexes for common queries
CREATE INDEX idx_pets_owner_id ON pets(owner_id);
CREATE INDEX idx_medical_records_pet_id ON medical_records(pet_id);
CREATE INDEX idx_appointments_scheduled_date ON appointments(scheduled_date);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM pets WHERE owner_id = 1;
```

---

## Security Checklist

- [ ] SECRET_KEY is strong (32+ characters)
- [ ] Database password is strong
- [ ] CORS_ORIGINS properly restricted
- [ ] HTTPS enforced (automatic with Vercel/Railway)
- [ ] Environment variables not in code
- [ ] Regular backups scheduled
- [ ] Dependencies updated regularly
- [ ] SQL injection protection (using SQLAlchemy ORM)
- [ ] XSS protection in place
- [ ] Rate limiting considered

---

## Useful Links

### Documentation
- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- React Docs: https://react.dev
- Alembic Docs: https://alembic.sqlalchemy.org

### Tools
- Railway CLI: https://docs.railway.app/develop/cli
- Vercel CLI: https://vercel.com/docs/cli
- PostgreSQL Docs: https://www.postgresql.org/docs/
- Namecheap DNS: https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain

### Support
- Railway Support: support@railway.app
- Vercel Support: support@vercel.com
- Stack Overflow: https://stackoverflow.com

---

## Maintenance Schedule

### Daily
- [ ] Check Railway and Vercel for errors
- [ ] Monitor database size
- [ ] Review application logs

### Weekly
- [ ] Create manual database backup
- [ ] Review metrics (CPU, memory, bandwidth)
- [ ] Check for dependency updates
- [ ] Review user feedback

### Monthly
- [ ] Security audit
- [ ] Performance review
- [ ] Backup restoration test
- [ ] Documentation update
- [ ] Cost analysis

---

*Keep this reference handy during deployment and maintenance.*

