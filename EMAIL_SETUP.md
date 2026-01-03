# Email Notification Setup Guide

## Step 1: Create Resend Account

1. Go to https://resend.com/signup
2. Sign up with your email
3. Verify your email address
4. Get your API key from the dashboard

## Step 2: Add Resend API Key to Vercel

1. Go to Vercel Dashboard → kawamura-kitchen project
2. Click "Settings" → "Environment Variables"
3. Add new variable:
   - Name: `RESEND_API_KEY`
   - Value: `re_xxxxxxxxxxxxx` (your API key from Resend)
   - Apply to: Production, Preview, Development
4. Click "Save"

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

## Free Tier Limits

Resend free tier:
- 3,000 emails/month
- 100 emails/day
- Perfect for family use!
