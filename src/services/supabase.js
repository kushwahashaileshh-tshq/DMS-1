import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const isRealSupabase = supabaseUrl && !supabaseUrl.includes('placeholder') && supabaseUrl.startsWith('http');

// Only create a real Supabase client when valid credentials are provided.
// Otherwise export a safe stub so the app runs in mock/demo mode without crashing.
export const supabase = isRealSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : {
      auth: {
        signInWithPassword: async () => ({ data: null, error: { message: 'Mock mode' } }),
        signOut: async () => ({ error: null }),
        getUser: async () => ({ data: { user: null } }),
      },
      from: () => ({
        select: () => ({ eq: () => ({ single: async () => ({ data: null, error: null }) }) }),
        insert: async () => ({ data: null, error: null }),
        update: async () => ({ data: null, error: null }),
      }),
    };
