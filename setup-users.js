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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const usersToCreate = [
  {
    email: 'admin_tsb@police.gov.in',
    password: 'password',
    profile: {
      name: 'राम प्रकाश',
      role: 'admin',
      designation: 'प्रशासक (डाक शाखा)',
      posting_level: 'hq',
      posting_name: 'तकनीकी सेवा मुख्यालय'
    }
  },
  {
    email: 'incharge_tsb@police.gov.in',
    password: 'password',
    profile: {
      name: 'के. पी. सिंह',
      role: 'in_charge',
      designation: 'शाखा प्रभारी (तकनीकी)',
      posting_level: 'hq',
      posting_name: 'तकनीकी सेवा मुख्यालय'
    }
  },
  {
    email: 'employee_tsb@police.gov.in',
    password: 'password',
    profile: {
      name: 'अमित कुमार',
      role: 'employee',
      designation: 'मुख्य आरक्षी (कम्प्यूटर)',
      posting_level: 'hq',
      posting_name: 'तकनीकी सेवा मुख्यालय'
    }
  }
];

async function setupUsers() {
  console.log("Setting up users via Supabase API...");
  
  for (const u of usersToCreate) {
    console.log(`\nCreating user: ${u.email}`);
    
    // 1. Sign up the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: u.email,
      password: u.password
    });
    
    if (authError) {
      console.error(`Failed to sign up ${u.email}:`, authError.message);
      continue;
    }
    
    const userId = authData.user.id;
    console.log(`✅ Auth user created. ID: ${userId}`);
    
    // 2. Wait a moment to ensure session is active
    await new Promise(r => setTimeout(r, 1000));
    
    // 3. Insert profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      ...u.profile
    });
    
    if (profileError) {
      console.error(`Failed to create profile for ${u.email}:`, profileError.message);
      continue;
    }
    
    console.log(`✅ Profile created for ${u.email}`);
    
    // Sign out before creating next user
    await supabase.auth.signOut();
  }
  
  console.log("\nSetup complete! You can now log in with the new '_tsb' emails.");
}

setupUsers();
