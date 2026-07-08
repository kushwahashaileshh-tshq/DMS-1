import { supabase } from './supabase';

const isPlaceholder = !import.meta.env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL.includes('placeholder');

// --- Mock Database for Offline/Local Testing ---
const MOCK_PROFILES_LIST = [
  { id: 'admin-uuid', name: 'राम प्रकाश', role: 'admin', designation: 'प्रशासक (डाक शाखा)', posting_level: 'hq', posting_name: 'तकनीकी सेवा मुख्यालय' },
  { id: 'incharge-uuid', name: 'के. पी. सिंह', role: 'in_charge', designation: 'शाखा प्रभारी (तकनीकी)', posting_level: 'hq', posting_name: 'तकनीकी सेवा मुख्यालय' },
  { id: 'employee-uuid', name: 'अमित कुमार', role: 'employee', designation: 'मुख्य आरक्षी (कम्प्यूटर)', posting_level: 'hq', posting_name: 'तकनीकी सेवा मुख्यालय' }
];

const INITIAL_DAKS = [
  {
    id: 'dak-1',
    ref_no: 'DAK/2026/0001',
    sender_name: 'पुलिस मुख्यालय, लखनऊ',
    sender_department: 'आईटी सेल',
    subject: 'नये साइबर पुलिस स्टेशनों के बुनियादी ढांचे के संबंध में',
    description: 'कृपया नये साइबर पुलिस थानों हेतु आवश्यक नेटवर्किंग उपकरणों की समीक्षा करें।',
    file_url: '#',
    current_holder_id: 'incharge-uuid',
    created_by: 'admin-uuid',
    status: 'pending_incharge',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'dak-2',
    ref_no: 'DAK/2026/0002',
    sender_name: 'रेंज मुख्यालय, कानपुर',
    sender_department: 'तकनीकी विंग',
    subject: 'सीसीटीवी कैमरा स्थापना रिपोर्ट',
    description: 'रेंज के मुख्य चौराहों पर लगाये गये सीसीटीवी कैमरों की अद्यतन स्थिति रिपोर्ट।',
    file_url: '#',
    current_holder_id: 'employee-uuid',
    created_by: 'admin-uuid',
    status: 'pending_employee',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 86400000).toISOString()
  }
];

const INITIAL_TRACKING = [
  {
    id: 'track-1',
    dak_id: 'dak-1',
    from_user_id: 'admin-uuid',
    to_user_id: 'incharge-uuid',
    action: 'received',
    comments: 'डाक प्राप्त एवं प्रविष्टि की गई। प्रभारी अधिकारी को अग्रेषित।',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'track-2',
    dak_id: 'dak-2',
    from_user_id: 'admin-uuid',
    to_user_id: 'incharge-uuid',
    action: 'received',
    comments: 'डाक प्रविष्टि की गई।',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'track-3',
    dak_id: 'dak-2',
    from_user_id: 'incharge-uuid',
    to_user_id: 'employee-uuid',
    action: 'forwarded',
    comments: 'अमित, कृपया सीसीटीवी कैमरों की चालू/बंद स्थिति जांच कर 24 घंटे में आख्या दें।',
    created_at: new Date(Date.now() - 86400000).toISOString()
  }
];

// Initialize Mock Local Storage if empty
if (isPlaceholder) {
  if (!localStorage.getItem('dms_daks')) {
    localStorage.setItem('dms_daks', JSON.stringify(INITIAL_DAKS));
  }
  if (!localStorage.getItem('dms_tracking')) {
    localStorage.setItem('dms_tracking', JSON.stringify(INITIAL_TRACKING));
  }
}

const getMockData = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const saveMockData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// --- API Helpers ---

