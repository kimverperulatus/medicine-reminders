-- Enable RLS on all tables
alter table users enable row level security;
alter table patients enable row level security;
alter table prescriptions enable row level security;
alter table schedules enable row level security;
alter table intake_logs enable row level security;
alter table devices enable row level security;

-- Users Policies
create policy "Users can view their own profile"
  on users for select
  using (id = auth.uid() or role = 'admin');

create policy "Admins can manage all users"
  on users for all
  using (role = 'admin');

create policy "Users can update their own profile"
  on users for update
  using (id = auth.uid());

-- Patients Policies
create policy "Patients can view their own record"
  on patients for select
  using (user_id = auth.uid() or 
         caregiver_id = auth.uid() or 
         doctor_id = auth.uid() or 
         exists (select 1 from users where id = auth.uid() and role = 'admin'));

create policy "Patients can update their own record"
  on patients for update
  using (user_id = auth.uid() or 
         caregiver_id = auth.uid() or 
         doctor_id = auth.uid());

create policy "Admins can manage all patients"
  on patients for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- Prescriptions Policies
create policy "Patients and caregivers can view prescriptions"
  on prescriptions for select
  using (patient_id in (
    select id from patients 
    where user_id = auth.uid() or 
          caregiver_id = auth.uid() or 
          doctor_id = auth.uid()
  ) or exists (select 1 from users where id = auth.uid() and role = 'admin'));

create policy "Doctors and admins can manage prescriptions"
  on prescriptions for all
  using (prescribing_doctor_id = auth.uid() or 
         exists (select 1 from users where id = auth.uid() and role = 'admin'));

-- Schedules Policies
create policy "Patients and caregivers can view schedules"
  on schedules for select
  using (exists (
    select 1 from prescriptions p
    join patients pat on p.patient_id = pat.id
    where p.id = schedules.prescription_id and (
      pat.user_id = auth.uid() or 
      pat.caregiver_id = auth.uid() or 
      pat.doctor_id = auth.uid() or
      exists (select 1 from users where id = auth.uid() and role = 'admin')
    )
  ));

-- Intake Logs Policies
create policy "Patients and caregivers can view intake logs"
  on intake_logs for select
  using (patient_id in (
    select id from patients 
    where user_id = auth.uid() or 
          caregiver_id = auth.uid() or 
          doctor_id = auth.uid()
  ) or exists (select 1 from users where id = auth.uid() and role = 'admin'));

create policy "Patients can create intake logs"
  on intake_logs for insert
  with check (patient_id in (
    select id from patients where user_id = auth.uid()
  ));

create policy "Patients and caregivers can update intake logs"
  on intake_logs for update
  using (patient_id in (
    select id from patients 
    where user_id = auth.uid() or 
          caregiver_id = auth.uid()
  ));

create policy "Admins and doctors can manage all intake logs"
  on intake_logs for all
  using (exists (select 1 from users where id = auth.uid() and role in ('admin', 'doctor')));

-- Devices Policies
create policy "Users can view their own devices"
  on devices for select
  using (user_id = auth.uid() or 
         exists (select 1 from users where id = auth.uid() and role = 'admin'));

create policy "Users can manage their own devices"
  on devices for all
  using (user_id = auth.uid());

create policy "Admins can manage all devices"
  on devices for all
  using (exists (select 1 from users where id = auth.uid() and role = 'admin'));