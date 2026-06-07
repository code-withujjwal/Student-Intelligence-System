import React from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationsFeed from '../components/NotificationsFeed';

export default function Notifications() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#060912] font-['Inter'] text-slate-200 p-8">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
              <Bell className="w-6 h-6 text-amber-400" />
              System Alerts
            </h1>
            <p className="text-sm font-bold text-slate-500 tracking-wider mt-1">Global Notifications Registry</p>
          </div>
          <button 
            onClick={() => navigate('/features')}
            className="text-xs font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/10"
          >
            RETURN
          </button>
        </header>
        
        <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6 shadow-2xl">
          <NotificationsFeed />
        </div>
      </div>
    </div>
  );
}
