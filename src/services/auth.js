import { supabase } from './supabase';

const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

const MOCK_PROFILES = {
  'admin@police.gov.in': { id: 'admin-uuid', name: 'राम प्रकाश', role: 'admin', designation: 'प्रशासक (डाक शाखा)', posting_level: 'hq', posting_name: 'तकनीकी सेवा मुख्यालय' },
  'incharge@police.gov.in': { id: 'incharge-uuid', name: 'के. पी. सिंह', role: 'in_charge', designation: 'शाखा प्रभारी (तकनीकी)', posting_level: 'hq', posting_name: 'तकनीकी सेवा मुख्यालय' },
  'employee@police.gov.in': { id: 'employee-uuid', name: 'अमित कुमार', role: 'employee', designation: 'मुख्य आरक्षी (कम्प्यूटर)', posting_level: 'hq', posting_name: 'तकनीकी सेवा मुख्यालय' }
};

export const login = async (email, password) => {
  if (isPlaceholder) {
    const profile = MOCK_PROFILES[email];
    if (profile && password === 'password') {
      const mockSession = { email, profile, id: profile.id };
      localStorage.setItem('dms_session', JSON.stringify(mockSession));
      return { data: { user: mockSession, profile }, error: null };
    }
    return { data: null, error: { message: 'अमान्य लॉगिन क्रेडेंशियल (पासवर्ड "password" है)' } };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();
      
    if (profileError) throw profileError;
    return { data: { user: data.user, profile }, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

export const logout = async () => {
  if (isPlaceholder) {
    localStorage.removeItem('dms_session');
    return { error: null };
  }
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (isPlaceholder) {
    const session = localStorage.getItem('dms_session');
    if (session) {
      const profile = JSON.parse(session).profile;
      return { user: profile, profile, error: null };
    }
    return { user: null, profile: null, error: null };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, profile: null, error: null };
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (profileError) throw profileError;
    return { user, profile, error: null };
  } catch (err) {
    return { user: null, profile: null, error: err };
  }
};
