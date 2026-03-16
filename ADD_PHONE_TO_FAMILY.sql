-- Add phone column to family_members table
ALTER TABLE family_members 
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add sms_notifications preference (default to true or matches email_notifications)
ALTER TABLE family_members
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT true;
