-- Enable RLS on the table
ALTER TABLE pantry_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to view items
CREATE POLICY "Enable read access for authenticated users" ON "public"."pantry_items"
AS PERMISSIVE FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow all authenticated users to insert items
CREATE POLICY "Enable insert access for authenticated users" ON "public"."pantry_items"
AS PERMISSIVE FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow all authenticated users to update items
CREATE POLICY "Enable update access for authenticated users" ON "public"."pantry_items"
AS PERMISSIVE FOR UPDATE
TO authenticated
USING (true);

-- Create policy to allow all authenticated users to delete items
CREATE POLICY "Enable delete access for authenticated users" ON "public"."pantry_items"
AS PERMISSIVE FOR DELETE
TO authenticated
USING (true);
