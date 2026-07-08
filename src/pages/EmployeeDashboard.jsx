import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReceivedDaks, getAllDaks, getDakTracking, disposeDak, getDashboardStats } from '../services/dak';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Mail, CheckCircle, FileText, Check, X, AlertCircle, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmployeeDashboard() {
  const { profile } = useAuth();
  
  // Data lists
  const [pendingDaks, setPendingDaks] = useState([]);
  const [disposedDaks, setDisposedDaks] = useState([]);
  const [stats, setStats] = useState({ received: 0, disposed: 0 });

  // UI state
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedDak, setSelectedDak] = useState(null);
  const [supervisorComments, setSupervisorComments] = useState('');
  const [actionReport, setActionReport] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadData = async () => {
    if (!profile) return;

    // Stats
    const st = await getDashboardStats('employee', profile.id);
    setStats(st);

    // Mails received (pending action from this employee)
    const pending = await getReceivedDaks(profile.id);
    setPendingDaks(pending);

    // Mails disposed (we query all disposed daks in system and check if this employee was involved in disposing)
    const all = await getAllDaks();
    // In our simplified mock, all disposed daks with status = 'disposed' were resolved by employee
    const disp = all.filter(d => d.status === 'disposed');
    setDisposedDaks(disp);
  };

  useEffect(() => {
    loadData();
  }, [profile]);

  const handleOpenActionModal = async (dak) => {
    setSelectedDak(dak);
    setErrorMsg('');
    setActionReport('');
    
    // Fetch tracking logs to show the instructions/comments written by the supervisor
    const trackingLogs = await getDakTracking(dak.id);
    const forwardStep = trackingLogs.find(t => t.action === 'forwarded' && t.to_user_id === profile.id);
    if (forwardStep) {
      setSupervisorComments(forwardStep.comments);
    } else {
      setSupervisorComments('कोई विशेष निर्देश दर्ज नहीं हैं।');
    }
  };

  const handleDisposeSubmit = async (e) => {
    e.preventDefault();
    if (!actionReport.trim()) {
      setErrorMsg('कृपया की गई कार्यवाही का विवरण (ATR) दर्ज करें।');
      return;
    }

    setModalLoading(true);
    const { error } = await disposeDak(selectedDak.id, actionReport);
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
          <h1 className="text-2xl font-bold text-slate-800">कर्मचारी / कार्मिक - कार्यक्षेत्र</h1>
          <p className="text-sm text-slate-500">आपको आवंटित की गई डाक पर त्वरित कार्यवाही करें और एक्शन टेकन रिपोर्ट (ATR) दर्ज करें।</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">आवंटित लंबित डाक</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.received}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">निस्तारित की गई डाक</p>
              <h3 className="text-2xl font-extrabold text-slate-800">{stats.disposed}</h3>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="border-b border-slate-200 flex space-x-6">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'pending' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            आवंटित लंबित डाक ({pendingDaks.length})
          </button>
          <button
            onClick={() => setActiveTab('disposed')}
            className={`pb-3 font-semibold text-sm transition-all border-b-2 ${
              activeTab === 'disposed' ? 'border-amber-600 text-amber-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            निस्तारित डाक इतिहास ({disposedDaks.length})
          </button>
        </div>

        {/* Tab Contents */}
        <div className="bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
          {activeTab === 'pending' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-extrabold tracking-wider border-b border-slate-100">
                    <th className="py-3 px-6">रेफ़रन्स नंबर</th>
                    <th className="py-3 px-6">प्रेषक</th>
                    <th className="py-3 px-6">विषय</th>
                    <th className="py-3 px-6">आवंटन तिथि</th>
                    <th className="py-3 px-6 text-center">कार्यवाही</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingDaks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">कार्यवाही हेतु कोई आवंटित डाक लंबित नहीं है।</td>
                    </tr>
                  ) : (
                    pendingDaks.map((dak) => (
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
                            onClick={() => handleOpenActionModal(dak)}
                            className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded shadow transition"
                          >
                            कार्यवाही रिपोर्ट भरें
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
                    <th className="py-3 px-6">निस्तारण तिथि</th>
                    <th className="py-3 px-6 text-center">ट्रैकिंग</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {disposedDaks.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-400 text-xs">निस्तारित की जा चुकी डाक का कोई रिकॉर्ड नहीं मिला।</td>
                    </tr>
                  ) : (
                    disposedDaks.map((dak) => (
                      <tr key={dak.id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-6 font-mono text-xs font-bold text-slate-700">{dak.ref_no}</td>
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-800 text-xs">{dak.sender_name}</div>
                          <div className="text-[10px] text-slate-400">{dak.sender_department}</div>
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-600 max-w-sm truncate" title={dak.subject}>
                          {dak.subject}
                        </td>
                        <td className="py-4 px-6 text-xs text-slate-500">
                          {new Date(dak.updated_at).toLocaleDateString('hi-IN')}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Link
                            to={`/track?ref=${dak.ref_no}`}
                            className="inline-flex items-center space-x-1 text-xs text-amber-600 font-bold hover:underline"
                          >
                            <span>इतिहास देखें</span>
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

        {/* Modal: View Instructions and submit ATR / Mark as Disposed */}
        {selectedDak && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal Header */}
              <div className="police-gradient text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-amber-400" />
                  <h3 className="font-bold">डाक निस्तारण - आख्या प्रस्तुत करें</h3>
                </div>
                <button onClick={() => setSelectedDak(null)} className="text-slate-300 hover:text-white transition">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
                
                {/* Dak Info Card */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs space-y-2">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">रेफरेंस नंबर</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">{selectedDak.ref_no}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-400 uppercase tracking-wider block">प्रेषक</span>
                      <span className="font-semibold text-slate-800 text-sm">{selectedDak.sender_name}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-slate-400 uppercase tracking-wider block">विषय (Subject)</span>
                    <p className="text-slate-700 font-medium text-xs leading-normal">{selectedDak.subject}</p>
                  </div>
                </div>

                {/* Supervisor's Comment Section */}
                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-900 font-bold text-xs uppercase tracking-wider">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <span>प्रभारी अधिकारी द्वारा दिशा-निर्देश:</span>
                  </div>
                  <p className="text-amber-800 text-xs italic leading-relaxed">
                    "{supervisorComments}"
                  </p>
                </div>

                {/* ATR submission Form */}
                <form onSubmit={handleDisposeSubmit} className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-1.5">
                    <MessageSquare className="h-4 w-4 text-green-600" />
                    <h4 className="font-bold text-slate-800 text-sm">कार्यवाही आख्या (Action Taken Report)</h4>
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 bg-red-50 border border-red-200 text-red-800 text-xs rounded-lg">
                      {errorMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">की गई कार्यवाही का विवरण दर्ज करें *</label>
                    <textarea
                      required
                      value={actionReport}
                      onChange={(e) => setActionReport(e.target.value)}
                      placeholder="उदा. आदेशानुसार कार्यालय द्वारा उपकरणों की जांच कर ली गई है। विस्तृत रिपोर्ट पुलिस मुख्यालय को भेज दी गई है।"
                      rows="4"
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
                      className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded-lg transition flex items-center space-x-1"
                    >
                      <Check className="h-3 w-3" />
                      <span>{modalLoading ? 'निस्तारित किया जा रहा है...' : 'निस्तारण पूर्ण करें (Dispose)'}</span>
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
