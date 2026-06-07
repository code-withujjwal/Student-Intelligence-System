import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Filter, Database, AlertCircle } from 'lucide-react';
import { useQuizCreatorStore } from '../../store/useQuizCreatorStore';
import { questionBankService } from '../../services/questionBankService';
import { toast } from 'sonner';

export default function SmartSelectionModal() {
  const store = useQuizCreatorStore();
  
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('MIXED');
  const [count, setCount] = useState(10);
  const [isProcessing, setIsProcessing] = useState(false);

  const activeSection = store.draft.sections.find(s => s.id === store.activeSectionId);

  const handleGenerate = async () => {
    if (!store.activeSectionId) return;
    setIsProcessing(true);
    
    try {
      // Fetch 50 questions and randomly pick 'count' questions
      // In production, this would be a dedicated backend endpoint: `/api/questions/smart-pick`
      const res = await questionBankService.getQuestions(1, 50, { 
        subject: subject || undefined,
        difficulty: difficulty !== 'MIXED' ? (difficulty as any) : undefined
      });
      
      const eligible = res.data.filter(q => q.status === 'APPROVED' || q.status === 'PUBLISHED');
      
      if (eligible.length < count) {
        toast.error(`Only found ${eligible.length} eligible questions in the bank. Need ${count}.`);
        setIsProcessing(false);
        return;
      }
      
      // Shuffle and pick
      const shuffled = [...eligible].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, count);
      
      // Artificial delay to simulate AI/Smart processing
      setTimeout(() => {
        store.addQuestionsFromRepo(store.activeSectionId!, selected);
        toast.success(`Smart selection added ${count} questions to ${activeSection?.title}`);
        store.closeSmartPicker();
        setIsProcessing(false);
      }, 1500);
      
    } catch (e) {
      toast.error('Failed to perform smart selection');
      setIsProcessing(false);
    }
  };

  if (!store.isSmartPickerOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-lg bg-[#060912] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
            <h2 className="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Smart Selection
            </h2>
            <button onClick={store.closeSmartPicker} disabled={isProcessing} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-slate-400 disabled:opacity-50">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 flex flex-col gap-5">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex gap-3">
              <Database className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-indigo-400 mb-1">How it works</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Specify your requirements and the system will automatically pull a balanced set of questions from the approved Question Bank into your section.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Subject Filter (Optional)</label>
                <input 
                  type="text" 
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. DBMS"
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Difficulty Profile</label>
                  <select 
                    value={difficulty}
                    onChange={e => setDifficulty(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none appearance-none cursor-pointer"
                  >
                    <option value="MIXED">Mixed (Balanced)</option>
                    <option value="EASY">Mostly Easy</option>
                    <option value="MEDIUM">Mostly Medium</option>
                    <option value="HARD">Mostly Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Number of Questions</label>
                  <input 
                    type="number" 
                    min={1}
                    max={100}
                    value={count}
                    onChange={e => setCount(Number(e.target.value))}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:border-indigo-500/50 outline-none"
                  />
                </div>
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isProcessing}
              className="w-full py-3 mt-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generating Selection...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Auto-Fill Section
                </>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
