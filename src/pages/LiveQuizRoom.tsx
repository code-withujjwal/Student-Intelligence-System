import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Clock, Trophy, AlertCircle, Play, LogOut, CheckCircle2 } from 'lucide-react';
import { useLiveQuizStore } from '../store/useLiveQuizStore';

export default function LiveQuizRoom() {
  const params = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const store = useLiveQuizStore();
  const [sessionId] = useState(params.sessionId || Math.random().toString(36).substring(2, 8).toUpperCase());
  const [username, setUsername] = useState('');
  const [hasJoined, setHasJoined] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  
  useEffect(() => {
    // Cleanup on unmount
    return () => {
      store.disconnectWebSocket();
    };
  }, []);

  // Simple Timer
  useEffect(() => {
    if (hasJoined && timeLeft > 0 && !selectedAnswer) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [hasJoined, timeLeft, selectedAnswer]);

  // Anti-Cheat: Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && hasJoined) {
        console.warn('Anti-Cheat: Tab switch detected!');
        // Ideally, broadcast to backend that user tabbed out
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [hasJoined]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !sessionId) return;
    store.connectWebSocket(sessionId, username);
    setHasJoined(true);
  };

  const handleAnswerSubmit = (answer: string) => {
    if (selectedAnswer || timeLeft === 0) return;
    setSelectedAnswer(answer);
    store.submitAnswer(currentQuestion, answer, 30 - timeLeft);
    
    // Auto advance for mockup purposes (In a real app, backend pushes next question)
    setTimeout(() => {
      setCurrentQuestion(prev => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(30);
    }, 3000);
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#060912] p-4 font-['Inter'] text-slate-200">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl"
        >
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              <Play className="w-8 h-8 text-white ml-1" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-wide">Join Live Quiz</h1>
            <p className="text-sm font-bold text-indigo-400 font-mono tracking-widest uppercase">Session: {sessionId}</p>
          </div>

          <form onSubmit={handleJoin} className="flex flex-col gap-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Nickname</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your display name"
                required
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <button 
              type="submit"
              disabled={!username.trim()}
              className="mt-2 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold tracking-wide transition-all"
            >
              Enter Waiting Room
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#060912] font-['Inter'] text-slate-200">
      {/* Main Quiz Area */}
      <div className="flex-1 flex flex-col p-8">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> LIVE
            </div>
            <p className="text-sm font-bold text-slate-400 font-mono">ID: {sessionId}</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-slate-300">
              <Users className="w-4 h-4" /> <span className="font-bold">{store.leaderboard.length}</span>
            </div>
            <button onClick={() => navigate('/features')} className="flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider">
              <LogOut className="w-4 h-4" /> Leave
            </button>
          </div>
        </header>

        <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full gap-8">
          {/* Question Card */}
          <motion.div 
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
              <motion.div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                initial={{ width: '100%' }}
                animate={{ width: `${(timeLeft / 30) * 100}%` }}
                transition={{ duration: 1, ease: 'linear' }}
              />
            </div>
            
            <div className="flex justify-between items-start mb-8">
              <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Question {currentQuestion} of 10</p>
              <div className={`flex items-center gap-2 text-sm font-bold px-3 py-1.5 rounded-lg border ${timeLeft <= 10 ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse' : 'bg-white/5 text-slate-300 border-white/10'}`}>
                <Clock className="w-4 h-4" /> 00:{timeLeft.toString().padStart(2, '0')}
              </div>
            </div>

            <h2 className="text-2xl font-black text-white leading-relaxed mb-8">
              What is the time complexity of searching for an element in a balanced Binary Search Tree?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {['O(1)', 'O(log n)', 'O(n)', 'O(n²)'].map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswerSubmit(opt)}
                  disabled={!!selectedAnswer || timeLeft === 0}
                  className={`p-4 rounded-2xl border text-left font-bold transition-all ${
                    selectedAnswer === opt 
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]'
                      : selectedAnswer
                        ? 'bg-white/5 border-white/5 text-slate-500 opacity-50'
                        : 'bg-black/50 border-white/10 text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {selectedAnswer === opt && <CheckCircle2 className="w-5 h-5" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
          
          {selectedAnswer && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-indigo-500/10 border border-indigo-500/20 rounded-2xl p-4 flex items-center justify-center gap-3 text-indigo-400 font-bold">
              <AlertCircle className="w-5 h-5" /> Waiting for other players to finish...
            </motion.div>
          )}
        </main>
      </div>

      {/* Leaderboard Sidebar */}
      <aside className="w-80 bg-black/60 border-l border-white/5 p-6 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-white/5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wide">Live Rankings</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Updates instantly</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-3">
          {store.leaderboard.length === 0 ? (
            <p className="text-xs text-slate-500 font-bold text-center mt-10">Waiting for players...</p>
          ) : (
            store.leaderboard.map((entry, idx) => (
              <motion.div 
                key={entry.username}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                  entry.username === username 
                    ? 'bg-indigo-500/10 border-indigo-500/30' 
                    : 'bg-white/5 border-white/5'
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-black ${
                  idx === 0 ? 'bg-amber-400 text-amber-900' : 
                  idx === 1 ? 'bg-slate-300 text-slate-800' :
                  idx === 2 ? 'bg-orange-400 text-orange-900' : 'bg-white/10 text-slate-400'
                }`}>
                  #{entry.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold truncate ${entry.username === username ? 'text-indigo-400' : 'text-slate-200'}`}>
                    {entry.username} {entry.username === username && '(You)'}
                  </p>
                </div>
                <div className="text-xs font-black text-white font-mono">
                  {Math.round(entry.score)}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
}
