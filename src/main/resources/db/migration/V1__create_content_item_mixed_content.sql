-- V14: Create ContentItem and Mixed Content System
-- Enables sections to have multiple content items (text, problems, quizzes) in any order

-- First, remove old columns from card_sections that are no longer needed
-- These columns are replaced by the ContentItem system
ALTER TABLE card_sections DROP COLUMN IF EXISTS content_type;
ALTER TABLE card_sections DROP COLUMN IF EXISTS content;
ALTER TABLE card_sections DROP COLUMN IF EXISTS related_problem_id;
ALTER TABLE card_sections DROP COLUMN IF EXISTS related_quiz_id;

-- ContentItem Table - Core of mixed content system
CREATE TABLE content_items (
    id BIGSERIAL PRIMARY KEY,
    card_section_id BIGINT NOT NULL,
    content_type VARCHAR(20) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    -- TEXT content
    text_content TEXT,

    -- External references
    related_problem_id BIGINT,
    related_quiz_id BIGINT,

    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_content_item_section FOREIGN KEY (card_section_id)
        REFERENCES card_sections(id) ON DELETE CASCADE
);

-- Study Problems Table (updated to use content_item_id)
CREATE TABLE study_problems (
    id BIGSERIAL PRIMARY KEY,
    content_item_id BIGINT NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    hint TEXT,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'ORTA',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_study_problem_content_item FOREIGN KEY (content_item_id)
        REFERENCES content_items(id) ON DELETE CASCADE
);

-- Study Problem Entries Table
CREATE TABLE study_problem_entries (
    id BIGSERIAL PRIMARY KEY,
    study_problem_id BIGINT NOT NULL,
    account_code VARCHAR(100) NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    debit_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    credit_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    explanation VARCHAR(500),
    CONSTRAINT fk_study_entry_problem FOREIGN KEY (study_problem_id)
        REFERENCES study_problems(id) ON DELETE CASCADE
);

-- Study Quizzes Table (updated to use content_item_id)
CREATE TABLE study_quizzes (
    id BIGSERIAL PRIMARY KEY,
    content_item_id BIGINT NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    time_limit_minutes INTEGER,
    pass_percentage INTEGER NOT NULL DEFAULT 70,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_study_quiz_content_item FOREIGN KEY (content_item_id)
        REFERENCES content_items(id) ON DELETE CASCADE
);

-- Study Questions Table
CREATE TABLE study_questions (
    id BIGSERIAL PRIMARY KEY,
    study_quiz_id BIGINT NOT NULL,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    display_order INTEGER NOT NULL DEFAULT 0,
    points INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT fk_study_question_quiz FOREIGN KEY (study_quiz_id)
        REFERENCES study_quizzes(id) ON DELETE CASCADE
);

-- Study Question Options Table
CREATE TABLE study_question_options (
    id BIGSERIAL PRIMARY KEY,
    study_question_id BIGINT NOT NULL,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    display_order INTEGER NOT NULL DEFAULT 0,
    explanation TEXT,
    CONSTRAINT fk_study_option_question FOREIGN KEY (study_question_id)
        REFERENCES study_questions(id) ON DELETE CASCADE
);

-- Create Indexes for Performance
CREATE INDEX idx_content_items_section ON content_items(card_section_id);
CREATE INDEX idx_content_items_section_order ON content_items(card_section_id, display_order);
CREATE INDEX idx_content_items_type ON content_items(content_type);
CREATE INDEX idx_study_problems_content_item ON study_problems(content_item_id);
CREATE INDEX idx_study_problem_entries_problem ON study_problem_entries(study_problem_id);
CREATE INDEX idx_study_quizzes_content_item ON study_quizzes(content_item_id);
CREATE INDEX idx_study_questions_quiz ON study_questions(study_quiz_id);
CREATE INDEX idx_study_questions_order ON study_questions(study_quiz_id, display_order);
CREATE INDEX idx_study_question_options_question ON study_question_options(study_question_id);
CREATE INDEX idx_study_question_options_order ON study_question_options(study_question_id, display_order);

-- Add Comments
COMMENT ON TABLE content_items IS 'Individual content pieces within card sections - enables mixed content';
COMMENT ON TABLE study_problems IS 'Custom accounting problems specific to study cards';
COMMENT ON TABLE study_problem_entries IS 'Correct accounting entries for study problems';
COMMENT ON TABLE study_quizzes IS 'Custom quizzes specific to study cards';
COMMENT ON TABLE study_questions IS 'Questions within study quizzes';
COMMENT ON TABLE study_question_options IS 'Answer options for study questions';

COMMENT ON COLUMN content_items.content_type IS 'TEXT, PROBLEM, QUIZ, STUDY_PROBLEM, or STUDY_QUIZ';
COMMENT ON COLUMN content_items.display_order IS 'Order within the section for mixed content';
