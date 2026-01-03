-- Add permanent staple items to the pantry
-- Run this SQL in your Supabase SQL Editor

INSERT INTO pantry_items (name, quantity, low_stock, source)
VALUES
  ('Oat Milk (packs)', '2 packs', false, 'other'),
  ('Broccoli', '1 head', false, 'other'),
  ('Rice', '5 lbs', false, 'other'),
  ('Margarine', '1 tub', false, 'other')
ON CONFLICT DO NOTHING;
