import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  if (line.includes('=')) {
    const [key, ...rest] = line.split('=');
    envVars[key.trim()] = rest.join('=').trim();
  }
});

const supabaseUrl = envVars['VITE_SUPABASE_URL'];
const supabaseAnonKey = envVars['VITE_SUPABASE_ANON_KEY'];

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log("Attempting login...");
  try {
    const { data, error } = await supabase.auth.signUp({
      email: 'test_auth_check@police.gov.in',
      password: 'password123'
    });

    if (error) {
      console.error("\n=== LOGIN ERROR ===");
      console.error("Message:", error.message);
      console.error("Full Error Object:", JSON.stringify(error, null, 2));
      process.exit(1);
    }

    console.log("✅ Login successful for:", data.user.email);
    
    // Now test fetching profile
    console.log("Fetching profile...");
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error("\n=== PROFILE ERROR ===");
      console.error("Message:", profileError.message);
      console.error("Full Error Object:", JSON.stringify(profileError, null, 2));
      process.exit(1);
    }

    console.log("✅ Profile fetched successfully:", profile.name);
    console.log("All tests passed!");
    
  } catch (err) {
    console.error("\n=== UNEXPECTED EXCEPTION ===");
    console.error(err);
  }
}

testLogin();
