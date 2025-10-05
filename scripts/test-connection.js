#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');

if (!supabaseUrl) {
  console.error('❌ Missing SUPABASE_URL environment variable');
  process.exit(1);
}

if (!supabaseAnonKey) {
  console.error('❌ Missing SUPABASE_ANON_KEY environment variable');
  process.exit(1);
}

console.log('✅ Environment variables found');
console.log('Supabase URL:', supabaseUrl);

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test a simple query to check connection
    const { data, error } = await supabase
      .from('users')
      .select('count()', { count: 'exact' })
      .limit(1);

    if (error) {
      console.log('❌ Connection test failed:', error.message);
      console.log('This might be expected if the table doesn\'t exist yet.');
      return false;
    }

    console.log('✅ Connection successful!');
    console.log('Users table count query result:', data);
    return true;
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('\n🎉 Your Supabase connection is working!');
  } else {
    console.log('\n⚠️  Connection test failed. Please check your configuration.');
  }
});