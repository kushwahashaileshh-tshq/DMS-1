import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, FileText, Search, User, Shield, Navigation } from 'lucide-react';

export const DashboardLayout = ({ children }) => {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'डाक शाखा (Admin)';
      case 'in_charge': return 'शाखा प्रभारी (In-charge)';
      case 'employee': return 'कर्मचारी (Staff)';
      default: return 'यूज़र';
    }
  };

  const getDashboardLink = () => {
    if (!profile) return '/login';
    switch (profile.role) {
      case 'admin': return '/admin';
      case 'in_charge': return '/incharge';
      case 'employee': return '/employee';
      default: return '/';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="police-gradient text-white h-16 flex items-center justify-between px-6 shadow-md border-b-4 border-amber-600">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-1 rounded-full">
            {/* National emblem / police logo placeholder */}
            <Shield className="h-8 w-8 text-police-dark fill-amber-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide leading-none">उत्तर प्रदेश पुलिस</h1>
            <p className="text-xs text-amber-400 font-medium">तकनीकी सेवायें शाखा | डाक संचालन पोर्टल</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex flex-col items-end text-right">
            <span className="font-semibold text-sm leading-none">{profile?.name}</span>
            <span className="text-xs text-slate-300 mt-1">{profile?.designation} ({profile?.posting_name})</span>
          </div>
          
          <div className="bg-slate-800/40 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/30 text-amber-300">
            {getRoleLabel(profile?.role)}
          </div>

          <button 
            onClick={handleLogout}
            className="flex items-center justify-center p-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white transition duration-200"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-slate-300 hidden md:flex flex-col border-r border-slate-800">
          <div className="p-4 border-b border-slate-800 flex items-center space-x-2">
            <User className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-slate-200">डैशबोर्ड नेविगेशन</span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            <Link 
              to={getDashboardLink()} 
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition duration-150"
            >
              <FileText className="h-4 w-4 text-amber-500" />
              <span>मुख्य डैशबोर्ड</span>
            </Link>

            <Link 
              to="/track" 
              className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-slate-800 hover:text-white transition duration-150"
            >
              <Search className="h-4 w-4 text-amber-500" />
              <span>खोज एवं ट्रैकिंग</span>
            </Link>
          </nav>

          <div className="p-4 border-t border-slate-800 text-center text-xs text-slate-500">
            वर्शन 1.0.0 © 2026 तकनीकी सेवायें
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
