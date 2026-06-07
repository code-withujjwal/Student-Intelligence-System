import React, { useEffect, useState } from 'react';
import { motion, LayoutGroup } from 'framer-motion';
import { ArrowLeft, BrainCircuit, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnalyticsStore } from '../store/useAnalyticsStore';

const KarlLog = () => {
  const navigate = useNavigate();
  const { mistakes, fetchMistakes, loading } = useAnalyticsStore();
  const [activeNode, setActiveNode] = useState<string | null>(null);

  useEffect(() => {
    fetchMistakes();
  }, [fetchMistakes]);

  return (
    <div className="min-h-screen bg-[#000000] text-white p-6 md:p-12 font-sans relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-dot-grid opacity-5 animate-dot-grid" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[100px]" 
             style={{ background: 'radial-gradient(circle, rgba(239,68,68,0.15) 0%, transparent 70%)' }} />
      </div>

      <nav className="relative z-10 flex items-center justify-between mb-12 max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} /> Back to Hub
        </button>
        <div className="flex items-center gap-3 bg-red-500/10 px-4 py-2 rounded-full border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <AlertTriangle size={16} className="text-red-400" />
          <span className="font-mono-data text-xs text-red-300">NEURAL GAPS DETECTED</span>
        </div>
      </nav>

      <LayoutGroup>
        <main className="relative z-10 max-w-5xl mx-auto">
          <motion.div layoutId="neural-gap-card" className="mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 font-['Inter']">KARL-LOG.</h1>
            <p className="text-[#94A3B8] max-w-2xl text-lg">
              Mistake notebook and vulnerability tracking. Review incorrect logic, trigger fast-revisions, and bridge gaps via AI.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-10 h-10 rounded-full border-2 border-dashed border-red-500 border-t-transparent" />
            </div>
          ) : (
            <div className="grid gap-6">
              {mistakes.map((log, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={`${log.attemptId}-${log.topic}-${i}`}
                  layout
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-all hover:border-white/20 hover:shadow-lg hover:shadow-red-500/5 group"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                        <BrainCircuit size={20} className="text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-200">{log.topic}</h3>
                        <span className="font-mono-data text-[10px] text-gray-400 uppercase tracking-widest">{log.subject} • Failed Attempt</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded-xl p-5 border border-white/5 font-mono-data text-sm text-gray-300 mb-6 leading-relaxed">
                    {log.question?.text ?? "Loading question logic..."}
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-xl border border-white/10 text-sm font-medium transition-colors">
                      <BrainCircuit size={16} className="text-blue-400" /> Review Logic
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 px-5 py-3 rounded-xl border border-white/10 text-sm font-medium transition-colors">
                      <RefreshCw size={16} className="text-green-400" /> Re-attempt
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 px-5 py-3 rounded-xl border border-indigo-500/30 text-sm font-medium transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]">
                      <Sparkles size={16} /> AI Explanation
                    </button>
                  </div>
                </motion.div>
              ))}
              
              {mistakes.length === 0 && (
                <div className="text-center py-32 border border-dashed border-white/10 rounded-3xl bg-white/5 backdrop-blur-sm">
                  <BrainCircuit size={48} className="mx-auto text-gray-600 mb-6 opacity-50" />
                  <p className="text-gray-400 font-mono-data text-sm uppercase tracking-widest">No neural gaps detected. System optimal.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </LayoutGroup>
    </div>
  );
};

export default KarlLog;
