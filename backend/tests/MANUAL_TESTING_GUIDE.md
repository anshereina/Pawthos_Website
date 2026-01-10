# Manual Testing Guide: Placeholder Account Claiming

## Prerequisites
- Backend server running
- Database migration applied
- Access to both web admin panel and mobile app (or API testing tool)

## Test Scenario 1: Create Placeholder and Claim It

### Step 1: Create a Pet Record (as Admin/Staff)

**Using Web Admin Panel:**
1. Login to admin panel
2. Go to "Pet Management"
3. Add a new pet with these details:
   - Owner Name: `Maria Santos`
   - Pet Name: `Brownie`
   - Species: `Canine`
   - Other fields: (fill as needed)
4. Save the record

**Expected Result:**
- Pet created successfully
- System automatically creates a placeholder user for "Maria Santos"

### Step 2: Verify Placeholder User Created

**Using MySQL:**
```sql
SELECT id, name, email, is_placeholder, is_confirmed 
FROM users 
WHERE name = 'Maria Santos';
```

**Expected Output:**
```
id  | name          | email                        | is_placeholder | is_confirmed
----|---------------|------------------------------|----------------|-------------
123 | Maria Santos  | mariasantos_1736...@place... | 1              | 0
```

### Step 3: Create a Vaccination Record (Optional)

**Using Web Admin Panel:**
1. Go to "Vaccination Records"
2. Create a vaccination for Brownie (the pet from Step 1)
3. Save the record

**Expected Result:**
- Vaccination record links to the placeholder user (user_id = 123)

### Step 4: Sign Up as Pet Owner

**Using Mobile App (or API):**

**API Call:**
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Maria Santos",
    "email": "maria.santos@gmail.com",
    "password": "SecurePass123!",
    "phone_number": "09171234567",
    "address": "123 Main St, Quezon City"
  }'
```

**Or Using Mobile App:**
1. Open signup screen
2. Enter:
   - Name: `Maria Santos`
   - Email: `maria.santos@gmail.com`
   - Password: `SecurePass123!`
   - Phone: `09171234567`
3. Submit

### Step 5: Verify Account Was Claimed

**Check Backend Logs:**
Look for these messages:
```
🔄 Claiming placeholder account for Maria Santos with email maria.santos@gmail.com
✅ Placeholder account claimed successfully: user_id=123
```

**Using MySQL:**
```sql
SELECT id, name, email, is_placeholder, is_confirmed 
FROM users 
WHERE name = 'Maria Santos';
```

**Expected Output:**
```
id  | name          | email                     | is_placeholder | is_confirmed
----|---------------|---------------------------|----------------|-------------
123 | Maria Santos  | maria.santos@gmail.com    | 0              | 1
```

**Key Points:**
- ✅ Same `id` (123) - account was claimed, not created new
- ✅ Real email replaced placeholder email
- ✅ `is_placeholder` changed from 1 to 0
- ✅ `is_confirmed` changed from 0 to 1

### Step 6: Login with New Account

**Using Mobile App (or API):**

**API Call:**
```bash
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "maria.santos@gmail.com",
    "password": "SecurePass123!"
  }'
```

**Expected Result:**
- Login successful
- Receives access token
- User ID in response is 123 (same as placeholder)

### Step 7: Verify Pet Records Linked

**After login, fetch user's pets:**

**API Call:**
```bash
curl -X GET http://localhost:8000/pets/ \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Result:**
- Should see "Brownie" in the list
- Brownie's `user_id` is 123

**Using MySQL:**
```sql
SELECT p.id, p.name, p.owner_name, p.user_id, u.email
FROM pets p
JOIN users u ON p.user_id = u.id
WHERE u.name = 'Maria Santos';
```

**Expected Output:**
```
id  | name    | owner_name    | user_id | email
----|---------|---------------|---------|------------------------
456 | Brownie | Maria Santos  | 123     | maria.santos@gmail.com
```

---

## Test Scenario 2: New User (No Placeholder)

### Step 1: Sign Up with New Name

