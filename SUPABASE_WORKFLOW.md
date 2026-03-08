# Supabase workflow (kawamura-kitchen)

This repo uses Supabase migrations as the source of truth.

## One-time setup
- supabase login
- supabase link --project-ref tmicyevydavkxhyfdypz

## Making DB changes
1) Create a migration:
   - supabase migration new <name>
   - or supabase db diff -f <name> (if you changed via UI)
2) Commit the new file in supabase/migrations/
3) Push to remote DB:
   - supabase db push

## Notes
- Don’t rely on Supabase UI-only edits without capturing a migration.
- Docker Desktop must be running for db pull / db diff.
