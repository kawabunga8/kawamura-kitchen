-- Add color column to family_members table
-- Run this in Supabase SQL Editor

ALTER TABLE family_members
ADD COLUMN color TEXT DEFAULT 'orange';

-- Verify the change
SELECT id, name, color FROM family_members;
