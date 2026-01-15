-- SECURE DATABASE SCRIPT
-- Run this in your Supabase SQL Editor to secure your data.

-- 1. Enable Row Level Security (RLS) on all tables
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE dinners ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- 2. Create policies to allow access ONLY to authenticated users
-- "Authenticated" means the user is logged in via Supabase Auth.

-- Family Members Table
CREATE POLICY "Allow authenticated users full access to family_members"
ON family_members
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Dinners Table
CREATE POLICY "Allow authenticated users full access to dinners"
ON dinners
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Requests Table
CREATE POLICY "Allow authenticated users full access to requests"
ON requests
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Pantry Items Table
CREATE POLICY "Allow authenticated users full access to pantry_items"
ON pantry_items
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- Votes Table
CREATE POLICY "Allow authenticated users full access to votes"
ON votes
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. (Optional) Ensure "anon" (unauthenticated public) has NO access
-- By enabling RLS and not creating policies for "anon", they are implicitly denied.
-- This section is just for verification if you want to be explicit, but step 2 is sufficient.
