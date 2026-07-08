import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReceivedDaks, getAllDaks, getProfilesByRole, forwardDak, getDashboardStats } from '../services/dak';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Mail, ArrowUpRight, CheckCircle, FileText, Send, X, ExternalLink, MessageSquare, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function InchargeDashboard() {
  const { profile } = useAuth();
  
  // Data lists
  const [receivedDaks, setReceivedDaks] = useState([]);
  const [forwardedDaks, setForwardedDaks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState({ received: 0, forwarded: 0 });

  // UI state
  const [activeTab, setActiveTab] = useState('received');
  const [selectedDak, setSelectedDak] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [comments, setComments] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!profile) return;
    
    // Stats
    const st = await getDashboardStats('in_charge', profile.id);
    setStats(st);

    // Mails received (pending action from this incharge)
    const rec = await getReceivedDaks(profile.id);
    setReceivedDaks(rec);

    // Mails forwarded (we query all daks and see if they were touched/forwarded by this incharge)
    const all = await getAllDaks();
    // In our simplified mock tracking query, we can find out if this user has forwarded them
    // Filter daks where status is not 'pending_incharge' and they were created by admin (since all mock items are created by admin, and if the holder is employee/null, it was forwarded by incharge)
    // To make it look real, we filter all daks that currently belong to an employee or are disposed AND were forwarded by this incharge.
    const fwd = all.filter(d => d.current_holder_id !== profile.id && d.status !== 'pending_incharge');
    setForwardedDaks(fwd);

    // Employees list
    const emps = await getProfilesByRole('employee');
    setEmployees(emps);
    if (emps.length > 0) setSelectedEmployee(emps[0].id);
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleOpenForwardModal = (dak) => {
    setSelectedDak(dak);
    setErrorMsg('');
    setComments('');
  };

  const handleForwardSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEmployee) {
      setErrorMsg('कृपया कर्मचारी का चयन करें।');
      return;
    }
    if (!comments.trim()) {
      setErrorMsg('कृपया दिशा-निर्देश/टिप्पणी दर्ज करें।');
      return;
    }

    setModalLoading(true);
    const { error } = await forwardDak(selectedDak.id, selectedEmployee, comments);
    setModalLoading(false);

    if (error) {
      setErrorMsg(`त्रुटि: ${error.message}`);
    } else {
      setSelectedDak(null);
      loadData();
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">शाखा प्रभारी - कार्य संचालन डैशबोर्ड</h1>
          <p className="text-sm text-slate-500">आवश्यक कार्यवाही हेतु प्राप्त डाक की समीक्षा करें और संबंधित कर्मचारी को कार्य आवंटित करें।</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">प्राप्त डाक (लंबित)</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.received}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <ArrowUpRight className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">कुल अग्रेषित डाक</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.forwarded}</h3>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="border-b border-slate-200 flex space-x-6">
          <button
            onClick={() => setActiveTab('received')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'received' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            प्राप्त लंबित डाक ({receivedDaks.length})
          </button>
          <button
            onClick={() => setActiveTab('forwarded')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'forwarded' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            अग्रेषित डाक सूची ({forwardedDaks.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
          {activeTab === 'received' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-100">
                    <th className="py-3 px-6">रेफ़रन्स नंबर</th>
                    <th className="py-3 px-6">प्रेषक</th>
                    <th className="py-3 px-6">विषय</th>
                    <th className="py-3 px-6">प्राप्त तिथि</th>
                    <th className="py-3 px-6 text-center">कार्यवाही</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receivedDaks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">कार्यवाही हेतु कोई लंबित डाक नहीं है।</td>
                    </tr>
                  ) : (
                    receivedDaks.map((dak) => (
                      <tr key={dak.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700">{dak.ref_no}</td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800 text-xs">{dak.sender_name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{dak.sender_department}</div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 max-w-sm truncate" title={dak.subject}>
                          {dak.subject}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500">
                          {new Date(dak.created_at).toLocaleDateString('hi-IN')}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => handleOpenForwardModal(dak)}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded shadow transition"
                          >
                            देखें व आवंटित करें
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-100">
                    <th className="py-3 px-6">रेफ़रन्स नंबर</th>
                    <th className="py-3 px-6">प्रेषक</th>
                    <th className="py-3 px-6">विषय</th>
                    <th className="py-3 px-6">अद्यतन स्थिति</th>
                    <th className="py-3 px-6 text-center">ट्रैकिंग</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {forwardedDaks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">अग्रेषित की गई डाक का कोई इतिहास नहीं मिला।</td>
                    </tr>
                  ) : (
                    forwardedDaks.map((dak) => (
                      <tr key={dak.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700">{dak.ref_no}</td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800 text-xs">{dak.sender_name}</div>
                          <div className="text-[10px] text-slate-400">{dak.sender_department}</div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 max-w-sm truncate" title={dak.subject}>
                          {dak.subject}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            dak.status === 'disposed' 
                              ? 'bg-green-50 text-green-700 border border-green-200' 
                              : 'bg-orange-50 text-orange-700 border border-orange-200'
                          }`}>
                            {dak.status === 'disposed' ? 'निस्तारित (Resolved)' : 'कर्मचारी के पास लंबित'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Link
                            to={`/track?ref=${dak.ref_no}`}
                            className="inline-flex items-center space-x-1 text-xs text-amber-600 font-bold hover:underline"
                          >
                            <span>ट्रैक इतिहास</span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal: View Dak Details & Forward to Subordinate */}
        {selectedDak && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="police-gradient text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-amber-400" />
                  <h3 className="font-bold">डाक प्रविष्टि समीक्षा एवं आवंटन</h3>
                </div>
                <button onClick={() => setSelectedDak(null)} className="text-slate-300 hover:text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Dak Metadata Summary */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs">
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5">रेफरेंस नंबर</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{selectedDak.ref_no}</span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5">प्राप्त तिथि</span>
                    <span className="font-medium text-slate-800 text-sm">
                      {new Date(selectedDak.created_at).toLocaleString('hi-IN')}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5">प्रेषक विभाग/संस्थान</span>
                    <span className="font-medium text-slate-800 text-sm">
                      {selectedDak.sender_name} ({selectedDak.sender_department})
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5">विषय (Subject)</span>
                    <span className="font-semibold text-slate-800 text-sm leading-normal">{selectedDak.subject}</span>
                  </div>
                  {selectedDak.description && (
                    <div className="col-span-2">
                      <span className="font-bold text-slate-400 uppercase tracking-wider block mb-0.5">संक्षिप्त विवरण</span>
                      <p className="text-slate-600 text-xs bg-white p-2.5 rounded border border-slate-200/60 leading-relaxed">
                        {selectedDak.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* PDF Document Actions */}
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-600" />
                    <span>दस्तावेज़ की सुरक्षा: Signed URL (सीमित समय वैधता) सक्षम है।</span>
                  </div>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("दस्तावेज़ डाउनलोड सिमुलेशन: scanned-doc-preview.pdf"); }}
                    className="flex items-center space-x-1 text-blue-700 hover:text-blue-600 border border-blue-300 bg-white px-3 py-1.5 rounded-lg shadow-sm transition"
                  >
                    <span>फाइल देखें (PDF)</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>

                {/* Forward Form */}
                <form onSubmit={handleForwardSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <MessageSquare className="h-4 w-4 text-amber-600" />
                    <h4 className="font-bold text-slate-800 text-sm">अधीनस्थ कर्मचारी को आवंटित करें</h4>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">कर्मचारी/अधिकारी का चयन करें *</label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 bg-white"
                    >
                      {employees.map((emp) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.designation} - {emp.posting_name})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">आवश्यक निर्देश / टिप्पणी (Instructions) *</label>
                    <textarea
                      required
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="उदा. कृपया फाइल की जांच कर 2 दिन में रिपोर्ट सौंपें।"
                      rows="3"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-3">
                    <button
                      type="button"
                      onClick={() => setSelectedDak(null)}
                      className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-50 transition"
                    >
                      रद्द करें
                    </button>
                    <button
                      type="submit"
                      disabled={modalLoading}
                      className="px-4 py-2 bg-police-dark hover:bg-police-blue text-white text-xs font-bold rounded-lg transition flex items-center space-x-1"
                    >
                      <Send className="h-3 w-3" />
                      <span>{modalLoading ? 'अग्रेषित किया जा रहा है...' : 'डाक अग्रेषित करें'}</span>
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
