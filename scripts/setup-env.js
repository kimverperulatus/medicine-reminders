#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('Setting up environment variables...');

// Check if .env file exists in apps/mobile
const envPath = path.join(__dirname, '..', 'apps', 'mobile', '.env');

if (fs.existsSync(envPath)) {
  console.log('Environment file already exists at:', envPath);
  console.log('Please update it with your Supabase credentials if needed.');
} else {
  // Create .env file from .env.example
  const examplePath = path.join(__dirname, '..', 'apps', 'mobile', '.env.example');
  
  if (fs.existsSync(examplePath)) {
    fs.copyFileSync(examplePath, envPath);
    console.log('Created .env file at:', envPath);
    console.log('Please update it with your Supabase credentials.');
  } else {
    // Create new .env file
    const envContent = `# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
`;
    fs.writeFileSync(envPath, envContent);
    console.log('Created .env file at:', envPath);
    console.log('Please update it with your Supabase credentials.');
  }
}

console.log('\nTo get your Supabase credentials:');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to "Project Settings" > "API"');
console.log('3. Copy the Project URL and anon public key');
console.log('4. Paste them in the .env file');