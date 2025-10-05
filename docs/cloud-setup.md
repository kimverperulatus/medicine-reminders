# Cloud Supabase Setup Guide

This guide will help you connect your local development environment to your cloud Supabase instance.

## Prerequisites

1. A Supabase project (get one at https://app.supabase.com)
2. Supabase CLI installed (`npm install -g supabase`)
3. Environment variables from your Supabase project

## Getting Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to "Project Settings" > "API"
3. Copy the following values:
   - Project URL (SUPABASE_URL)
   - anon public key (SUPABASE_ANON_KEY)
   - service role key (SUPABASE_SERVICE_ROLE_KEY)

## Setting Up Environment Variables

### For Mobile App

Create a `.env` file in the `apps/mobile` directory:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### For Edge Functions

Set environment variables in your Supabase project:

```bash
supabase secrets set SUPABASE_URL=your_project_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set N8N_MISSED_DOSE_WEBHOOK=your_webhook_url
```

## Deploying Database Schema

If you haven't already deployed your schema to the cloud:

```bash
supabase db push
```

## Deploying Edge Functions

Deploy your functions to the cloud:

```bash
supabase functions deploy generate_schedules --project-ref your_project_id
supabase functions deploy send_due_push --project-ref your_project_id
supabase functions deploy mark_missed --project-ref your_project_id
```

## Setting Up Scheduled Jobs

Set up cron jobs for your functions in the Supabase dashboard:

1. Go to "Edge Functions" > "Cron Jobs"
2. Add the following jobs:
   - `generate_schedules`: Run daily at 00:00 (0 0 * * *)
   - `send_due_push`: Run every 15 minutes during waking hours (0,15,30,45 6-22 * * *)
   - `mark_missed`: Run every 10 minutes (*/10 * * * *)

## Testing the Connection

1. Start the mobile app:
   ```bash
   cd apps/mobile
   npm install
   npm start
   ```

2. Open the app and try to sign in with your email

3. Check the Supabase dashboard to see if the authentication is working

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Make sure you've created the `.env` file in the correct directory
2. **CORS errors**: Check that your redirect URLs are properly configured in Supabase Auth settings
3. **Function deployment errors**: Ensure all required environment variables are set

### Checking Logs

View Edge Function logs:
```bash
supabase functions logs generate_schedules
supabase functions logs send_due_push
supabase functions logs mark_missed
```

View database logs in the Supabase dashboard under "Logs" > "Database"