-- Add notes column to dinners table
-- This allows users to add notes to scheduled meals

ALTER TABLE dinners
ADD COLUMN notes TEXT DEFAULT '';

-- Update existing rows to have empty notes
UPDATE dinners
SET notes = ''
WHERE notes IS NULL;
