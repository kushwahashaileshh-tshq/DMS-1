import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    
    if (success) {
      // Check role and redirect
      if (email.includes('admin')) navigate('/admin');
      else if (email.includes('incharge')) navigate('/incharge');
      else if (email.includes('employee')) navigate('/employee');
      else navigate('/track');
    }
  };

  const handleQuickLogin = async (mockEmail) => {
    setEmail(mockEmail);
    setPassword('password');
    setLoading(true);
    const success = await login(mockEmail, 'password');
    setLoading(false);
    if (success) {
      if (mockEmail.includes('admin')) navigate('/admin');
      else if (mockEmail.includes('incharge')) navigate('/incharge');
      else navigate('/employee');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 relative overflow-hidden font-sans">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-900/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-900/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-slate-800/90 border border-slate-700/50 rounded-2xl shadow-2xl p-8 backdrop-blur-md relative z-10">
        
        {/* Emblem & Portal Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-slate-950/80 rounded-full border border-amber-500/30 mb-3 shadow-lg">
            <Shield className="h-12 w-12 text-amber-500 fill-amber-500/10" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">डाक संचालन प्रणाली</h1>
          <p className="text-xs text-amber-400 font-semibold tracking-wider mt-1 uppercase">UP Police | Technical Services Branch</p>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/30 p-3 rounded-lg flex items-start space-x-2 text-red-200 text-sm">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">ईमेल आईडी (Login ID)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Mail className="h-4 w-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="email@police.gov.in"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">पासवर्ड (Password)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Lock className="h-4 w-4" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-950/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-amber-600/10 flex items-center justify-center space-x-2 transition duration-200"
          >
            <span>{loading ? 'लॉगिन किया जा रहा है...' : 'प्रवेश करें (Login)'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Quick Mock Logins helper */}
        <div className="mt-8 pt-6 border-t border-slate-700/50">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">त्वरित लॉगिन (Mock Logins)</h2>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleQuickLogin('admin@police.gov.in')}
              className="py-2 px-1 text-[11px] bg-slate-950/50 hover:bg-slate-900 border border-slate-700 rounded text-slate-300 hover:text-amber-400 font-semibold transition"
            >
              डाक शाखा
            </button>
            <button
              onClick={() => handleQuickLogin('incharge@police.gov.in')}
              className="py-2 px-1 text-[11px] bg-slate-950/50 hover:bg-slate-900 border border-slate-700 rounded text-slate-300 hover:text-amber-400 font-semibold transition"
            >
              शाखा प्रभारी
            </button>
            <button
              onClick={() => handleQuickLogin('employee@police.gov.in')}
              className="py-2 px-1 text-[11px] bg-slate-950/50 hover:bg-slate-900 border border-slate-700 rounded text-slate-300 hover:text-amber-400 font-semibold transition"
            >
              कर्मचारी
            </button>
          </div>
          <p className="text-[10px] text-center text-slate-500 mt-2">सभी का पासवर्ड: <code className="text-amber-600">password</code></p>
        </div>

      </div>
    </div>
  );
}
