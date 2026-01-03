-- Fix for 409 Conflict Error on pantry_items
-- Run this entire script in Supabase SQL Editor

-- This will automatically find and drop the unique constraint
DO $$
DECLARE
    constraint_name_var text;
BEGIN
    -- Find the unique constraint name
    SELECT constraint_name INTO constraint_name_var
    FROM information_schema.table_constraints
    WHERE table_name = 'pantry_items'
      AND constraint_type = 'UNIQUE'
    LIMIT 1;

    -- Drop it if it exists
    IF constraint_name_var IS NOT NULL THEN
        EXECUTE format('ALTER TABLE pantry_items DROP CONSTRAINT %I', constraint_name_var);
        RAISE NOTICE 'Dropped constraint: %', constraint_name_var;
    ELSE
        RAISE NOTICE 'No unique constraint found on pantry_items';
    END IF;
END $$;

-- Verify it's gone (should return empty result)
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'pantry_items'
  AND constraint_type = 'UNIQUE';
