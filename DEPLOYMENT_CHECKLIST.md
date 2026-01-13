# Deployment Checklist - Placeholder Account Claiming

## Pre-Deployment

### 1. Backup Database
- [ ] Create full database backup
- [ ] Test backup restoration (optional but recommended)
```bash
mysqldump -u username -p pawthos_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Review Changes
- [ ] All 7 backend files modified correctly
- [ ] No linter errors in modified files
- [ ] Migration script reviewed and understood

### 3. Test Environment (Recommended)
- [ ] Applied changes to test/dev environment first
- [ ] Ran manual tests successfully
- [ ] Verified no breaking changes

---

## Deployment Steps

### Step 1: Apply Database Migration ⚠️ CRITICAL
```bash
mysql -u username -p pawthos_db < backend/migrations/add_is_placeholder_to_users.sql
```

**Verification:**
```sql
-- Check column exists
SHOW COLUMNS FROM users LIKE 'is_placeholder';

-- Check indexes created
SHOW INDEX FROM users WHERE Key_name IN ('idx_users_is_placeholder', 'idx_users_name');

-- Check existing placeholders marked
SELECT COUNT(*) FROM users WHERE is_placeholder = 1;
```

- [ ] Migration executed successfully
- [ ] `is_placeholder` column exists
- [ ] Indexes created
- [ ] Existing placeholder users marked (if any)

### Step 2: Deploy Backend Code

```bash
cd backend

# Pull latest code (if using git)
git pull origin main

# Restart backend server
# (Method depends on your setup - systemd, pm2, docker, etc.)

# Example for development:
# uvicorn main:app --reload

# Example for production with systemd:
# sudo systemctl restart pawthos-backend
```

- [ ] Backend code updated
- [ ] Backend server restarted
- [ ] Server starts without errors
- [ ] No import errors in logs

### Step 3: Verify Deployment

**Check Backend Health:**
```bash
# Test API is responding
curl http://localhost:8000/docs

# Or whatever your backend URL is
curl https://your-domain.com/api/docs
```

- [ ] API responding correctly
- [ ] Swagger docs accessible
- [ ] No errors in startup logs

---

## Post-Deployment Testing

### Test 1: Create Placeholder (via Admin)
- [ ] Login to admin panel
- [ ] Create a pet with test owner name
- [ ] Verify placeholder user created in database
```sql
SELECT * FROM users WHERE name = 'Test Owner' AND is_placeholder = 1;
```

### Test 2: Claim Placeholder (via Mobile/API)
- [ ] Sign up with same name as test owner
- [ ] Use different email than placeholder
- [ ] Verify account claimed (same user_id)
```sql
SELECT * FROM users WHERE name = 'Test Owner';
-- Should show: is_placeholder=0, real email
```

### Test 3: Login with Claimed Account
- [ ] Login with new email and password
- [ ] Verify access token received
- [ ] Verify user ID matches claimed account

### Test 4: Verify Records Linked
- [ ] Fetch user's pets via API
- [ ] Verify test pet appears
- [ ] Check vaccination records linked

### Test 5: New User Without Placeholder
- [ ] Sign up with completely new name
- [ ] Verify new account created (not claimed)
- [ ] Verify login works

---

## Monitoring (First 24 Hours)

### Check Logs Regularly
Watch for these patterns:

**Good signs:**
```
🔄 Claiming placeholder account for [name]
✅ Placeholder account claimed successfully
➕ Creating new user account for [name]
✅ New user account created successfully
```

**Bad signs (investigate):**
```
❌ Any error messages related to users/registration
⚠️  Duplicate key violations
⚠️  Foreign key constraint errors
```

### Database Queries to Run

**Every few hours, check:**

```sql
-- Count placeholders vs real users
SELECT 
    is_placeholder,
    COUNT(*) as count
FROM users 
GROUP BY is_placeholder;

-- Check for potential duplicates
SELECT 
    name, 
    COUNT(*) as count 
FROM users 
WHERE is_placeholder = 0
GROUP BY name 
HAVING count > 1;

-- Monitor recent signups
SELECT 
    id, 
    name, 
    email, 
    is_placeholder, 
    created_at
