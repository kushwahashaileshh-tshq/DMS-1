import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllDaks, getDakTracking } from '../services/dak';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { Search, MapPin, Calendar, FileText, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';

export default function SearchTrack() {
  const { profile } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Search parameters/inputs
  const [searchQuery, setSearchQuery] = useState('');
  const [daksList, setDaksList] = useState([]);
  const [selectedDak, setSelectedDak] = useState(null);
  const [trackingHistory, setTrackingHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadInitialData = async () => {
    setLoading(true);
    const daks = await getAllDaks();
    setDaksList(daks);
    setLoading(false);

    // If query string contains ?ref=xxxx, auto select/search it
    const refParam = searchParams.get('ref');
    if (refParam) {
      setSearchQuery(refParam);
      const match = daks.find(d => d.ref_no.toLowerCase() === refParam.toLowerCase());
      if (match) {
        handleSelectDak(match);
      }
    }
  };

  useEffect(() => {
    loadInitialData();
  }, [searchParams]);

  const handleSelectDak = async (dak) => {
    setSelectedDak(dak);
    setLoading(true);
    const history = await getDakTracking(dak.id);
    setTrackingHistory(history);
    setLoading(false);
  };

  const filteredDaks = daksList.filter(d => 
    d.ref_no.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.sender_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-800">डाक ट्रैकिंग एवं खोज सेवा</h1>
          <p className="text-sm text-slate-500">रेफ़रन्स नंबर, विषय या प्रेषक द्वारा डाक खोजें और उसके संचलन की पूरी समयरेखा (Timeline) देखें।</p>
        </div>

        {/* Search Input Bar */}
        <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-sm flex items-center space-x-3">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="रेफ़रन्स नंबर दर्ज करें या विषय खोजें... (उदा. DAK/2026/0001)"
            className="flex-1 text-sm bg-transparent outline-none placeholder-slate-400 text-slate-800"
          />
          {searchQuery && (
            <button 
              onClick={() => { setSearchQuery(''); setSelectedDak(null); }}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600"
            >
              साफ़ करें
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Search Results List */}
          <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden flex flex-col h-[550px]">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">परिणाम ({filteredDaks.length})</span>
              {loading && <RefreshCw className="h-3 w-3 text-amber-600 animate-spin" />}
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {filteredDaks.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">कोई डाक मेल नहीं खाती।</div>
              ) : (
                filteredDaks.map(dak => (
                  <button
                    key={dak.id}
                    onClick={() => handleSelectDak(dak)}
                    className={`w-full text-left p-4 hover:bg-slate-50 transition flex justify-between items-start ${
                      selectedDak?.id === dak.id ? 'bg-amber-50/40 border-l-4 border-amber-600' : ''
                    }`}
                  >
                    <div className="space-y-1 pr-2">
                      <span className="font-mono text-xs font-bold text-slate-700 block">{dak.ref_no}</span>
                      <span className="font-bold text-slate-800 text-xs block line-clamp-1">{dak.subject}</span>
                      <span className="text-[10px] text-slate-400 font-medium block">{dak.sender_name}</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                      dak.status === 'disposed' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : dak.status === 'pending_employee' 
                        ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {dak.status === 'disposed' ? 'निस्तारित' : dak.status === 'pending_employee' ? 'कर्मचारी' : 'प्रभारी'}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Timeline View Panel */}
          <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-xl p-6 shadow-sm flex flex-col h-[550px]">
            {selectedDak ? (
              <div className="flex flex-col h-full overflow-hidden">
                {/* Selected Dak Header */}
                <div className="pb-4 mb-4 border-b border-slate-100 shrink-0">
                  <div className="flex items-center justify-between">
                    <h2 className="font-bold text-slate-800 text-base">{selectedDak.subject}</h2>
                    <span className="font-mono font-bold text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                      {selectedDak.ref_no}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3 text-amber-600" />
                      <span>प्रेषक: {selectedDak.sender_name} ({selectedDak.sender_department})</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-amber-600" />
                      <span>दिनांक: {new Date(selectedDak.created_at).toLocaleDateString('hi-IN')}</span>
                    </span>
                  </div>
                </div>

                {/* Vertical Timeline container */}
                <div className="flex-1 overflow-y-auto pr-2 py-4">
                  <div className="relative border-l-2 border-slate-200 pl-6 ml-3 space-y-8">
                    {trackingHistory.map((step, idx) => (
                      <div key={step.id} className="relative">
                        {/* Timeline Icon Node */}
                        <span className={`absolute -left-[35px] top-0 p-1.5 rounded-full border-2 bg-white ${
                          step.action === 'disposed' 
                            ? 'border-green-600 text-green-600' 
                            : step.action === 'forwarded'
                            ? 'border-orange-500 text-orange-500'
                            : 'border-blue-600 text-blue-600'
                        }`}>
                          {step.action === 'disposed' ? (
                            <CheckCircle2 className="h-3.5 w-3.5 fill-green-50" />
                          ) : (
                            <FileText className="h-3.5 w-3.5 fill-slate-50" />
                          )}
                        </span>

                        {/* Timeline Step Content */}
                        <div className="space-y-1 bg-slate-50 border border-slate-200/50 p-4 rounded-xl shadow-sm">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-xs font-bold text-slate-800">
                                {step.from_user?.name || 'सिस्टम'} ({step.from_user?.designation})
                              </span>
                              {step.to_user && (
                                <span className="text-xs text-slate-500 block mt-0.5">
                                  ← {step.to_user.name} ({step.to_user.designation}) को अग्रेषित
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {new Date(step.created_at).toLocaleString('hi-IN')}
                            </span>
                          </div>
                          
                          {/* Comments */}
                          {step.comments && (
                            <p className="text-xs text-slate-600 pt-2 border-t border-slate-200/40 italic leading-relaxed">
                              "{step.comments}"
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-slate-400">
                <FileText className="h-16 w-16 text-slate-300 stroke-1 mb-3" />
                <h3 className="font-semibold text-sm">डाक का चयन करें</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs text-center leading-relaxed">
                  बाएं पैनल की सूची में से किसी डाक पर क्लिक करें या सर्च बार में रेफ़रन्स नंबर डालकर सर्च करें।
                </p>
              </div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
