-- Fix the ID sequence for pantry_items
-- This resets the auto-increment to avoid duplicate ID errors

-- Reset the sequence to the max ID + 1
SELECT setval(
    pg_get_serial_sequence('pantry_items', 'id'),
    COALESCE((SELECT MAX(id) FROM pantry_items), 0) + 1,
    false
);

-- Verify the next ID that will be used
SELECT nextval(pg_get_serial_sequence('pantry_items', 'id')) as next_id;
