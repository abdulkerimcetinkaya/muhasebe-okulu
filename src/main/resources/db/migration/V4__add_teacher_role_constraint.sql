-- Add TEACHER role to users_role_check constraint
-- Created: 2025-01-27

-- Drop existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add new constraint with TEACHER role
ALTER TABLE users ADD CONSTRAINT users_role_check 
CHECK (role IN ('USER', 'TEACHER', 'ADMIN'));



