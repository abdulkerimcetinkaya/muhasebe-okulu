-- ============================================
-- V18: Level System Implementation
-- ============================================
-- Adds progressive difficulty level system (1-10)
-- Adds placement test tracking
-- Adds category-based performance tracking
-- ============================================

-- ============================================
-- 1. USER TABLE: Add level-related fields
-- ============================================
ALTER TABLE users
ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1 CHECK (current_level >= 1 AND current_level <= 10),
ADD COLUMN IF NOT EXISTS level_points INTEGER DEFAULT 0 CHECK (level_points >= 0),
ADD COLUMN IF NOT EXISTS placement_test_completed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS placement_test_score INTEGER CHECK (placement_test_score >= 0 AND placement_test_score <= 7),
ADD COLUMN IF NOT EXISTS placement_test_date TIMESTAMP;

-- Add comments for documentation
COMMENT ON COLUMN users.current_level IS 'User current level (1-10), determined by performance';
COMMENT ON COLUMN users.level_points IS 'Points accumulated in current level for progression';
COMMENT ON COLUMN users.placement_test_completed IS 'Whether user completed initial placement test';
COMMENT ON COLUMN users.placement_test_score IS 'Score from placement test (0-7 questions)';
COMMENT ON COLUMN users.placement_test_date IS 'When placement test was completed';

-- ============================================
-- 2. PROBLEM TABLE: Add level and category
-- ============================================
ALTER TABLE problems
ADD COLUMN IF NOT EXISTS level INTEGER CHECK (level >= 1 AND level <= 10),
ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Create index for faster level-based queries
CREATE INDEX IF NOT EXISTS idx_problems_level ON problems(level);
CREATE INDEX IF NOT EXISTS idx_problems_category ON problems(category);

COMMENT ON COLUMN problems.level IS 'Problem difficulty level (1-10), set by admin';
COMMENT ON COLUMN problems.category IS 'Problem category (e.g., Kasa İşlemleri, Banka İşlemleri)';

-- ============================================
-- 3. SOLVED_PROBLEMS TABLE: Add attempt tracking
-- ============================================
ALTER TABLE solved_problems
ADD COLUMN IF NOT EXISTS attempt_count INTEGER DEFAULT 1 CHECK (attempt_count >= 1);

COMMENT ON COLUMN solved_problems.attempt_count IS 'Number of attempts before solving correctly';

-- ============================================
-- 4. USER_CATEGORY_PERFORMANCE TABLE: Performance tracking
-- ============================================
CREATE TABLE IF NOT EXISTS user_category_performance (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL,
    total_attempts INTEGER DEFAULT 0 CHECK (total_attempts >= 0),
    success_count INTEGER DEFAULT 0 CHECK (success_count >= 0),
    success_rate DOUBLE PRECISION DEFAULT 0.0 CHECK (success_rate >= 0 AND success_rate <= 100),
    average_attempts DOUBLE PRECISION DEFAULT 0.0 CHECK (average_attempts >= 0),
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_category_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_category UNIQUE(user_id, category)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_category_user_id ON user_category_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_user_category_category ON user_category_performance(category);

COMMENT ON TABLE user_category_performance IS 'Tracks user performance per problem category';
COMMENT ON COLUMN user_category_performance.total_attempts IS 'Total problems attempted in this category';
COMMENT ON COLUMN user_category_performance.success_count IS 'Problems solved correctly in this category';
COMMENT ON COLUMN user_category_performance.success_rate IS 'Success percentage (0-100)';
COMMENT ON COLUMN user_category_performance.average_attempts IS 'Average attempts needed to solve problems';

-- ============================================
-- 5. DATA MIGRATION: Initialize existing data
-- ============================================

-- Set existing users to level 1 with placement test completed (skip for existing users)
UPDATE users
SET
    current_level = CASE
        WHEN solved_count >= 50 THEN 7
        WHEN solved_count >= 30 THEN 5
        WHEN solved_count >= 15 THEN 3
        ELSE 1
    END,
    level_points = 0,
    placement_test_completed = TRUE,
    placement_test_score = NULL  -- NULL means test was skipped
WHERE placement_test_completed IS NULL OR placement_test_completed = FALSE;

-- Distribute existing problems across levels based on current difficulty
-- EASY (1-3), MEDIUM (4-7), HARD (8-10)
UPDATE problems
SET level = CASE
    WHEN difficulty = 'EASY' THEN
        CASE (id % 3)
            WHEN 0 THEN 1
            WHEN 1 THEN 2
            ELSE 3
        END
    WHEN difficulty = 'MEDIUM' THEN
        CASE (id % 4)
            WHEN 0 THEN 4
            WHEN 1 THEN 5
            WHEN 2 THEN 6
            ELSE 7
        END
    WHEN difficulty = 'HARD' THEN
        CASE (id % 3)
            WHEN 0 THEN 8
            WHEN 1 THEN 9
            ELSE 10
        END
    ELSE 5  -- Default to level 5 if difficulty is NULL
END
WHERE level IS NULL;

-- Set default attempt_count for existing solved problems
UPDATE solved_problems
SET attempt_count = 1
WHERE attempt_count IS NULL;

-- ============================================
-- 6. VALIDATION QUERIES (for testing)
-- ============================================
-- Uncomment to verify migration success:
-- SELECT current_level, COUNT(*) FROM users GROUP BY current_level ORDER BY current_level;
-- SELECT level, difficulty, COUNT(*) FROM problems GROUP BY level, difficulty ORDER BY level;
-- SELECT COUNT(*) FROM user_category_performance;
