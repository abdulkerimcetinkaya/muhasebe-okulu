-- V16: Update content_type check constraint to include new block types
-- This fixes the constraint to allow PARAGRAPH, HEADING, LIST, TABLE, DIVIDER, CODE, QUOTE, CALLOUT

-- Drop the existing check constraint (created automatically by Hibernate)
ALTER TABLE content_items DROP CONSTRAINT IF EXISTS content_items_content_type_check;

-- Add updated check constraint with all ContentType enum values
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
