import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';

export const GlobalBackButton: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Hide on main entry points
  const hiddenPaths = ['/', '/auth', '/dashboard'];
  if (hiddenPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <div className="fixed top-6 left-6 z-50 flex items-center gap-2 pointer-events-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950/80 backdrop-blur-lg border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/30 hover:bg-[#12192c] hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all duration-300 shadow-xl cursor-pointer"
        title="Go Back"
      >
        <ArrowLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => navigate('/dashboard')}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950/80 backdrop-blur-lg border border-white/10 text-slate-400 hover:text-white hover:border-indigo-500/30 hover:bg-[#12192c] hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all duration-300 shadow-xl cursor-pointer"
        title="Back to Command Center"
      >
        <Home className="w-5 h-5" />
      </button>
    </div>
  );
};

export default GlobalBackButton;
