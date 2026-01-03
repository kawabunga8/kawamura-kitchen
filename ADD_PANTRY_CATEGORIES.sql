-- Add category field to pantry_items table
-- Run this in Supabase SQL Editor

-- Add the category column
ALTER TABLE pantry_items
ADD COLUMN category TEXT DEFAULT 'pantry';

-- Update existing items to have a default category
UPDATE pantry_items
SET category = 'pantry'
WHERE category IS NULL;

-- Verify the change
SELECT id, name, quantity, source, category
FROM pantry_items
ORDER BY category, name;
