-- Add content column to card_sections for rich text editor
-- This will store HTML content with slash command formatting

ALTER TABLE card_sections
ADD COLUMN content TEXT;

-- Add comment for clarity
COMMENT ON COLUMN card_sections.content IS 'Rich text content with slash command support (HTML format)';