**Using Mobile App (or API):**
```bash
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Dela Cruz",
    "email": "juan.delacruz@gmail.com",
    "password": "Password123!",
    "phone_number": "09181234567"
  }'
```

### Step 2: Verify New User Created

**Check Backend Logs:**
```
➕ Creating new user account for Juan Dela Cruz with email juan.delacruz@gmail.com
✅ New user account created successfully: user_id=124
```

**Using MySQL:**
```sql
SELECT id, name, email, is_placeholder, is_confirmed 
FROM users 
WHERE name = 'Juan Dela Cruz';
```

**Expected Output:**
```
id  | name           | email                     | is_placeholder | is_confirmed
----|----------------|---------------------------|----------------|-------------
124 | Juan Dela Cruz | juan.delacruz@gmail.com   | 0              | 1
```

**Key Points:**
- ✅ New user ID (124, not claiming any placeholder)
- ✅ `is_placeholder` = 0 (not a placeholder)
- ✅ `is_confirmed` = 1 (confirmed)

---

## Common Issues & Solutions

### Issue 1: Duplicate Users Created
**Symptom:** Both placeholder and new user exist

**Possible Causes:**
- Name doesn't match exactly (case-sensitive)
- Migration not applied
- `is_placeholder` column missing

**Solution:**
```sql
-- Check if column exists
SHOW COLUMNS FROM users LIKE 'is_placeholder';

-- If missing, run migration
ALTER TABLE users ADD COLUMN is_placeholder INTEGER NOT NULL DEFAULT 0;
```

### Issue 2: Can't Login After Signup
**Symptom:** Login fails with claimed account

**Possible Causes:**
- Password not properly hashed during claim
- Account not marked as confirmed

**Solution:**
```sql
-- Check account status
SELECT id, email, is_confirmed, is_placeholder 
FROM users 
WHERE email = 'problematic@email.com';

-- If is_confirmed = 0, manually confirm:
UPDATE users SET is_confirmed = 1 WHERE email = 'problematic@email.com';
```

### Issue 3: Pets Not Showing Up
**Symptom:** User can't see their pets after claiming

**Possible Causes:**
- Pet `user_id` not linked to placeholder
- Wrong user_id being used

**Solution:**
```sql
-- Check pet linkage
SELECT p.*, u.name as user_name, u.email 
FROM pets p 
LEFT JOIN users u ON p.user_id = u.id 
WHERE p.owner_name = 'Owner Name';

-- If user_id is NULL or wrong, update:
UPDATE pets 
SET user_id = (SELECT id FROM users WHERE name = 'Owner Name' AND is_placeholder = 0)
WHERE owner_name = 'Owner Name' AND user_id IS NULL;
```

---

## Quick Verification Checklist

Before declaring success, verify:

- [ ] Migration applied (`is_placeholder` column exists)
- [ ] Placeholder user created with vaccination record
- [ ] Signup with same name claims placeholder (check logs)
- [ ] Same user_id maintained after claiming
- [ ] Email updated from placeholder to real email
- [ ] Login works with new credentials
- [ ] Pet records visible in mobile app
- [ ] New users (without placeholder) still work normally
- [ ] No duplicate users for same person

---

## Reset Test Data

To clean up test data:

```sql
-- Delete test users and their records
DELETE FROM vaccination_records WHERE user_id IN (SELECT id FROM users WHERE name LIKE 'Maria Santos%');
DELETE FROM pets WHERE owner_name LIKE 'Maria Santos%';
DELETE FROM users WHERE name LIKE 'Maria Santos%';

DELETE FROM users WHERE name LIKE 'Juan Dela Cruz%';

-- Verify cleanup
SELECT * FROM users WHERE name IN ('Maria Santos', 'Juan Dela Cruz');
```

---

## Success Criteria

✅ **Test Passed If:**
1. Placeholder user created automatically ✓
2. Real signup claims existing placeholder ✓
3. No duplicate users created ✓
4. Same user_id maintained ✓
5. Pet records remain linked ✓
6. Login works with new email ✓
7. New users work normally ✓

🎉 **Placeholder Account Claiming Working!**

