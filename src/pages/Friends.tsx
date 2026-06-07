import React from 'react';
import { motion } from 'framer-motion';
import { Users, Search, UserPlus, Shield, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Friends() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-[#060912] font-['Inter'] text-slate-200 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-2xl font-black text-white tracking-widest uppercase flex items-center gap-3">
              <Users className="w-6 h-6 text-indigo-400" />
              Operative Network
            </h1>
            <p className="text-sm font-bold text-slate-500 tracking-wider mt-1">Friends & Challenges</p>
          </div>
          <button 
            onClick={() => navigate('/features')}
            className="text-xs font-bold bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg transition-colors border border-white/10"
          >
            RETURN
          </button>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Active Operatives</h2>
                <button className="flex items-center gap-2 text-xs font-bold bg-indigo-500/10 text-indigo-400 px-3 py-1.5 rounded-lg border border-indigo-500/20 hover:bg-indigo-500/20 transition-colors">
                  <UserPlus className="w-3.5 h-3.5" /> ADD FRIEND
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                {[
                  { name: 'AlexChen_89', status: 'ONLINE', rank: 'ELITE', activity: 'In a Multiplayer Match' },
                  { name: 'Sarah_Connor', status: 'ONLINE', rank: 'VANGUARD', activity: 'Studying DSA' },
                  { name: 'Neo_Matrix', status: 'AWAY', rank: 'NOVICE', activity: 'Idle' }
                ].map((friend, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                          <Shield className="w-5 h-5 text-indigo-400" />
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-[#0e1322] ${friend.status === 'ONLINE' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-amber-500'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{friend.name}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{friend.activity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 bg-white/5 px-2 py-1 rounded uppercase tracking-widest border border-white/5">{friend.rank}</span>
                      <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 text-slate-400 border border-white/10 transition-colors" title="Challenge">
                        <Swords className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Pending Challenges</h2>
              <div className="flex flex-col gap-3">
                <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-center">
                  <p className="text-xs font-bold text-indigo-400 mb-2">No active challenges</p>
                  <p className="text-[10px] text-slate-500">Challenge a friend to start a 1v1 battle.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-widest mb-4">Find Operative</h2>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Enter username..." 
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <Search className="w-4 h-4 text-slate-500 absolute left-4 top-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
