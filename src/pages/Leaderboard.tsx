import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trophy, ArrowLeft, Loader2, Award, Zap, Crosshair } from 'lucide-react';
import axiosInstance from '../api/axios';

interface LeaderboardUser {
  rank: number;
  username: string;
  xp: number;
  questionsSolved: number;
  dailyChallengeScore: number;
  level: number;
}

export default function Leaderboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/leaderboard?limit=100');
      setUsers(res.data.data || []);
    } catch (err: any) {
      console.error("Failed to fetch leaderboard", err);
      setError("Failed to load leaderboard data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.2)]',
          text: 'text-yellow-400',
          badge: 'bg-yellow-500 text-yellow-950',
          icon: <Award className="w-5 h-5 text-yellow-400" />
        };
      case 2:
        return {
          bg: 'bg-slate-300/10 border-slate-300/50 shadow-[0_0_15px_rgba(203,213,225,0.1)]',
          text: 'text-slate-300',
          badge: 'bg-slate-300 text-slate-900',
          icon: <Award className="w-5 h-5 text-slate-300" />
        };
      case 3:
        return {
          bg: 'bg-amber-600/10 border-amber-600/50 shadow-[0_0_15px_rgba(217,119,6,0.1)]',
          text: 'text-amber-500',
          badge: 'bg-amber-600 text-amber-950',
          icon: <Award className="w-5 h-5 text-amber-500" />
        };
      default:
        return {
          bg: 'bg-[#0e1322]/40 border-white/5 hover:border-white/10 hover:bg-[#12192c]/40',
          text: 'text-white',
          badge: 'bg-slate-800 text-slate-400 border border-white/5',
          icon: null
        };
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-slate-300 select-none p-6 lg:p-8"
      style={{
        background: '#060912',
        fontFamily: '"Space Mono", "JetBrains Mono", "Fira Code", monospace',
        letterSpacing: '0.05em'
      }}
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)',
          backgroundSize: '20px 20px',
          opacity: 0.02
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <header className="flex items-center justify-between mb-10 border-b border-white/5 pb-5">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/features')}
              className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all text-slate-400 hover:text-white border border-white/5 mr-1 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <p className="tracking-widest font-extrabold uppercase text-[0.6rem] text-cyan-400 flex items-center gap-1.5 animate-pulse">
                GLOBAL NETWORK // RANKINGS
              </p>
              <h1 className="text-sm font-bold text-white tracking-wider mt-0.5 uppercase flex items-center gap-2">
                <Trophy className="w-4 h-4 text-cyan-400" /> OPERATIVE LEADERBOARD
              </h1>
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <p className="font-mono text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
              FETCHING GLOBAL RANKINGS...
            </p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 bg-red-950/20 border border-red-500/20 rounded-xl">
            <p className="font-mono text-sm font-bold text-red-400 uppercase tracking-widest text-center px-4">
              {error}
            </p>
            <button 
              onClick={fetchLeaderboard}
              className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg text-xs font-bold hover:bg-red-500/20 transition-all uppercase tracking-widest"
            >
              RETRY CONNECTION
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white/5 border border-white/5 rounded-xl">
            <Trophy className="w-12 h-12 text-slate-600" />
            <p className="font-mono text-sm font-bold text-slate-500 uppercase tracking-widest text-center px-4">
              NO LEADERBOARD DATA AVAILABLE YET.
            </p>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3 pb-20"
          >
            {/* Header Row */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 font-mono text-[0.65rem] font-extrabold uppercase text-slate-500 tracking-widest border-b border-white/5">
              <div className="col-span-1 text-center">RANK</div>
              <div className="col-span-4">OPERATIVE</div>
              <div className="col-span-2 text-center">LEVEL</div>
              <div className="col-span-2 text-center">QUESTIONS SOLVED</div>
              <div className="col-span-2 text-center">DAILY CHALLENGE</div>
              <div className="col-span-1 text-right">TOTAL XP</div>
            </div>

            {/* User List */}
            {users.map((user, index) => {
              const style = getRankStyle(user.rank);
              const isTop3 = user.rank <= 3;

              return (
                <motion.div
                  key={user.username + user.rank}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-6 py-4 rounded-xl border backdrop-blur-md transition-all ${style.bg}`}
                >
                  {/* Rank */}
                  <div className="col-span-1 flex items-center justify-between md:justify-center">
                    <span className="md:hidden font-mono text-[0.65rem] font-bold text-slate-500 uppercase">RANK</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${style.badge}`}>
                      #{user.rank}
                    </div>
                  </div>

                  {/* Operative Info */}
                  <div className="col-span-4 flex items-center gap-3">
                    {style.icon ? (
                      <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center shrink-0 border border-white/10">
                        {style.icon}
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-white/5 text-xs font-bold text-slate-400 uppercase">
                        {user.username.substring(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className={`font-bold text-sm truncate uppercase tracking-wider ${style.text}`}>
                        {user.username}
                      </h3>
                    </div>
                  </div>

                  {/* Level */}
                  <div className="col-span-2 flex items-center justify-between md:justify-center">
                    <span className="md:hidden font-mono text-[0.65rem] font-bold text-slate-500 uppercase">LEVEL</span>
                    <div className="font-mono text-xs font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-white/5">
                      LVL {user.level}
                    </div>
                  </div>

                  {/* Questions Solved */}
                  <div className="col-span-2 flex items-center justify-between md:justify-center gap-2">
                    <span className="md:hidden font-mono text-[0.65rem] font-bold text-slate-500 uppercase">SOLVED</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-400">
                      <Crosshair className="w-3.5 h-3.5" />
                      {user.questionsSolved}
                    </div>
                  </div>

                  {/* Daily Score */}
                  <div className="col-span-2 flex items-center justify-between md:justify-center gap-2">
                    <span className="md:hidden font-mono text-[0.65rem] font-bold text-slate-500 uppercase">DAILY SCORE</span>
                    <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-orange-400">
                      <Zap className="w-3.5 h-3.5" />
                      {user.dailyChallengeScore}
                    </div>
                  </div>

                  {/* Total XP */}
                  <div className="col-span-1 flex items-center justify-between md:justify-end">
                    <span className="md:hidden font-mono text-[0.65rem] font-bold text-slate-500 uppercase">XP</span>
                    <div className={`font-mono text-sm font-black tracking-wider ${isTop3 ? style.text : 'text-indigo-400'}`}>
                      {user.xp}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </div>
  );
}
