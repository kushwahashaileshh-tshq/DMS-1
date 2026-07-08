import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { uploadDak, getAllDaks, getProfilesByRole, getDashboardStats } from '../services/dak';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { PlusCircle, List, CheckCircle, Clock, AlertTriangle, FileText, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { profile } = useAuth();
  
  // Form State
  const [senderName, setSenderName] = useState('');
  const [senderDept, setSenderDept] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedIncharge, setSelectedIncharge] = useState('');
  const [fileAttached, setFileAttached] = useState(false);
  
  // Data States
  const [incharges, setIncharges] = useState([]);
  const [recentDaks, setRecentDaks] = useState([]);
  const [stats, setStats] = useState({ total: 0, pendingIncharge: 0, pendingEmployee: 0, disposed: 0 });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    if (!profile) return;
    const inchs = await getProfilesByRole('in_charge');
    setIncharges(inchs);
    if (inchs.length > 0) setSelectedIncharge(inchs[0].id);

    const daks = await getAllDaks();
    setRecentDaks(daks.slice(0, 5));

    const st = await getDashboardStats('admin', profile.id);
    setStats(st);
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedIncharge) {
      setMessage({ type: 'error', text: 'कृपया एक प्रभारी अधिकारी का चयन करें।' });
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    const { error } = await uploadDak({
      sender_name: senderName,
      sender_department: senderDept,
      subject: subject,
      description: description,
      file_url: fileAttached ? '/scanned-dak-doc.pdf' : '#', // Mock PDF location
      to_user_id: selectedIncharge
    });

    setLoading(false);

    if (error) {
      setMessage({ type: 'error', text: `त्रुटि: ${error.message}` });
    } else {
      setMessage({ type: 'success', text: 'डाक सफलतापूर्वक पंजीकृत की गई और संबंधित प्रभारी को अग्रेषित कर दी गई!' });
      // Reset Form
      setSenderName('');
      setSenderDept('');
      setSubject('');
      setDescription('');
      setFileAttached(false);
      loadData();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">डाक शाखा - प्रशासनिक डैशबोर्ड</h1>
          <p className="text-sm text-slate-500">नयी डाक प्रविष्टियाँ दर्ज करें और समस्त विभाग में डाक संचलन की स्थिति देखें।</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">कुल प्राप्त डाक</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.total}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">प्रभारी के पास लंबित</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.pendingIncharge}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">अधीनस्थ के पास लंबित</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.pendingEmployee}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">कुल निस्तारित</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.disposed}</h3>
            </div>
          </div>
        </div>

        {/* Main Grid: Form and Recent List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* New Entry Form */}
          <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm">
            <div className="flex items-center space-x-2 pb-4 mb-4 border-b border-slate-100">
              <PlusCircle className="h-5 w-5 text-amber-600" />
              <h2 className="font-bold text-slate-800">नई डाक प्रविष्टि और अग्रेषण</h2>
            </div>

            {message.text && (
              <div className={`p-3 rounded-lg text-sm mb-4 border ${
                message.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">प्रेषक का नाम (Sender Name) *</label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="उदा. SP"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">प्रेषक विभाग/जनपद *</label>
                <input
                  type="text"
                  required
                  value={senderDept}
                  onChange={(e) => setSenderDept(e.target.value)}
                  placeholder="उदा. DIG MEERUT"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">डाक का विषय (Subject) *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="उदा. CCTV REPORT"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">विवरण (Description)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="अन्य आवश्यक विवरण लिखें..."
                  rows="2"
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">दस्तावेज़ स्कैनिंग (PDF Upload Simulation)</label>
                <div className="flex items-center space-x-3 mt-1">
                  <button
                    type="button"
                    onClick={() => setFileAttached(!fileAttached)}
                    className={`w-full py-1.5 border rounded-lg text-[11px] font-semibold transition ${
                      fileAttached 
                        ? 'bg-green-600 text-white border-green-600' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-300'
                    }`}
                  >
                    {fileAttached ? '✓ फ़ाइल स्कैन हो गई (scanned-doc.pdf)' : 'फाइल स्कैन और संलग्न करें'}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">सम्बंधित प्रभारी अधिकारी का चयन *</label>
                <select
                  value={selectedIncharge}
                  onChange={(e) => setSelectedIncharge(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                >
                  {incharges.map((inch) => (
                    <option key={inch.id} value={inch.id}>
                      {inch.name} ({inch.designation} - {inch.posting_name})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-police-dark text-white font-bold rounded-lg hover:bg-police-blue transition duration-200 flex items-center justify-center space-x-1 cursor-pointer mt-2"
              >
                <span>{loading ? 'दर्ज की जा रही है...' : 'डाक दर्ज और अग्रेषित करें'}</span>
              </button>
            </form>
          </div>

          {/* Recent Daks List */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <List className="h-5 w-5 text-amber-600" />
                <h2 className="font-bold text-slate-800">हाल ही में प्रविष्ट की गई डाक</h2>
              </div>
              <Link to="/track" className="text-xs text-amber-600 font-bold hover:underline">
                सभी देखें →
              </Link>
            </div>

            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-100">
                    <th className="py-3 px-4">रेफ़रन्स नंबर</th>
                    <th className="py-3 px-4">प्रेषक</th>
                    <th className="py-3 px-4">विषय</th>
                    <th className="py-3 px-4">स्थिति</th>
                    <th className="py-3 px-4 text-center">कार्यवाही</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentDaks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400 text-xs">कोई डाक रिकॉर्ड नहीं मिला।</td>
                    </tr>
                  ) : (
                    recentDaks.map((dak) => (
                      <tr key={dak.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-slate-700">{dak.ref_no}</td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 text-xs">{dak.sender_name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{dak.sender_department}</div>
                        </td>
                        <td className="py-3.5 px-4 text-xs font-medium text-slate-600 max-w-xs truncate" title={dak.subject}>
                          {dak.subject}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            dak.status === 'disposed' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : dak.status === 'pending_employee' 
                              ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {dak.status === 'disposed' ? 'निस्तारित' : dak.status === 'pending_employee' ? 'कर्मचारी के पास' : 'प्रभारी के पास'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Link
                            to={`/track?ref=${dak.ref_no}`}
                            className="inline-flex items-center space-x-1 text-xs text-amber-600 font-bold hover:text-amber-500"
                          >
                            <span>ट्रैक</span>
                            <ChevronRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
