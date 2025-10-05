import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function seedDatabase() {
  console.log('Seeding database...');

  // Create admin user
  const { data: adminUser, error: adminError } = await supabase
    .from('users')
    .insert({
      email: 'admin@example.com',
      full_name: 'Admin User',
      role: 'admin'
    })
    .select();

  if (adminError) {
    console.error('Error creating admin user:', adminError);
    return;
  }

  console.log('Admin user created:', adminUser?.[0]);

  // Create doctor user
  const { data: doctorUser, error: doctorError } = await supabase
    .from('users')
    .insert({
      email: 'doctor@example.com',
      full_name: 'Dr. Smith',
      role: 'doctor'
    })
    .select();

  if (doctorError) {
    console.error('Error creating doctor user:', doctorError);
    return;
  }

  console.log('Doctor user created:', doctorUser?.[0]);

  // Create patient user
  const { data: patientUser, error: patientError } = await supabase
    .from('users')
    .insert({
      email: 'patient@example.com',
      full_name: 'John Doe',
      role: 'patient'
    })
    .select();

  if (patientError) {
    console.error('Error creating patient user:', patientError);
    return;
  }

  console.log('Patient user created:', patientUser?.[0]);

  // Create patient record
  const { data: patient, error: patientRecordError } = await supabase
    .from('patients')
    .insert({
      user_id: patientUser?.[0].id,
      date_of_birth: '1950-01-01',
      address: '123 Main St, City, State',
      emergency_contact_name: 'Jane Doe',
      emergency_contact_phone: '+1234567890',
      doctor_id: doctorUser?.[0].id
    })
    .select();

  if (patientRecordError) {
    console.error('Error creating patient record:', patientRecordError);
    return;
  }

  console.log('Patient record created:', patient?.[0]);

  // Create sample prescription
  const { data: prescription, error: prescriptionError } = await supabase
    .from('prescriptions')
    .insert({
      patient_id: patient?.[0].id,
      medication_name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'once_daily',
      times: ['08:00'],
      start_date: new Date().toISOString().split('T')[0],
      prescribing_doctor_id: doctorUser?.[0].id,
      instructions: 'Take with food'
    })
    .select();

  if (prescriptionError) {
    console.error('Error creating prescription:', prescriptionError);
    return;
  }

  console.log('Prescription created:', prescription?.[0]);

  console.log('Database seeding completed successfully!');
}

seedDatabase();