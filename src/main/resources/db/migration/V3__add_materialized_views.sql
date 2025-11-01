-- Materialized View for Problem Statistics
-- This will dramatically improve admin panel performance

-- 1. Problem istatistikleri için materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS problem_stats AS
SELECT 
    p.id,
    p.title,
    p.difficulty,
    p.created_at,
    COUNT(ce.id) as correct_entries_count,
    COUNT(sp.id) as solved_count,
    COUNT(DISTINCT sp.user_id) as unique_solvers
FROM problems p
LEFT JOIN correct_entries ce ON p.id = ce.problem_id
LEFT JOIN solved_problems sp ON p.id = sp.problem_id
GROUP BY p.id, p.title, p.difficulty, p.created_at;

-- 2. Materialized view için indexler
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_problem_stats_created_at ON problem_stats(created_at DESC);

-- 3. Admin dashboard için materialized view
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_dashboard_stats AS
SELECT 
    COUNT(DISTINCT u.id) as total_users,
    COUNT(DISTINCT CASE WHEN u.created_at >= NOW() - INTERVAL '7 days' THEN u.id END) as users_this_week,
    COUNT(DISTINCT sp.user_id) as active_users,
    COUNT(DISTINCT p.id) as total_problems,
    COUNT(DISTINCT sp.id) as total_solutions,
    COUNT(DISTINCT CASE WHEN sp.solved_at >= NOW() - INTERVAL '7 days' THEN sp.id END) as solutions_this_week
FROM users u
CROSS JOIN problems p
LEFT JOIN solved_problems sp ON u.id = sp.user_id AND sp.solved_at >= NOW() - INTERVAL '7 days';
