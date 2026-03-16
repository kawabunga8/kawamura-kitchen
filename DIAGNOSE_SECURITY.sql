-- Diagnose Policies and Constraints

-- 1. Check Active Policies
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

-- 2. Check Constraints
SELECT 
    conname as constraint_name, 
    contype as constraint_type, 
    pg_get_constraintdef(c.oid) as definition
FROM pg_constraint c 
JOIN pg_namespace n ON n.oid = c.connamespace 
WHERE conrelid = 'public.pantry_items'::regclass;
