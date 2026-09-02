# Email Notification Setup Guide

## Step 1: Create a Gmail App Password

1. Go to your Google Account → Security → 2-Step Verification → App passwords
2. Generate an app password for "Mail"
3. Keep it handy for the next step

## Step 2: Configure environment variables on Vercel

This project uses Supabase in serverless functions (for `/api/send-email` and `/api/send-daily-schedule`).

1. Go to Vercel Dashboard → kawamura-kitchen project
2. Click **Settings → Environment Variables**
3. Add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`

(Back-compat: the code still accepts legacy `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, but the `SUPABASE_*` names are preferred for server-side functions.)

For email delivery, the current `/api/send-email` implementation uses Gmail SMTP:
- `GMAIL_USER`
- `GMAIL_APP_PASSWORD` (the app password from Step 1)

Apply variables to: Production, Preview, Development, then click Save.

## Step 3: Add Email Column to Database

Run this SQL in Supabase SQL Editor:

```sql
ALTER TABLE family_members
ADD COLUMN email TEXT;
```

## Step 4: Create Email API Route

We'll use a serverless function in your app to send emails.

## Step 5: Test Email Notifications

1. Add a family member with an email address
2. Toggle their "Email Notifications" setting to ON
3. Create a new meal request
4. Check if email was received

## Email Triggers

Emails will be sent when:
- ✅ New meal request is created
- ✅ Meal request is scheduled
- ✅ Pantry item becomes low stock

## Gmail Sending Limits

A standard Gmail account can send roughly 500 emails/day via SMTP — plenty for family use.
