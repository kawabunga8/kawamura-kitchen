-- Add email field to family_members table
-- Run this in Supabase SQL Editor

-- Add the email column
ALTER TABLE family_members
ADD COLUMN email TEXT;

-- Verify the change
SELECT id, name, email, email_notifications
FROM family_members;