// Get profiles list by role (for dropdown select options)
export const getProfilesByRole = async (role) => {
  if (isPlaceholder) {
    return MOCK_PROFILES_LIST.filter(p => p.role === role);
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', role);
  return error ? [] : data;
};

// Upload new Dak (Admin / Dak Branch)
export const uploadDak = async (dakData) => {
  if (isPlaceholder) {
    const daks = getMockData('dms_daks');
    const tracking = getMockData('dms_tracking');
    
    const newDak = {
      id: 'dak-' + Math.random().toString(36).substr(2, 9),
      ref_no: 'DAK/2026/' + String(daks.length + 1).padStart(4, '0'),
      sender_name: dakData.sender_name,
      sender_department: dakData.sender_department,
      subject: dakData.subject,
      description: dakData.description || '',
      file_url: dakData.file_url || '#',
      current_holder_id: dakData.to_user_id,
      created_by: 'admin-uuid',
      status: 'pending_incharge',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const newTrack = {
      id: 'track-' + Math.random().toString(36).substr(2, 9),
      dak_id: newDak.id,
      from_user_id: 'admin-uuid',
      to_user_id: dakData.to_user_id,
      action: 'received',
      comments: 'डाक प्राप्त एवं प्रविष्टि की गई। प्रभारी अधिकारी को अग्रेषित।',
      created_at: new Date().toISOString()
    };

    daks.push(newDak);
    tracking.push(newTrack);
    saveMockData('dms_daks', daks);
    saveMockData('dms_tracking', tracking);
    
    return { data: newDak, error: null };
  }

  // Supabase implementation
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: dak, error: dakError } = await supabase
      .from('dak_master')
      .insert({
        ref_no: 'DAK/2026/' + Math.floor(1000 + Math.random() * 9000), // In real cases, use sequence or DB side code
        sender_name: dakData.sender_name,
        sender_department: dakData.sender_department,
        subject: dakData.subject,
        description: dakData.description,
        file_url: dakData.file_url,
        current_holder_id: dakData.to_user_id,
        created_by: user.id,
        status: 'pending_incharge'
      })
      .select()
      .single();

    if (dakError) throw dakError;

    // Add tracking step
    const { error: trackError } = await supabase
      .from('dak_tracking')
      .insert({
        dak_id: dak.id,
        from_user_id: user.id,
        to_user_id: dakData.to_user_id,
        action: 'received',
        comments: 'डाक प्रविष्टि एवं अग्रेषित की गई।'
      });

    if (trackError) throw trackError;
    return { data: dak, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
};

// Forward Dak to Subordinate (In-charge)
export const forwardDak = async (dakId, toUserId, comments) => {
  if (isPlaceholder) {
    const daks = getMockData('dms_daks');
    const tracking = getMockData('dms_tracking');
    
    const dakIndex = daks.findIndex(d => d.id === dakId);
    if (dakIndex === -1) return { error: { message: 'डाक नहीं मिली!' } };
    
    daks[dakIndex].current_holder_id = toUserId;
    daks[dakIndex].status = 'pending_employee';
    daks[dakIndex].updated_at = new Date().toISOString();
    
    const newTrack = {
      id: 'track-' + Math.random().toString(36).substr(2, 9),
      dak_id: dakId,
      from_user_id: 'incharge-uuid',
      to_user_id: toUserId,
      action: 'forwarded',
      comments: comments,
      created_at: new Date().toISOString()
    };
    
    tracking.push(newTrack);
    saveMockData('dms_daks', daks);
    saveMockData('dms_tracking', tracking);
    
    return { error: null };
  }

  // Supabase implementation
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error: dakUpdateError } = await supabase
      .from('dak_master')
      .update({
        current_holder_id: toUserId,
        status: 'pending_employee'
      })
      .eq('id', dakId);

    if (dakUpdateError) throw dakUpdateError;

    const { error: trackError } = await supabase
      .from('dak_tracking')
      .insert({
        dak_id: dakId,
        from_user_id: user.id,
        to_user_id: toUserId,
        action: 'forwarded',
        comments: comments
      });

    if (trackError) throw trackError;
    return { error: null };
  } catch (err) {
    return { error: err };
  }
};

// Dispose Dak (Employee)
export const disposeDak = async (dakId, actionReport) => {
  if (isPlaceholder) {
    const daks = getMockData('dms_daks');
    const tracking = getMockData('dms_tracking');
    
    const dakIndex = daks.findIndex(d => d.id === dakId);
    if (dakIndex === -1) return { error: { message: 'डाक नहीं मिली!' } };
    
    daks[dakIndex].current_holder_id = null;
    daks[dakIndex].status = 'disposed';
    daks[dakIndex].updated_at = new Date().toISOString();
    
    const newTrack = {
      id: 'track-' + Math.random().toString(36).substr(2, 9),
      dak_id: dakId,
      from_user_id: 'employee-uuid',
      to_user_id: null,
      action: 'disposed',
      comments: actionReport,
      created_at: new Date().toISOString()
    };
    
    tracking.push(newTrack);
    saveMockData('dms_daks', daks);
    saveMockData('dms_tracking', tracking);
    
    return { error: null };
  }

  // Supabase implementation
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const { error: dakUpdateError } = await supabase
      .from('dak_master')
      .update({
        current_holder_id: null,
        status: 'disposed'
      })
      .eq('id', dakId);

    if (dakUpdateError) throw dakUpdateError;

    const { error: trackError } = await supabase
      .from('dak_tracking')
      .insert({
        dak_id: dakId,
        from_user_id: user.id,
        to_user_id: null,
        action: 'disposed',
        comments: actionReport
      });

    if (trackError) throw trackError;
    return { error: null };
  } catch (err) {
    return { error: err };
  }
};

// Get Received/Pending Daks for a specific role/holder
export const getReceivedDaks = async (userId) => {
  if (isPlaceholder) {
    const daks = getMockData('dms_daks');
    return daks.filter(d => d.current_holder_id === userId && d.status !== 'disposed');
  }

  const { data, error } = await supabase
    .from('dak_master')
    .select('*')
    .eq('current_holder_id', userId)
    .neq('status', 'disposed');
  return error ? [] : data;
};

