# Setup Guide for Elder Medication Reminder App

This guide will help you set up and connect the Elder Medication Reminder App to your cloud Supabase instance.

## Step 1: Prerequisites

Make sure you have the following installed:
- Node.js 18+
- npm or yarn
- Supabase CLI (`npm install -g supabase`)

## Step 2: Create a Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Enter your project details
4. Wait for the project to be created (this may take a few minutes)

## Step 3: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to "Project Settings" > "API"
2. Copy the following values:
   - Project URL
   - anon public key
   - service role key

## Step 4: Set Up Environment Variables

Run the setup script:
```bash
npm run setup:env
```

This will create a `.env` file in `apps/mobile/`. Open it and replace the placeholder values with your actual Supabase credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_actual_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
```

## Step 5: Install Dependencies

Install dependencies for the entire project:
```bash
npm install
```

Then install mobile app dependencies:
```bash
cd apps/mobile
npm install
```

## Step 6: Deploy Database Schema

From the root directory:
```bash
supabase db push
```

## Step 7: Set Up Row Level Security (RLS)

Apply the RLS policies:
```bash
supabase sql -f supabase/policies.sql
```

## Step 8: Set Edge Function Secrets

Set the required secrets for your Edge Functions:
```bash
supabase secrets set SUPABASE_URL=your_project_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Step 9: Deploy Edge Functions

Deploy your functions:
```bash
supabase functions deploy generate_schedules
supabase functions deploy send_due_push
supabase functions deploy mark_missed
```

## Step 10: Set Up Scheduled Jobs

In your Supabase dashboard:
1. Go to "Edge Functions" > "Cron Jobs"
2. Add the following jobs:
   - `generate_schedules`: Run daily at 00:00 (0 0 * * *)
   - `send_due_push`: Run every 15 minutes during waking hours (0,15,30,45 6-22 * * *)
   - `mark_missed`: Run every 10 minutes (*/10 * * * *)

## Step 11: Test the Connection

Test your Supabase connection:
```bash
npm run test:connection
```

## Step 12: Start the Mobile App

```bash
cd apps/mobile
npm start
```

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure the `.env` file is in the correct location (`apps/mobile/.env`)
2. **Connection errors**: Verify your Supabase credentials are correct
3. **Database errors**: Make sure you've deployed the schema and RLS policies
4. **Function deployment errors**: Ensure all required secrets are set

### Getting Help

If you're still having issues:
1. Check the Supabase logs in your project dashboard
2. Run the connection test script: `npm run test:connection`
3. Verify your environment variables are set correctly