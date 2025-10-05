-- Create Enums
create type user_role as enum ('admin', 'doctor', 'support', 'patient');
create type dose_status as enum ('pending', 'taken', 'missed', 'snoozed', 'skipped');
create type prescription_frequency as enum (
  'once_daily',
  'twice_daily',
  'three_times_daily',
  'four_times_daily',
  'as_needed',
  'custom'
);

-- Create Tables
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  phone text unique,
  full_name text not null,
  role user_role not null default 'patient',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table patients (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  date_of_birth date not null,
  address text,
  emergency_contact_name text,
  emergency_contact_phone text,
  caregiver_id uuid references users(id),
  doctor_id uuid references users(id),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique(user_id)
);

create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  medication_name text not null,
  dosage text not null,
  frequency prescription_frequency not null,
  times text[] not null, -- Array of times in HH:MM format
  start_date date not null,
  end_date date,
  instructions text,
  prescribing_doctor_id uuid references users(id) not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table schedules (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid references prescriptions(id) on delete cascade not null,
  scheduled_time timestamp with time zone not null,
  status dose_status not null default 'pending',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table intake_logs (
  id uuid primary key default gen_random_uuid(),
  schedule_id uuid references schedules(id) on delete cascade not null,
  patient_id uuid references patients(id) on delete cascade not null,
  taken_at timestamp with time zone,
  status dose_status not null,
  notes text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

create table devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade not null,
  expo_push_token text,
  device_info text,
  last_seen timestamp with time zone default now() not null,
  created_at timestamp with time zone default now() not null
);

-- Create Indexes
create index idx_users_email on users(email);
create index idx_users_phone on users(phone);
create index idx_patients_user_id on patients(user_id);
create index idx_prescriptions_patient_id on prescriptions(patient_id);
create index idx_schedules_prescription_id on schedules(prescription_id);
create index idx_schedules_scheduled_time on schedules(scheduled_time);
create index idx_schedules_status on schedules(status);
create index idx_intake_logs_schedule_id on intake_logs(schedule_id);
create index idx_intake_logs_patient_id on intake_logs(patient_id);
create index idx_devices_user_id on devices(user_id);
create index idx_devices_expo_push_token on devices(expo_push_token);