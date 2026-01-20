-- Admin Migration
-- Add admin role to users table

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin TINYINT(1) DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_banned TINYINT(1) DEFAULT 0;

-- Set first user as admin (change ID if needed)
UPDATE users SET is_admin = 1 WHERE id = 1;
