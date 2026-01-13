# Quick Setup Guide: Placeholder Account Claiming

## What Changed?

Your system now **prevents duplicate users** when pet owners sign up for the mobile app after clinic staff has already created records for them.

## Setup Steps

### 1. Apply Database Migration

```bash
cd backend
mysql -u your_username -p your_database < migrations/add_is_placeholder_to_users.sql
```

Or run manually in MySQL:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_placeholder INTEGER NOT NULL DEFAULT 0;

UPDATE users 
SET is_placeholder = 1 
WHERE email LIKE '%@placeholder.local' 
  AND password_hash = 'PLACEHOLDER_NO_PASSWORD';

CREATE INDEX IF NOT EXISTS idx_users_is_placeholder ON users(is_placeholder);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
```

### 2. Restart Backend Server

```bash
# Stop current server (Ctrl+C)
# Start again
uvicorn main:app --reload
```

### 3. Verify Implementation (Optional)

Run the SQL verification queries:
```bash
mysql -u your_username -p your_database < tests/verify_placeholder_implementation.sql
```

### 4. Test the Flow (Optional)

```bash
cd backend
python tests/test_placeholder_claiming.py
```

**Note:** Update the admin credentials in the test script first!

## How It Works Now

### Before (Problem):
```
1. Staff creates pet record for "John Doe"
   → System creates: johndoe_123@placeholder.local (user_id: 1)

2. Real John Doe signs up with john@gmail.com
   → System creates: NEW user (user_id: 2)

❌ Result: 2 users for same person, pets linked to wrong user
```

### After (Solution):
```
1. Staff creates pet record for "John Doe"
   → System creates: johndoe_123@placeholder.local (user_id: 1, is_placeholder=1)

2. Real John Doe signs up with john@gmail.com
   → System UPDATES: user_id 1 with john@gmail.com, is_placeholder=0

✅ Result: 1 user, all pets automatically linked!
```

## No Code Changes Needed in Frontend!

The mobile app continues to work exactly as before. The claiming happens automatically on the backend during registration.

## Monitoring

Check backend logs for these messages:
- `🔄 Claiming placeholder account for [name]` - Account being claimed
- `✅ Placeholder account claimed successfully` - Successful claim
- `➕ Creating new user account` - Normal new user (no placeholder found)

## Questions?

See full documentation: `backend/docs/PLACEHOLDER_ACCOUNT_CLAIMING.md`





