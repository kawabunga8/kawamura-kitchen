-- Diagnostic queries to troubleshoot pantry_items issue
-- Run these in Supabase SQL Editor

-- 1. Check table structure and constraints
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pantry_items'
ORDER BY ordinal_position;

-- 2. Check for unique constraints
SELECT
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'pantry_items';

-- 3. Check RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'pantry_items';

-- 4. Check if RLS is enabled
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename = 'pantry_items';

-- 5. See all current pantry items
SELECT * FROM pantry_items ORDER BY source, name;
