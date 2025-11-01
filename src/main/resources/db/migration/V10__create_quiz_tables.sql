-- Quiz Module Tables Creation

-- Topics table
CREATE TABLE IF NOT EXISTS topics (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    topic_id BIGINT REFERENCES topics(id) ON DELETE SET NULL,
    time_limit_minutes INTEGER,
    difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
    pass_percentage INTEGER NOT NULL DEFAULT 70 CHECK (pass_percentage BETWEEN 0 AND 100),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by BIGINT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    quiz_id BIGINT NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_order INTEGER,
    points INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Options table
CREATE TABLE IF NOT EXISTS options (
    id BIGSERIAL PRIMARY KEY,
    question_id BIGINT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    option_order INTEGER,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- User Quiz Answers table
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

-- Indexes for better performance
CREATE INDEX idx_quizzes_topic_id ON quizzes(topic_id);
CREATE INDEX idx_quizzes_is_active ON quizzes(is_active);
CREATE INDEX idx_quizzes_difficulty ON quizzes(difficulty);
CREATE INDEX idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX idx_questions_order ON questions(question_order);
CREATE INDEX idx_options_question_id ON options(question_id);
CREATE INDEX idx_options_is_correct ON options(is_correct);
CREATE INDEX idx_user_quiz_answers_user_id ON user_quiz_answers(user_id);
CREATE INDEX idx_user_quiz_answers_quiz_id ON user_quiz_answers(quiz_id);
CREATE INDEX idx_user_quiz_answers_question_id ON user_quiz_answers(question_id);

-- Insert some sample topics
INSERT INTO topics (name, description) VALUES
('Temel Muhasebe', 'Temel muhasebe kavramları ve ilkeleri'),
('Yevmiye Kayıtları', 'Muhasebe işlemlerinin yevmiye defterine kaydedilmesi'),
('Finansal Tablolar', 'Bilanço, gelir tablosu ve diğer finansal tablolar'),
('Maliyet Muhasebesi', 'Maliyet hesaplama ve analiz teknikleri');

-- Comments for documentation
COMMENT ON TABLE topics IS 'Quiz konularını saklar';
COMMENT ON TABLE quizzes IS 'Quizleri saklar';
COMMENT ON TABLE questions IS 'Quiz sorularını saklar';
COMMENT ON TABLE options IS 'Soru şıklarını saklar';
COMMENT ON TABLE user_quiz_answers IS 'Kullanıcıların quiz cevaplarını saklar';
