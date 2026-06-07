import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, BrainCircuit, ListChecks, Check, GitMerge } from 'lucide-react';
import { useQuizCreatorStore } from '../../store/useQuizCreatorStore';
import { AiQuizRequest } from '../../api/aiApi';

interface AiQuizGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiQuizGeneratorModal({ isOpen, onClose }: AiQuizGeneratorModalProps) {
  const store = useQuizCreatorStore();
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [questionCount, setQuestionCount] = useState(5);
  const [includeTypes, setIncludeTypes] = useState<string[]>(['SINGLE_CHOICE']);

  const handleGenerate = () => {
    if (!topic) return;
    const payload: AiQuizRequest = {
      subject: store.draft.subject || 'General Engineering',
      topic,
      difficulty,
      questionCount,
      includeTypes,
      department: store.draft.department || 'Computer Science',
      semester: store.draft.semester || 1
    };
    store.generateQuizFromAI(payload);
  };

  const handleAccept = (mode: 'overwrite' | 'merge') => {
    store.acceptAIQuiz(mode);
    onClose();
  };

  const handleClose = () => {
    store.clearAiPreview();
    onClose();
  };

  const toggleType = (type: string) => {
    setIncludeTypes(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-2xl bg-[#060912] border border-blue-500/30 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-blue-500/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-white tracking-wide">AI Quiz Generator</h2>
              </div>
              <button onClick={handleClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-slate-400 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {store.loadingAI ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin" />
                  <p className="text-blue-400 font-bold animate-pulse">Generating your quiz...</p>
                  <p className="text-xs text-slate-500">Synthesizing questions for {topic}</p>
                </div>
              ) : store.aiGeneratedPreview ? (
                <div className="flex flex-col gap-6">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <h3 className="text-sm font-bold text-green-400 mb-1">Generated Successfully!</h3>
                    <p className="text-xs text-slate-400">Title: {store.aiGeneratedPreview.quizTitle}</p>
                    <p className="text-xs text-slate-400">Questions: {store.aiGeneratedPreview.questions.length}</p>
                    {store.aiGeneratedPreview.source === 'rule_based' && (
                      <p className="text-xs font-bold text-orange-400 mt-2">Note: Used fallback rule-based engine due to AI unavailability.</p>
                    )}
                  </div>
                  
                  <div className="flex gap-4">
                    <button 
                      onClick={() => handleAccept('merge')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all"
                    >
                      <GitMerge className="w-4 h-4" /> Merge with Draft
                    </button>
                    <button 
                      onClick={() => handleAccept('overwrite')}
                      className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 font-bold transition-all"
                    >
                      <ListChecks className="w-4 h-4" /> Overwrite Draft
                    </button>
                  </div>
                  <button 
                    onClick={() => store.regenerateAIQuiz()}
                    className="text-xs font-bold text-slate-400 hover:text-white transition-colors text-center"
                  >
                    Regenerate
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Topic Focus</label>
                    <input
                      type="text"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                      placeholder="e.g., Linked Lists, Database Normalization..."
                      className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Difficulty</label>
                      <select
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                      >
                        <option value="EASY">Easy</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HARD">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Question Count</label>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={questionCount}
                        onChange={e => setQuestionCount(parseInt(e.target.value))}
                        className="w-full bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Question Types Mix</label>
                    <div className="flex flex-wrap gap-2">
                      {['SINGLE_CHOICE', 'TRUE_FALSE', 'CODE_OUTPUT'].map(type => (
                        <button
                          key={type}
                          onClick={() => toggleType(type)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            includeTypes.includes(type) 
                              ? 'bg-blue-500/20 border-blue-500/50 text-blue-400' 
                              : 'bg-white/5 border-white/10 text-slate-400'
                          }`}
                        >
                          {includeTypes.includes(type) && <Check className="w-3 h-3 inline mr-1" />}
                          {type.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={!topic || includeTypes.length === 0}
                    className="mt-4 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all"
                  >
                    <BrainCircuit className="w-5 h-5" /> Generate Now
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
