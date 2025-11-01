-- Performance optimization indexes for problems loading
-- Created: 2025-01-27

-- 1. En kritik indexler (hemen etkili)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_created_at_desc ON problems(created_at DESC);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_correct_entries_problem_id ON correct_entries(problem_id);

-- 2. İkinci seviye indexler
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solved_problems_problem_id ON solved_problems(problem_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solved_problems_user_id ON solved_problems(user_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solved_problems_solved_at ON solved_problems(solved_at DESC);

-- 3. UserAnswer tablosu için
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_answers_problem_id ON user_answers(problem_id);

-- 4. Composite indexler (çoklu sütun)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_list ON problems(created_at DESC, difficulty, id);

-- 5. Partial indexler (koşullu)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_easy ON problems(created_at DESC) 
WHERE difficulty = 'EASY';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_medium ON problems(created_at DESC) 
WHERE difficulty = 'MEDIUM';

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_hard ON problems(created_at DESC) 
WHERE difficulty = 'HARD';

-- 6. Arama için text search index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_title_search ON problems USING gin(to_tsvector('turkish', title));







