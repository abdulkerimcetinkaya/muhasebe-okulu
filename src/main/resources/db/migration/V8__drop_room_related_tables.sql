-- Drop Room-related tables and columns
-- This migration removes all Teacher and Room module database structures

-- Step 1: Drop indexes from room_performances table (if exists)
DROP INDEX IF EXISTS idx_room_performances_room_id;
DROP INDEX IF EXISTS idx_room_performances_user_id;
DROP INDEX IF EXISTS idx_room_performances_problem_id;
DROP INDEX IF EXISTS idx_room_performances_room_user;
DROP INDEX IF EXISTS idx_room_performances_solved;
DROP INDEX IF EXISTS idx_room_performances_solved_at;
DROP INDEX IF EXISTS idx_room_performances_leaderboard;
DROP INDEX IF EXISTS idx_room_performances_manual_pending;

-- Step 2: Drop is_private column and indexes from problems table (room-specific feature)
DROP INDEX IF EXISTS idx_problems_is_private;
DROP INDEX IF EXISTS idx_problems_created_by_is_private;
ALTER TABLE problems DROP COLUMN IF EXISTS is_private CASCADE;

-- Step 3: Drop room_id column from user_answers table
ALTER TABLE user_answers DROP COLUMN IF EXISTS room_id CASCADE;

-- Step 4: Drop room_performances table
DROP TABLE IF EXISTS room_performances CASCADE;

-- Step 5: Drop room_problems table
DROP TABLE IF EXISTS room_problems CASCADE;

-- Step 6: Drop room_members table
DROP TABLE IF EXISTS room_members CASCADE;

-- Step 7: Drop rooms table
DROP TABLE IF EXISTS rooms CASCADE;

-- Comments for documentation
COMMENT ON SCHEMA public IS 'Room and Teacher modules have been archived - tables dropped in V8 migration';
