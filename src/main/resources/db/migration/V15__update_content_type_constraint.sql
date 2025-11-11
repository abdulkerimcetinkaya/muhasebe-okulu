-- V15: Update content_type check constraint to include new block types
-- Drops the old constraint and creates a new one with all ContentType enum values

-- Drop the existing check constraint
ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_content_type_check;

-- Add updated check constraint with all ContentType values including new block types
ALTER TABLE content_items
ADD CONSTRAINT content_items_content_type_check
CHECK (content_type IN (
    'TEXT',
    'PROBLEM',
    'QUIZ',
    'STUDY_PROBLEM',
    'STUDY_QUIZ',
    'PARAGRAPH',
    'HEADING',
    'LIST',
    'TABLE',
    'DIVIDER',
    'CODE',
    'QUOTE',
    'CALLOUT'
));

-- Add comment for documentation
COMMENT ON CONSTRAINT content_items_content_type_check ON content_items IS
'Valid content types: TEXT, PROBLEM, QUIZ, STUDY_PROBLEM, STUDY_QUIZ, PARAGRAPH, HEADING, LIST, TABLE, DIVIDER, CODE, QUOTE, CALLOUT';
