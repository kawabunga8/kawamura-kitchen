-- Fix for 409 Conflict Error on pantry_items
-- Run these queries in Supabase SQL Editor

-- Step 1: Check what unique constraints exist
SELECT
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'pantry_items'
  AND tc.constraint_type = 'UNIQUE';

-- Step 2: DROP the unique constraint (replace constraint_name with actual name from step 1)
-- Example: ALTER TABLE pantry_items DROP CONSTRAINT pantry_items_name_key;
-- OR if it's (name, source): ALTER TABLE pantry_items DROP CONSTRAINT pantry_items_name_source_key;

-- Step 3: Verify no more unique constraints (should return empty)
SELECT
    tc.constraint_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'pantry_items'
  AND tc.constraint_type = 'UNIQUE';
