import { z } from "zod";

// Enums
export const UserRole = z.enum(["admin", "doctor", "support", "patient"]);
export type UserRole = z.infer<typeof UserRole>;

export const DoseStatus = z.enum(["pending", "taken", "missed", "snoozed", "skipped"]);
export type DoseStatus = z.infer<typeof DoseStatus>;

export const PrescriptionFrequency = z.enum([
  "once_daily",
  "twice_daily",
  "three_times_daily",
  "four_times_daily",
  "as_needed",
  "custom"
]);
export type PrescriptionFrequency = z.infer<typeof PrescriptionFrequency>;

// User Schema
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  full_name: z.string(),
  role: UserRole,
  created_at: z.date(),
  updated_at: z.date(),
});

export type User = z.infer<typeof UserSchema>;

// Patient Schema
export const PatientSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  date_of_birth: z.date(),
  address: z.string().nullable(),
  emergency_contact_name: z.string().nullable(),
  emergency_contact_phone: z.string().nullable(),
  caregiver_id: z.string().uuid().nullable(),
  doctor_id: z.string().uuid().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Patient = z.infer<typeof PatientSchema>;

// Prescription Schema
export const PrescriptionSchema = z.object({
  id: z.string().uuid(),
  patient_id: z.string().uuid(),
  medication_name: z.string(),
  dosage: z.string(),
  frequency: PrescriptionFrequency,
  times: z.array(z.string()), // Array of times in HH:MM format
  start_date: z.date(),
  end_date: z.date().nullable(),
  instructions: z.string().nullable(),
  prescribing_doctor_id: z.string().uuid(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type Prescription = z.infer<typeof PrescriptionSchema>;

// Schedule Schema
export const ScheduleSchema = z.object({
  id: z.string().uuid(),
  prescription_id: z.string().uuid(),
  scheduled_time: z.date(),
  status: DoseStatus,
  created_at: z.date(),
  updated_at: z.date(),
});

export type Schedule = z.infer<typeof ScheduleSchema>;

// Intake Log Schema
export const IntakeLogSchema = z.object({
  id: z.string().uuid(),
  schedule_id: z.string().uuid(),
  patient_id: z.string().uuid(),
  taken_at: z.date().nullable(),
  status: DoseStatus,
  notes: z.string().nullable(),
  created_at: z.date(),
  updated_at: z.date(),
});

export type IntakeLog = z.infer<typeof IntakeLogSchema>;

// Device Schema
export const DeviceSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  expo_push_token: z.string().nullable(),
  device_info: z.string().nullable(),
  last_seen: z.date(),
  created_at: z.date(),
});

export type Device = z.infer<typeof DeviceSchema>;