// Get all daks in system (for search/admin tracking)
export const getAllDaks = async () => {
  if (isPlaceholder) {
    return getMockData('dms_daks');
  }
  const { data, error } = await supabase
    .from('dak_master')
    .select('*')
    .order('created_at', { ascending: false });
  return error ? [] : data;
};

// Get tracking logs for a specific Dak
export const getDakTracking = async (dakId) => {
  if (isPlaceholder) {
    const tracking = getMockData('dms_tracking');
    // Map with profile details
    return tracking
      .filter(t => t.dak_id === dakId)
      .map(t => {
        const fromUser = MOCK_PROFILES_LIST.find(p => p.id === t.from_user_id);
        const toUser = MOCK_PROFILES_LIST.find(p => p.id === t.to_user_id);
        return {
          ...t,
          from_user: fromUser || { name: 'सिस्टम' },
          to_user: toUser || null
        };
      })
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  }

  const { data, error } = await supabase
    .from('dak_tracking')
    .select(`
      *,
      from_user:profiles!from_user_id(*),
      to_user:profiles!to_user_id(*)
    `)
    .eq('dak_id', dakId)
    .order('created_at', { ascending: true });
  return error ? [] : data;
};

// Dashboard analytics stats
export const getDashboardStats = async (role, userId) => {
  if (isPlaceholder) {
    const daks = getMockData('dms_daks');
    const tracking = getMockData('dms_tracking');
    
    if (role === 'admin') {
      const total = daks.length;
      const pendingIncharge = daks.filter(d => d.status === 'pending_incharge').length;
      const pendingEmployee = daks.filter(d => d.status === 'pending_employee').length;
      const disposed = daks.filter(d => d.status === 'disposed').length;
      return { total, pendingIncharge, pendingEmployee, disposed };
    }
    
    if (role === 'in_charge') {
      // Received by this incharge (currently pending with them)
      const received = daks.filter(d => d.current_holder_id === userId && d.status === 'pending_incharge').length;
      // Forwarded by this incharge to subordinates (we check tracking entries from this incharge)
      const forwardedIds = new Set(tracking.filter(t => t.from_user_id === userId && t.action === 'forwarded').map(t => t.dak_id));
      const totalForwarded = forwardedIds.size;
      return { received, forwarded: totalForwarded };
    }
    
    if (role === 'employee') {
      // Received by this employee (currently pending)
      const received = daks.filter(d => d.current_holder_id === userId && d.status === 'pending_employee').length;
      // Disposed by this employee
      const disposed = daks.filter(d => d.status === 'disposed' && tracking.some(t => t.from_user_id === userId && t.action === 'disposed')).length;
      return { received, disposed };
    }
  }

  // Supabase queries for stats can be run using custom procedures or multiple queries.
  // Here we write a basic implementation
  try {
    if (role === 'admin') {
      const { count: total } = await supabase.from('dak_master').select('*', { count: 'exact', head: true });
      const { count: pendingIncharge } = await supabase.from('dak_master').select('*', { count: 'exact', head: true }).eq('status', 'pending_incharge');
      const { count: pendingEmployee } = await supabase.from('dak_master').select('*', { count: 'exact', head: true }).eq('status', 'pending_employee');
      const { count: disposed } = await supabase.from('dak_master').select('*', { count: 'exact', head: true }).eq('status', 'disposed');
      return { total: total || 0, pendingIncharge: pendingIncharge || 0, pendingEmployee: pendingEmployee || 0, disposed: disposed || 0 };
    }
    
    if (role === 'in_charge') {
      const { count: received } = await supabase.from('dak_master').select('*', { count: 'exact', head: true }).eq('current_holder_id', userId).eq('status', 'pending_incharge');
      const { data: fRecords } = await supabase.from('dak_tracking').select('dak_id').eq('from_user_id', userId).eq('action', 'forwarded');
      const forwarded = fRecords ? new Set(fRecords.map(f => f.dak_id)).size : 0;
      return { received: received || 0, forwarded };
    }

    if (role === 'employee') {
      const { count: received } = await supabase.from('dak_master').select('*', { count: 'exact', head: true }).eq('current_holder_id', userId).eq('status', 'pending_employee');
      const { count: disposed } = await supabase.from('dak_master').select('*', { count: 'exact', head: true }).eq('status', 'disposed').eq('current_holder_id', null);
      // More accurate: query tracking to see where this employee is the one who disposed it
      return { received: received || 0, disposed: disposed || 0 };
    }
  } catch (err) {
    console.error('Error fetching dashboard stats', err);
  }
  return { received: 0, forwarded: 0, disposed: 0, total: 0 };
};
