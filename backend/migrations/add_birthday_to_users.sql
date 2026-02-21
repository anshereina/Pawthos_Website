-- Migration: Add birthday column to users table
-- Date: 2026-01-15
-- Description: Adds a nullable birthday column (DATE type) to the users table
--              to store user birthdays for auto-filling in pet registration

-- Add birthday column
ALTER TABLE users 
ADD COLUMN birthday DATE NULL;

-- Add comment to column
COMMENT ON COLUMN users.birthday IS 'User birthday for auto-filling in pet registration forms';

-- Rollback script (if needed):
-- ALTER TABLE users DROP COLUMN birthday;





