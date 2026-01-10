# Placeholder Account Claiming System

## Overview

This system prevents duplicate user accounts when pet owners who were automatically added to the system through clinic records (vaccinations, appointments, etc.) later sign up for the mobile app.

## The Problem

Previously, when clinic staff created records for pets, the system would automatically create "placeholder" user accounts with:
- Fake email: `{name}_{timestamp}@placeholder.local`
- Fake password: `"PLACEHOLDER_NO_PASSWORD"`
- Owner's name from the pet record

When the real pet owner later signed up with their actual email, this created a **duplicate user account**, causing:
- Two separate user IDs for the same person
- Pet records linked to placeholder account, not the real account
- Confusion and data fragmentation

## The Solution: Account Claiming

### 1. **Marking Placeholder Accounts**

All auto-created user accounts are now marked with `is_placeholder = 1`:

```sql
-- New column in users table
is_placeholder INTEGER NOT NULL DEFAULT 0
```

### 2. **Automatic Account Claiming**

When a user signs up through the mobile app:

1. System checks if their name matches an existing placeholder account
2. If match found:
   - **Claims** the placeholder account by updating its credentials
   - Updates: email, password, phone, address
   - Sets `is_placeholder = 0` and `is_confirmed = 1`
   - **All existing pet records remain linked** to the same user_id
3. If no match:
   - Creates a new user account normally

### 3. **Flow Diagram**

```
Pet Owner visits clinic
    ↓
Staff creates pet record
    ↓
System auto-creates placeholder user
    - Email: johndoe_1736505200@placeholder.local
    - is_placeholder = 1
    - user_id = 123
    ↓
Pet records link to user_id 123
    ↓
[TIME PASSES]
    ↓
Real John Doe signs up with john.doe@gmail.com
    ↓
System finds placeholder with name "John Doe"
    ↓
System CLAIMS placeholder account
    - Updates email to: john.doe@gmail.com
    - Sets real password hash
    - is_placeholder = 0
    - is_confirmed = 1
    - user_id STAYS 123
    ↓
✅ ONE user account with ALL pet records
```

## Implementation Details

### Database Migration

Run the migration script to add the new column:

```bash
# From backend directory
mysql -u your_user -p your_database < migrations/add_is_placeholder_to_users.sql
```

Or manually execute:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_placeholder INTEGER NOT NULL DEFAULT 0;
UPDATE users SET is_placeholder = 1 WHERE email LIKE '%@placeholder.local' AND password_hash = 'PLACEHOLDER_NO_PASSWORD';
CREATE INDEX IF NOT EXISTS idx_users_is_placeholder ON users(is_placeholder);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
```

### Modified Endpoints

#### 1. `POST /api/register` (Mobile Registration)
- Now checks for placeholder accounts by name
- Claims account if found
- Creates new account if not found

#### 2. Auto-Create Functions
- `find_or_create_user_for_pet()` in `vaccination_records.py`
- `find_or_create_user()` in `vaccination_drives.py`
- Both now set `is_placeholder = 1`

### New Helper Functions in `auth.py`

```python
# Find placeholder account by owner name
def find_placeholder_user_by_name(db: Session, name: str):
    return db.query(models.User).filter(
        models.User.name == name,
        models.User.is_placeholder == 1
    ).first()

# Claim a placeholder account
def claim_placeholder_account(db: Session, placeholder_user, email, password, ...):
    placeholder_user.email = email
    placeholder_user.password_hash = get_password_hash(password)
    placeholder_user.is_placeholder = 0
    placeholder_user.is_confirmed = 1
    # ... update other fields
    db.commit()
    return placeholder_user
```

## Benefits

✅ **No Duplicate Users**: One person = one account
✅ **Seamless Integration**: Pet records automatically linked
✅ **Backward Compatible**: Existing placeholder accounts can be claimed
✅ **Better UX**: Users see all their pets immediately after signup
✅ **Data Integrity**: Single source of truth for user information

## Edge Cases Handled

### Case 1: Name Mismatch
If the person signs up with a slightly different name than what staff entered:
- System creates a new account (safer than wrong match)
- Admin can manually merge accounts if needed (future feature)

### Case 2: Multiple Placeholders Same Name
- System finds the first match (by creation date)
- Claims that one
- Other placeholders remain (can be cleaned up manually)

### Case 3: No Placeholder Exists
- Normal signup flow
- Creates new confirmed account

## Testing

### Manual Test Scenario

1. **Create placeholder via vaccination record:**
   ```bash
   # POST /vaccination_records/
   # With owner_name: "Jane Smith"
   # System creates placeholder: janesmith_1736505200@placeholder.local
   ```

2. **Verify placeholder created:**
   ```sql
   SELECT * FROM users WHERE name = 'Jane Smith' AND is_placeholder = 1;
   ```

3. **Sign up with real credentials:**
   ```bash
   # POST /api/register
   # name: "Jane Smith"
   # email: "jane.smith@gmail.com"
   # password: "securepass123"
   ```

4. **Verify account claimed:**
   ```sql
   SELECT * FROM users WHERE name = 'Jane Smith';
   -- Should show:
   -- email: jane.smith@gmail.com
   -- is_placeholder: 0
   -- is_confirmed: 1
   -- Same user_id as before
   ```

5. **Check pet records still linked:**
   ```sql
   SELECT * FROM vaccination_records WHERE user_id = [user_id_from_step4];
   -- Should show vaccination records created in step 1
   ```

## Future Enhancements

- **Fuzzy Name Matching**: Match similar names (e.g., "John Doe" vs "John A. Doe")
- **Manual Account Merging**: Admin interface to merge duplicate accounts
- **Notification System**: Notify users when claiming accounts with existing pet records
- **Email Verification**: Option to send confirmation email when claiming placeholder

## Migration Checklist

- [x] Add `is_placeholder` column to User model
- [x] Create and run database migration
- [x] Update `find_or_create_user` functions
- [x] Add claim helper functions to `auth.py`
- [x] Update mobile registration endpoint
- [x] Update web registration endpoint
- [ ] Run database migration on production
- [ ] Monitor logs for successful claims
- [ ] Clean up old placeholder accounts (optional)

## Support

If you encounter issues:
1. Check backend logs for `🔄 Claiming placeholder account` messages
2. Verify database migration ran successfully
3. Check `is_placeholder` column exists and has correct values
4. Review placeholder account criteria (name match, is_placeholder=1)