FROM users 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY created_at DESC;
```

---

## Rollback Plan (If Needed)

### If Critical Issues Arise:

**Step 1: Revert Code**
```bash
cd backend
git revert [commit-hash]  # or checkout previous version
sudo systemctl restart pawthos-backend
```

**Step 2: Rollback Database (Optional)**
```sql
-- Remove column (will lose is_placeholder data)
ALTER TABLE users DROP COLUMN is_placeholder;

-- Remove indexes
DROP INDEX idx_users_is_placeholder ON users;
DROP INDEX idx_users_name ON users;
```

**Step 3: Restore from Backup (If Necessary)**
```bash
mysql -u username -p pawthos_db < backup_YYYYMMDD_HHMMSS.sql
```

---

## Success Criteria

✅ **Deployment is successful if:**

1. **Technical:**
   - [ ] Migration applied without errors
   - [ ] Backend starts without errors
   - [ ] All API endpoints responding
   - [ ] No linter errors
   - [ ] Logs show expected messages

2. **Functional:**
   - [ ] Placeholder users created with is_placeholder=1
   - [ ] Signup claims placeholders correctly
   - [ ] Same user_id maintained after claim
   - [ ] Login works with claimed accounts
   - [ ] Pet records remain linked
   - [ ] New users (no placeholder) work normally

3. **Data Integrity:**
   - [ ] No duplicate users created
   - [ ] No foreign key violations
   - [ ] No lost pet records
   - [ ] No orphaned vaccination records

---

## Known Limitations

### Name Matching
- **Case-sensitive:** "John Doe" ≠ "john doe"
- **Exact match required:** "John Doe" ≠ "John A. Doe"
- **Solution:** Users can contact support for manual merge

### Multiple Placeholders Same Name
- **If exists:** System claims first found (oldest)
- **Others remain:** Can be cleaned up manually
- **Future:** Implement fuzzy matching or manual merge tool

### Phone Number Changes
- **If changed:** User's new phone replaces placeholder phone
- **If blank:** Placeholder phone remains
- **No issue:** Just data update

---

## Support Information

### Where to Look for Help

1. **Full Documentation:**
   - `backend/docs/PLACEHOLDER_ACCOUNT_CLAIMING.md`

2. **Testing Guides:**
   - `backend/tests/MANUAL_TESTING_GUIDE.md`
   - `backend/tests/test_placeholder_claiming.py`

3. **Setup Guide:**
   - `PLACEHOLDER_CLAIMING_SETUP.md`

4. **Visual Diagrams:**
   - `VISUAL_FLOW_DIAGRAM.md`

5. **Summary:**
   - `IMPLEMENTATION_SUMMARY.md`

### Common Issues Reference

See "Common Issues & Solutions" section in:
- `backend/tests/MANUAL_TESTING_GUIDE.md`

---

## Final Sign-Off

**Deployment Completed By:** ___________________

**Date & Time:** ___________________

**Environment:** 
- [ ] Development
- [ ] Staging
- [ ] Production

**Tests Passed:**
- [ ] Create placeholder
- [ ] Claim placeholder
- [ ] Login with claimed account
- [ ] Records linked correctly
- [ ] New user signup

**Issues Encountered:** _________________________

**Resolution:** ___________________________________

**Status:** 
- [ ] ✅ Successful - No issues
- [ ] ⚠️ Successful - Minor issues (documented)
- [ ] ❌ Failed - Rolled back

**Notes:** ________________________________________

---

## Next Steps (Optional)

### After Stable for 1 Week:

1. **Cleanup Old Placeholders (Optional)**
```sql
-- Find old unclaimed placeholders (>6 months, no pets)
SELECT u.* 
FROM users u
LEFT JOIN pets p ON u.id = p.user_id
WHERE u.is_placeholder = 1 
  AND u.created_at < DATE_SUB(NOW(), INTERVAL 6 MONTH)
  AND p.id IS NULL;

-- Archive or delete after review
```

2. **Performance Review**
- Check query performance on name lookups
- Verify indexes being used
- Monitor database load

3. **Feature Enhancements**
- Plan fuzzy name matching
- Design manual merge tool
- Consider notification system

---

## 🎉 Congratulations!

You've successfully implemented a robust solution to prevent duplicate user accounts while maintaining data integrity. Your Pawthos system is now more reliable and user-friendly!

**Questions or issues?** Refer to the documentation files listed above.





