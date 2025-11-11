-- ============================================
-- PRODUCTION-ONLY: Concurrent Index Creation
-- ============================================
--
-- Purpose: Zero-downtime index creation for production deployment
-- Usage: Run this script manually AFTER deploying migrations to production
--
-- IMPORTANT:
-- - Do NOT run this through Flyway (it will fail due to transaction conflicts)
-- - Run this script using psql or pgAdmin directly
-- - Each CREATE INDEX CONCURRENTLY must run in its own transaction
-- - Monitor index creation progress: SELECT * FROM pg_stat_progress_create_index;
--
-- Command:
--   psql -U postgres -d muhasebe-okulu -f create_indexes_concurrent.sql
--
-- ============================================

-- Connection info will be printed
\echo '==================================================='
\echo 'Creating indexes with CONCURRENTLY for zero downtime'
\echo 'Database: muhasebe-okulu'
\echo '==================================================='

-- ============================================
-- From V2: Performance Indexes
-- ============================================

\echo 'Creating index: idx_problems_created_at_desc'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_created_at_desc ON problems(created_at DESC);

\echo 'Creating index: idx_correct_entries_problem_id'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_correct_entries_problem_id ON correct_entries(problem_id);

\echo 'Creating index: idx_problems_difficulty'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);

\echo 'Creating index: idx_solved_problems_problem_id'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solved_problems_problem_id ON solved_problems(problem_id);

\echo 'Creating index: idx_solved_problems_user_id'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solved_problems_user_id ON solved_problems(user_id);

\echo 'Creating index: idx_solved_problems_solved_at'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solved_problems_solved_at ON solved_problems(solved_at DESC);

\echo 'Creating index: idx_user_answers_problem_id'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_answers_problem_id ON user_answers(problem_id);

\echo 'Creating index: idx_problems_list'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_list ON problems(created_at DESC, difficulty, id);

\echo 'Creating index: idx_problems_easy'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_easy ON problems(created_at DESC)
WHERE difficulty = 'EASY';

\echo 'Creating index: idx_problems_medium'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_medium ON problems(created_at DESC)
WHERE difficulty = 'MEDIUM';

\echo 'Creating index: idx_problems_hard'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_hard ON problems(created_at DESC)
WHERE difficulty = 'HARD';

\echo 'Creating index: idx_problems_title_search'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problems_title_search ON problems USING gin(to_tsvector('turkish', title));

-- ============================================
-- From V3: Materialized View Indexes
-- ============================================

\echo 'Creating index: idx_problem_stats_created_at'
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problem_stats_created_at ON problem_stats(created_at DESC);

-- ============================================
-- Completion
-- ============================================

\echo '==================================================='
\echo 'All indexes created successfully!'
\echo 'Production deployment complete.'
\echo '==================================================='
