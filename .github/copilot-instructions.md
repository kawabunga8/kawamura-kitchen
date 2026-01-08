# Copilot instructions for Kawamura Kitchen

Short, actionable guidance to help AI agents be productive in this repository.

## Architecture (big picture)
- Frontend: React (src/) built with Vite. Entrypoint: [src/main.jsx](src/main.jsx). Top-level app: [src/App.jsx](src/App.jsx).
- State & data layer: `KitchenDataProvider` in [src/hooks/useKitchenData.jsx](src/hooks/useKitchenData.jsx). It loads data from Supabase and creates realtime subscriptions (channels named like `family_members_changes`, `dinners_changes`, etc.).
- Backend / integrations: simple serverless endpoint at [api/send-email.js](api/send-email.js) (expects Gmail credentials). Database is Supabase (client in [src/lib/supabase.js](src/lib/supabase.js)).

## Important files & patterns
- `src/hooks/useKitchenData.jsx`: central single-source-of-truth for CRUD operations. Functions return `{ error }` or `{ data, error }` and often trigger emails via `fetch('/api/send-email')`.
- `src/lib/constants.js`: single place for app constants (e.g. `FAMILY_PASSWORD`, category maps, emojis).
- `src/lib/utils.js`: date/time helpers (use these when manipulating dinner dates/times).
- Views/components: UI is organized under `src/components/` (layout, views, forms, ui). Follow existing component patterns when adding new screens.
- Client uses localStorage key `kawamura_kitchen_auth` to persist authentication state in `App.jsx`.

## Environment & run commands
- Local dev: `npm run dev` (Vite). Build: `npm run build`. Preview: `npm run preview`.
- Required env vars:
  - `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (used in [src/lib/supabase.js](src/lib/supabase.js)).
  - `GMAIL_USER` and `GMAIL_APP_PASSWORD` for the email endpoint in [api/send-email.js](api/send-email.js).

## Conventions and developer workflows
- Realtime-first: most UI updates rely on Supabase realtime channels; when adding server-side mutations prefer to rely on those subscriptions for client updates rather than manual state copies where possible.
- CRUD functions live in `useKitchenData.jsx` and are used by components via `useKitchenData()`. When adding a new table or operation, add the Supabase query here and expose it through the provider value.
- Email sending: client code never calls nodemailer directly; it POSTs JSON to `/api/send-email`. Keep the same payload shape: `{ to, subject, html }`.
- Date format: store dinner date keys using `formatDateKey(date)` from `src/lib/utils.js` (YYYY-MM-DD).
- Time format: use `convertTo12Hour()` for display and storage consistency.

## DB tables referenced (searchable in code)
- `family_members`, `dinners`, `requests`, `pantry_items`, `votes` — table names are used directly in Supabase queries in `useKitchenData`.

## Editing guidance & examples
- To add a new server-side action, add a file under `api/` and call it from the frontend with `fetch('/api/<name>')`.
- Example: scheduling a request calls `supabase.from('dinners').insert(...)` inside `scheduleRequest` in `useKitchenData.jsx` and then sends an email using `sendEmail`.
- When adding UI, follow existing folder structure and export patterns (e.g. `components/views/RequestsView.jsx` style).

## Safety notes for contributors
- `FAMILY_PASSWORD` is hard-coded in `src/lib/constants.js`; changing it will affect local sign-in flow used by `App.jsx`.
- Email credentials live in environment variables; do not commit secrets.

If anything here is unclear or you want more detail (test commands, CI, or templates for new components), tell me which section to expand.
