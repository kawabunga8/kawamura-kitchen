# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start local Vite dev server
npm run build     # Production build (output to dist/)
npm run preview   # Preview production build locally
```

No test or lint scripts are configured.

### Supabase migrations

```bash
supabase login
supabase link --project-ref tmicyevydavkxhyfdypz   # one-time setup
supabase migration new <name>                        # create new migration
supabase db diff -f <name>                           # generate diff-based migration
supabase db push                                     # apply migrations to remote
```

## Architecture

**React SPA (Vite) → Supabase (DB + Auth + Realtime) + Vercel Functions (Email/SMS)**

### Data layer

`src/hooks/useKitchenData.jsx` is the single source of truth for all data. It:
- Fetches and holds state for all five tables: `family_members`, `dinners`, `requests`, `pantry_items`, `votes`
- Creates Supabase realtime subscriptions (channels: `family_members_changes`, `dinners_changes`, `requests_changes`, `pantry_items_changes`, `votes_changes`) — on any change, it refetches and updates state
- Exposes all CRUD functions to components via `useKitchenData()` context hook
- CRUD functions return `{ error }` or `{ data, error }` — simple operations return only `error`

When adding a new table or operation: add the Supabase query to `useKitchenData.jsx` and expose it through the provider value. Rely on realtime subscriptions for client updates rather than manual state copies.

### Email and SMS

Client code never calls nodemailer/Twilio directly. It POSTs to:
- `/api/send-email` — payload shape: `{ to, subject, html }`
- `/api/send-sms` — payload shape: `{ to, body }`

Both endpoints validate the Supabase JWT from `Authorization: Bearer <token>`. To add a new server-side integration, add a file under `api/` and call it with `fetch('/api/<name>')`.

### Authentication

Supabase session is persisted in localStorage under key `kawamura_kitchen_auth`. `App.jsx` manages auth state and renders either `LoginScreen` or the main app wrapped in `KitchenDataProvider`.

### Component organization

- `src/components/views/` — one file per page (Dashboard, Schedule, Requests, Pantry, Family)
- `src/components/forms/` — controlled form components + embedded dialogs
- `src/components/layout/` — Sidebar, MobileHeader
- `src/components/schedule/` — DatePicker, MonthView
- `src/components/ui/` — Modal, ToastProvider

All pages access data via `useKitchenData()`. Toast notifications via `useToast()` from `ToastProvider`.

## Conventions

- **Dates:** store as `YYYY-MM-DD` strings using `formatDateKey(date)` from `src/lib/utils.js`
- **Times:** use `convertTo12Hour()` from `src/lib/utils.js` for display and storage
- **Constants:** category maps, emoji maps, color schemes live in `src/lib/constants.js`
- **Tailwind via CDN** (loaded in `index.html`) — no PostCSS build step

## Required environment variables

| Variable | Used in |
|---|---|
| `VITE_SUPABASE_URL` | `src/lib/supabase.js` |
| `VITE_SUPABASE_ANON_KEY` | `src/lib/supabase.js` |
| `GMAIL_USER` | `api/send-email.js` |
| `GMAIL_APP_PASSWORD` | `api/send-email.js` |
| `TWILIO_ACCOUNT_SID` | `api/send-sms.js` |
| `TWILIO_AUTH_TOKEN` | `api/send-sms.js` |
| `TWILIO_PHONE_NUMBER` | `api/send-sms.js` |
