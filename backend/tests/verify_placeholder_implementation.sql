-- SQL Queries to Verify Placeholder Account Claiming Implementation

-- 1. Check if is_placeholder column exists
SELECT 
    COLUMN_NAME, 
    DATA_TYPE, 
    IS_NULLABLE, 
    COLUMN_DEFAULT
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'users' 
  AND COLUMN_NAME = 'is_placeholder';

-- Expected: One row with INTEGER type, NOT NULL, DEFAULT 0

-- 2. Count placeholder vs regular users
SELECT 
    is_placeholder,
    COUNT(*) as count,
    CASE 
        WHEN is_placeholder = 1 THEN 'Placeholder Accounts'
        WHEN is_placeholder = 0 THEN 'Real Accounts'
        ELSE 'Unknown'
    END as account_type
FROM users
GROUP BY is_placeholder;

-- 3. View all placeholder users
SELECT 
    id,
    name,
    email,
    phone_number,
    is_confirmed,
    is_placeholder,
    created_at
FROM users
WHERE is_placeholder = 1
ORDER BY created_at DESC;

-- 4. Check for users that should be marked as placeholders but aren't
SELECT 
    id,
    name,
    email,
    password_hash,
    is_placeholder
FROM users
WHERE email LIKE '%@placeholder.local'
  AND password_hash = 'PLACEHOLDER_NO_PASSWORD'
  AND is_placeholder != 1;

-- If any rows returned, run this update:
-- UPDATE users 
-- SET is_placeholder = 1 
-- WHERE email LIKE '%@placeholder.local' 
--   AND password_hash = 'PLACEHOLDER_NO_PASSWORD';

-- 5. View recently claimed accounts (placeholders that became real)
-- Note: We can't directly see "claimed" status, but we can infer from recent updates
SELECT 
    id,
    name,
    email,
    is_placeholder,
    is_confirmed,
    created_at,
    TIMESTAMPDIFF(MINUTE, created_at, NOW()) as minutes_since_creation
FROM users
WHERE is_placeholder = 0
  AND is_confirmed = 1
  AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY created_at DESC;

-- 6. Find potential duplicate users (same name, both non-placeholder)
SELECT 
    name,
    COUNT(*) as count,
    GROUP_CONCAT(id) as user_ids,
    GROUP_CONCAT(email) as emails
FROM users
WHERE is_placeholder = 0
GROUP BY name
HAVING COUNT(*) > 1;

-- 7. Check pet records linked to placeholder users
SELECT 
    u.id as user_id,
    u.name as owner_name,
    u.email,
    u.is_placeholder,
    COUNT(p.id) as pet_count,
    GROUP_CONCAT(p.name) as pet_names
FROM users u
LEFT JOIN pets p ON u.id = p.user_id
WHERE u.is_placeholder = 1
GROUP BY u.id
ORDER BY pet_count DESC;

-- 8. Check vaccination records linked to placeholder users
SELECT 
    u.id as user_id,
    u.name as owner_name,
    u.email,
    u.is_placeholder,
    COUNT(vr.id) as vaccination_count
FROM users u
LEFT JOIN vaccination_records vr ON u.id = vr.user_id
WHERE u.is_placeholder = 1
GROUP BY u.id
HAVING vaccination_count > 0
ORDER BY vaccination_count DESC;

-- 9. Verify indexes exist
SHOW INDEX FROM users WHERE Key_name IN ('idx_users_is_placeholder', 'idx_users_name');

-- 10. Test scenario: Create a test placeholder and verify
-- (Run these one by one)

-- Create test placeholder
-- INSERT INTO users (name, email, password_hash, phone_number, address, is_confirmed, is_placeholder)
-- VALUES ('Test Placeholder User', 'testplaceholder_123456@placeholder.local', 'PLACEHOLDER_NO_PASSWORD', 'Not Available', 'Not Available', 0, 1);

-- Verify it was created
-- SELECT * FROM users WHERE name = 'Test Placeholder User';

-- Clean up test
-- DELETE FROM users WHERE name = 'Test Placeholder User' AND email LIKE '%@placeholder.local';

