-- Migration: Add is_placeholder column to users table
-- This allows the system to distinguish between placeholder accounts (auto-created from pet records)
-- and real user accounts created through signup
-- PostgreSQL Version

BEGIN;

-- Add is_placeholder column with default value 0 (not a placeholder)
-- PostgreSQL syntax
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_placeholder') THEN
        ALTER TABLE users ADD COLUMN is_placeholder INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Mark existing users with placeholder emails as placeholder accounts
-- These are users with emails ending in @placeholder.local
UPDATE users 
SET is_placeholder = 1 
WHERE email LIKE '%@placeholder.local' 
  AND password_hash = 'PLACEHOLDER_NO_PASSWORD';

-- Add an index for faster lookups (IF NOT EXISTS available in PostgreSQL 9.5+)
CREATE INDEX IF NOT EXISTS idx_users_is_placeholder ON users(is_placeholder);

-- Add an index on name for faster placeholder user matching
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);

COMMIT;

