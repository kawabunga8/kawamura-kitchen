# Vote Tracking Setup Instructions

## Database Setup

To enable vote tracking for meal requests, you need to create a `votes` table in your Supabase database.

### Step 1: Create the votes table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create votes table to track individual votes
CREATE TABLE votes (
  id BIGSERIAL PRIMARY KEY,
  request_id BIGINT REFERENCES requests(id) ON DELETE CASCADE,
  voter_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable real-time for votes table
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- Create indexes for faster queries
CREATE INDEX idx_votes_request_id ON votes(request_id);
CREATE INDEX idx_votes_voter_name ON votes(voter_name);
```

### Step 2: Configure Row Level Security (Optional but Recommended)

If you have RLS enabled, add these policies:

```sql
-- Enable RLS
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read votes
CREATE POLICY "Allow public read access" ON votes
  FOR SELECT USING (true);

-- Allow anyone to insert votes
CREATE POLICY "Allow public insert access" ON votes
  FOR INSERT WITH CHECK (true);

-- Optionally: Allow users to delete their own votes
CREATE POLICY "Allow delete own votes" ON votes
  FOR DELETE USING (true);
```

## Features

Once the table is created, the app will:

1. **Track Individual Votes**: Each vote is recorded with the voter's name
2. **Prevent Duplicate Votes**: Users can't vote twice for the same meal request
3. **Show Voter Names**: Display who voted for each request with green badges
4. **Real-time Updates**: Votes update instantly across all connected devices

## How It Works

1. When voting, users select which family member is voting from a list
2. The system checks if that person already voted for the request
3. If not, it records the vote and updates the vote count
4. All voters are displayed below the request as green badges with thumbs-up icons

## Troubleshooting

If votes aren't working:

1. Verify the `votes` table exists in Supabase
2. Check that real-time is enabled for the `votes` table
3. Ensure your Supabase URL and API key are correctly configured in `.env`
4. Check browser console for any error messages
