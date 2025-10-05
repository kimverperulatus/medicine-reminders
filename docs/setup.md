# Setup Guide

## Prerequisites

- Node.js 18+
- Supabase CLI
- Expo CLI
- Docker (for local Supabase development)

## Environment Variables

Create a `.env` file in the root with:

```
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

For the mobile app, create `apps/mobile/.env` with:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase Setup

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Start Supabase locally:
   ```bash
   supabase start
   ```

3. Apply database schema:
   ```bash
   supabase db push
   ```

4. Apply RLS policies:
   ```bash
   supabase sql -f supabase/policies.sql
   ```

## Deploy Edge Functions

```bash
supabase functions deploy generate_schedules --project-ref your_project_id
supabase functions deploy send_due_push --project-ref your_project_id
supabase functions deploy mark_missed --project-ref your_project_id
```

## Mobile App Setup

1. Navigate to mobile app directory:
   ```bash
   cd apps/mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the app:
   ```bash
   npm start
   ```

## Setting up Scheduled Jobs

Set up cron jobs to run the Edge Functions:

- `generate_schedules`: Daily at midnight
- `send_due_push`: Every 15 minutes during waking hours
- `mark_missed`: Every 10 minutes