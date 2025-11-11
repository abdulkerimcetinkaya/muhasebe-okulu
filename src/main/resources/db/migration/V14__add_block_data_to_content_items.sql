-- Add blockData column to content_items table for Notion-like structured content
-- This column stores JSON data representing the block structure from the Notion-like editor

ALTER TABLE content_items
ADD COLUMN block_data TEXT;

-- Add comment for documentation
COMMENT ON COLUMN content_items.block_data IS 'JSON data for Notion-like structured blocks (headings, lists, tables, callouts, etc.)';

-- No need to migrate existing data as blockData is optional
-- Existing textContent data remains valid for TEXT type items
