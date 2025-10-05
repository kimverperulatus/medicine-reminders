# Elder Medication Reminder App

A comprehensive medication management system for elderly patients with caregivers, doctors, and support staff.

## Project Structure

- `apps/mobile` - Mobile application for patients
- `packages/shared` - Shared types and utilities
- `supabase/` - Database schema and policies
- `edge/` - Supabase Edge Functions
- `n8n/` - Workflow automation
- `docs/` - Documentation
- `scripts/` - Utility scripts

## Features

- Patient medication scheduling and tracking
- Caregiver/doctor dashboards
- Missed dose notifications
- SMS fallback system
- Daily adherence reports

## Setup Instructions

### Prerequisites

- Node.js 18+
- Supabase CLI
- Expo CLI
- Docker (for local Supabase development)

### Environment Variables

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

### Supabase Setup

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

### Deploy Edge Functions

```bash
supabase functions deploy generate_schedules --project-ref your_project_id
supabase functions deploy send_due_push --project-ref your_project_id
supabase functions deploy mark_missed --project-ref your_project_id
```

### Mobile App Setup

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

### Setting up Scheduled Jobs

Set up cron jobs to run the Edge Functions:

- `generate_schedules`: Daily at midnight
- `send_due_push`: Every 15 minutes during waking hours
- `mark_missed`: Every 10 minutes

### Seeding the Database

To seed the database with sample data:

```bash
cd scripts
npm run seed
```

## Workflows

The n8n workflows handle:

1. **Missed Dose SMS Alerts**: Sends SMS to patients and emergency contacts when 3 doses are missed in 48 hours
2. **Doctor Digest**: Sends daily adherence reports to doctors

## Security

Row Level Security (RLS) policies ensure that users can only access data they're authorized to view:

- Admins can access all data
- Doctors can access their patients' data
- Patients can access only their own data
- Caregivers can access their assigned patients' data

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request