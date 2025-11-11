-- Create quiz-related tables
-- This script creates all tables needed for the quiz system

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    topic_id BIGINT REFERENCES topics(id) ON DELETE SET NULL,
    time_limit_minutes INTEGER,
    passing_score INTEGER,
    total_points INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    points INTEGER NOT NULL DEFAULT 1,
    difficulty_level VARCHAR(50),
    explanation TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Options table
CREATE TABLE IF NOT EXISTS options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User quiz answers table
CREATE TABLE IF NOT EXISTS user_quiz_answers (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_id BIGINT REFERENCES options(id) ON DELETE SET NULL,
    is_correct BOOLEAN,
    points_earned INTEGER DEFAULT 0,
    answered_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quizzes_topic_id ON quizzes(topic_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_is_active ON quizzes(is_active);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_options_question_id ON options(question_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_user_id ON user_quiz_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_quiz_id ON user_quiz_answers(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_quiz_answers_question_id ON user_quiz_answers(question_id);

-- Success message
SELECT 'Quiz tables created successfully!' AS status;
