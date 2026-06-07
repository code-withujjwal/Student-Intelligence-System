import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Flame, Award, Shield, AlertTriangle, CheckCircle2, XCircle, Timer, Sparkles, Loader2 } from 'lucide-react';
import axiosInstance from '../api/axios';
import { useUserStore } from '../store/useUserStore';

interface DailyChallengeDTO {
  id: number;
  title: string;
  problemStatement: string;
  subject: string;
  topic: string;
  difficulty: string;
  options: string[];
  expiresAt: string;
  remainingSeconds: number;
  alreadyAttempted: boolean;
  previousResult: boolean;
  attemptCount: number;
  maxAttempts: number;
}

interface DailyChallengeResultDTO {
  correct: boolean;
  isCorrect?: boolean;
  explanation: string;
  correctOptionIdx: number;
  xpGained: number;
  attemptCount: number;
  maxAttempts: number;
  hasMoreAttempts: boolean;
}

export default function DailyChallenge() {
  const navigate = useNavigate();

  const { neuralReport } = useUserStore();
  const [activeChallenge, setActiveChallenge] = useState<DailyChallengeDTO | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [correctIdx, setCorrectIdx] = useState<number | null>(null);
  const [dailyStreak, setDailyStreak] = useState(neuralReport?.gamification?.streak || 0);
  const [timeRemainingText, setTimeRemainingText] = useState('23:59:59');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [xpGained, setXpGained] = useState(0);

  useEffect(() => {
    fetchDailyChallenge();
  }, []);

  const fetchDailyChallenge = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/daily-challenge');
      const data = res.data.data;
      setActiveChallenge(data);
      setMaxAttempts(data.maxAttempts || 3);
      setAttemptCount(data.attemptCount || 0);
      
      if (data.alreadyAttempted) {
        setHasSubmitted(true);
        setIsCorrectAnswer(data.previousResult);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load today's challenge. It may still be generating.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!activeChallenge) return;
    
    const expiresAt = new Date(activeChallenge.expiresAt).getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = expiresAt - now;
      
      if (diff <= 0) {
        setTimeRemainingText('EXPIRED - REFRESH FOR NEW');
        return;
      }
      
      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      const pad = (n: number) => String(n).padStart(2, '0');
      setTimeRemainingText(`${pad(hrs)}:${pad(mins)}:${pad(secs)}`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [activeChallenge]);

  const handleSubmit = async () => {
    if (selectedOption === null || hasSubmitted || !activeChallenge) return;
    setSubmitting(true);
    
    try {
      const res = await axiosInstance.post('/daily-challenge/submit', {
        challengeId: activeChallenge.id,
        selectedOptionIdx: selectedOption
      });
      
      const result: DailyChallengeResultDTO = res.data.data;
      const isSuccess = result.correct !== undefined ? result.correct : result.isCorrect!;
      
      setAttemptCount(result.attemptCount);
      setMaxAttempts(result.maxAttempts);
      setXpGained(result.xpGained);
      
      if (!result.hasMoreAttempts || isSuccess) {
        setHasSubmitted(true);
        setExplanation(result.explanation);
        setCorrectIdx(result.correctOptionIdx);
      } else {
        setSelectedOption(null); // reset for retry
      }
      
      setIsCorrectAnswer(isSuccess);
      
      if (isSuccess) {
        setDailyStreak(prev => prev + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#060912] flex flex-col items-center justify-center text-cyan-400 font-mono gap-4">
        <Loader2 className="w-12 h-12 animate-spin" />
        <p className="tracking-widest uppercase text-sm">Synchronizing Challenge Matrix...</p>
      </div>
    );
  }

  if (error || !activeChallenge) {
    return (
      <div className="min-h-screen bg-[#060912] flex flex-col items-center justify-center text-red-400 font-mono gap-4 p-6 text-center">
        <AlertTriangle className="w-12 h-12" />
        <p className="tracking-widest uppercase text-sm">{error || "No active challenge found."}</p>
        <button onClick={() => navigate('/features')} className="mt-4 px-6 py-2 border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 rounded-lg tracking-widest text-xs">Return to Hub</button>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-x-hidden text-slate-100 p-6 lg:p-8"
      style={{
        background: '#060912',
        fontFamily: '"Space Mono", "JetBrains Mono", "Fira Code", monospace',
        letterSpacing: '0.05em'
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34,211,238,0.06) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 90% 80%, rgba(168,85,247,0.04) 0%, transparent 50%)'
        }}
      />

      <header className="max-w-7xl mx-auto flex items-center justify-between mb-8 border-b border-white/5 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/features')}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/5 transition-all text-slate-400 hover:text-white border border-white/5 mr-1 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <p className="tracking-widest font-extrabold uppercase text-[0.6rem] text-[#22d3ee] flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[#22d3ee]" /> POTD CHALLENGE PORTAL [COG_10]
            </p>
            <h1 className="text-sm font-bold text-white tracking-wider mt-0.5 uppercase">
              DETERMINISTIC COGNITIVE MATRIX
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-[#0e1322]/60 border border-white/5 px-4 py-2 rounded-xl">
          <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
          <span className="text-xs font-bold tracking-widest text-slate-300">STREAK: {dailyStreak} DAYS</span>
        </div>
      </header>

      <motion.main
        initial={{ opacity: 0, scale: 0.97, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        <section className="lg:col-span-7 flex flex-col gap-5 text-left">
          <div className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-[#0e1322]/20 font-bold text-[0.6rem]">
            <span className="text-slate-500 uppercase tracking-widest">[ SYSTEM CODE OBJECTIVE ]</span>
            <span className="text-[#22d3ee] tracking-widest">CHALLENGE #{activeChallenge.id}</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 uppercase tracking-widest font-extrabold">
              {activeChallenge.difficulty}
            </span>
          </div>

          <h2 className="text-xl font-extrabold text-white tracking-wider uppercase">
            {activeChallenge.title}
          </h2>

          <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-xl p-5 space-y-2.5">
            <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block">
              [ PROBLEM SPECIFICATION ]
            </span>
            <p className="text-xs text-slate-300 leading-relaxed uppercase tracking-wider">
              {activeChallenge.problemStatement}
            </p>
          </div>

          <div className="bg-[#0e1322]/40 backdrop-blur-md border border-white/5 rounded-xl p-5 space-y-3">
            <span className="text-[0.6rem] font-bold text-slate-500 uppercase tracking-widest block">
              [ TOPIC & TAGS ]
            </span>
            <div className="bg-black/40 rounded-xl p-4 border border-white/5 font-mono text-[0.68rem] text-slate-300 space-y-2 uppercase tracking-wide leading-relaxed">
              <span className="text-emerald-400 mr-2 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded">{activeChallenge.subject}</span>
              <span className="text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 rounded">{activeChallenge.topic}</span>
            </div>
          </div>


        </section>

        <section className="lg:col-span-5 flex flex-col gap-5 text-left">
          <div
            className={`bg-[#0e1322]/40 backdrop-blur-md border rounded-xl p-5 flex flex-col justify-between flex-1 min-h-[480px] transition-all duration-300 ${
              hasSubmitted
                ? isCorrectAnswer
                  ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.25)]'
                  : 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.25)] animate-pulse'
                : 'border-white/5'
            }`}
          >
            <div className="space-y-5">
              <div className="flex items-center justify-between text-[0.6rem] font-bold text-slate-500 border-b border-white/5 pb-3">
                <span className="uppercase tracking-widest text-[#a855f7]">
                  [ SYSTEM EVALUATION SANDBOX ]
                </span>
                <span className="text-slate-400 animate-pulse tracking-widest uppercase">
                  XP VALUE: 200
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-950/40 border border-white/5 rounded-xl p-4">
                <div>
                  <p className="text-[0.58rem] font-extrabold uppercase text-slate-500 tracking-widest mb-1.5">
                    TIME TO NEXT MANIFEST UPDATE
                  </p>
                  <div className="text-lg font-extrabold text-white tracking-widest font-mono">
                    {timeRemainingText}
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-[0.58rem] font-extrabold uppercase text-slate-500 tracking-widest mb-1.5">
                    ATTEMPTS REMAINING
                  </p>
                  <div className="text-lg font-extrabold text-white tracking-widest font-mono">
                    {Math.max(0, maxAttempts - attemptCount)} / {maxAttempts}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {activeChallenge.options.map((opt, idx) => {
                  const isSelected = selectedOption === idx;
                  let btnStyle = 'border-white/5 bg-[#090d16]/30 text-slate-400 hover:scale-[1.01] hover:bg-[#0e1322]/90';

                  if (hasSubmitted) {
                    if (correctIdx !== null && idx === correctIdx) {
                      btnStyle = 'border-emerald-500/40 bg-emerald-500/5 text-emerald-300';
                    } else if (isSelected) {
                      btnStyle = 'border-red-500/40 bg-red-500/5 text-red-300';
                    } else {
                      btnStyle = 'border-white/5 bg-[#090d16]/10 opacity-30 text-slate-600';
                    }
                  } else if (isSelected) {
                    btnStyle = 'border-amber-500/40 bg-amber-500/5 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={hasSubmitted}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full p-4 rounded-xl border text-left text-xs font-semibold flex items-center gap-3.5 transition-all duration-200 cursor-pointer ${btnStyle}`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg text-[0.65rem] font-bold flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="uppercase tracking-wider leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 pt-5 border-t border-white/5">
              <button
                onClick={handleSubmit}
                disabled={hasSubmitted || selectedOption === null}
                className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-widest uppercase transition-all flex items-center justify-center gap-1.5 ${
                  hasSubmitted || selectedOption === null
                    ? 'bg-white/5 border border-white/5 text-slate-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#22d3ee] to-[#a855f7] text-slate-900 shadow-lg shadow-[#22d3ee]/20 hover:brightness-110 cursor-pointer'
                }`}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} TRANSMIT COMBAT CODE SOLUTION
              </button>
              
              {!hasSubmitted && attemptCount > 0 && !isCorrectAnswer && (
                <div className="p-3 rounded-xl border border-red-500/20 bg-red-500/5 text-red-300 text-[0.65rem] font-bold text-center tracking-widest uppercase animate-pulse">
                  [ WARNING: INCORRECT LOGIC DETECTED. RECALIBRATE AND RETRY. ]
                </div>
              )}

              {hasSubmitted && (
                <div className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border text-xs font-bold leading-relaxed uppercase tracking-widest flex items-center justify-between ${
                      isCorrectAnswer
                        ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-300'
                        : 'border-red-500/20 bg-red-500/5 text-red-300'
                    }`}
                  >
                    <span>
                      {isCorrectAnswer
                        ? '[ RESOLUTION COMPILED: LOGIC VERIFIED ]'
                        : '[ COMPILE ERROR: MAX RETRIES EXCEEDED ]'}
                    </span>
                    {isCorrectAnswer && (
                      <span className="text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">+{xpGained} XP</span>
                    )}
                  </div>
                  
                  {explanation && (
                    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                      <p className="text-[0.6rem] font-extrabold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Flame className="w-3 h-3 text-orange-500" /> AI ARCHITECT EXPLANATION
                      </p>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono">
                        {explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      </motion.main>
    </div>
  );
}
