import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Filter, Plus, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQuizCreatorStore } from '../../store/useQuizCreatorStore';
import { questionBankService } from '../../services/questionBankService';
import type { QbQuestion, QbFilters } from '../../types/questionBank';
import { toast } from 'sonner';

export default function QuestionPickerModal() {
  const store = useQuizCreatorStore();
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<QbQuestion[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const [filters, setFilters] = useState<QbFilters>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Track IDs already in the current section
  const activeSection = store.draft.sections.find(s => s.id === store.activeSectionId);
  const alreadyAddedIds = new Set(activeSection?.questions.map(q => q.repoQuestionId).filter(Boolean) as number[]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      // Phase 6 Rule: Only Approved or Published questions
      const res = await questionBankService.getQuestions(page, 20, { 
        ...filters, 
        searchQuery,
      });
      // Filter out non-governance states locally if mock doesn't support array statuses
      const approvedOnly = res.data.filter(q => q.status === 'APPROVED' || q.status === 'PUBLISHED');
      
      setQuestions(approvedOnly);
      setTotalPages(res.totalPages);
      setTotalElements(res.totalElements); // Approx since we filter locally
    } catch (e) {
      toast.error('Failed to load question bank');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (store.isPickerOpen) {
      fetchQuestions();
    }
  }, [store.isPickerOpen, page, filters]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchQuestions();
  };

  const toggleSelection = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleAddSelected = () => {
    if (selectedIds.size === 0 || !store.activeSectionId) return;
    
    const selectedQbs = questions.filter(q => selectedIds.has(q.id));
    
    // Check for duplicates
    const dupes = selectedQbs.filter(q => alreadyAddedIds.has(q.id));
    if (dupes.length > 0) {
      const confirm = window.confirm(`${dupes.length} of these questions are already in this section. Add them anyway?`);
      if (!confirm) return;
    }

    store.addQuestionsFromRepo(store.activeSectionId, selectedQbs);
    toast.success(`Added ${selectedQbs.length} questions to ${activeSection?.title}`);
    store.closePicker();
    setSelectedIds(new Set());
  };

  if (!store.isPickerOpen) return null;

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
          className="w-full max-w-6xl h-[85vh] bg-[#060912] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex items-center justify-between shrink-0">
            <div>
              <h2 className="text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-400" /> Question Repository
              </h2>
              <p className="text-xs text-slate-400 mt-1">Select questions to add to <span className="text-indigo-400 font-bold">{activeSection?.title}</span></p>
            </div>
            <button onClick={store.closePicker} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-1 overflow-hidden">
            {/* Left Sidebar - Filters */}
            <div className="w-64 border-r border-white/5 bg-[#0e1322]/50 p-4 overflow-y-auto shrink-0 flex flex-col gap-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-2">
                <Filter className="w-4 h-4" /> Filters
              </h3>
              
              <div className="flex flex-col gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Difficulty</label>
                  <select 
                    value={filters.difficulty || ''} 
                    onChange={e => { setFilters(f => ({ ...f, difficulty: e.target.value as any })); setPage(1); }}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  >
                    <option value="">All</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Subject</label>
                  <input 
                    type="text" 
                    placeholder="e.g. DBMS"
                    onChange={e => { setFilters(f => ({ ...f, subject: e.target.value })); setPage(1); }}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase">Governance Rule</label>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2 mt-1">
                    <p className="text-[9px] text-emerald-400 font-bold">Only Approved & Published questions are visible.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col bg-[#060912]">
              {/* Search Bar */}
              <div className="p-4 border-b border-white/5 bg-black/20 flex gap-3 shrink-0">
                <form onSubmit={handleSearch} className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by keyword, topic, or question ID..."
                    className="w-full bg-[#0e1322] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500/40"
                  />
                </form>
                <button 
                  onClick={handleAddSelected}
                  disabled={selectedIds.size === 0}
                  className="px-6 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-colors whitespace-nowrap"
                >
                  Add {selectedIds.size} Selected
                </button>
              </div>

              {/* Questions List */}
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                {loading ? (
                  <div className="flex justify-center items-center h-full text-slate-500">Loading Repository...</div>
                ) : questions.length === 0 ? (
                  <div className="flex flex-col justify-center items-center h-full text-slate-500 text-sm">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    No questions found matching your criteria.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {questions.map(q => {
                      const isSelected = selectedIds.has(q.id);
                      const isAlreadyAdded = alreadyAddedIds.has(q.id);
                      
                      return (
                        <div 
                          key={q.id}
                          onClick={() => toggleSelection(q.id)}
                          className={`flex gap-4 p-4 rounded-xl border cursor-pointer transition-colors ${
                            isSelected ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-[#0e1322]/50 border-white/5 hover:border-white/10'
                          }`}
                        >
                          <div className="pt-1 shrink-0">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-indigo-500 border-indigo-400' : 'border-white/20'}`}>
                              {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{q.publicId}</span>
                              <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded">{q.subject}</span>
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">{q.difficulty}</span>
                              {isAlreadyAdded && (
                                <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3" /> Already in Section
                                </span>
                              )}
                            </div>
                            <p className="text-sm font-medium text-white line-clamp-2">{q.questionText}</p>
                            <div className="text-[10px] text-slate-500 mt-2 font-mono flex items-center gap-4">
                              <span>Type: {q.questionType}</span>
                              <span>Marks: {q.marks}</span>
                              <span>Source: {q.sourceType}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              <div className="p-4 border-t border-white/5 bg-[#0e1322]/80 flex items-center justify-between shrink-0">
                <span className="text-xs font-bold text-slate-500">Page {page} of {totalPages}</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || loading}
                    className="w-8 h-8 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// Added Database icon missing from import
const Database = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <ellipse cx="12" cy="5" rx="9" ry="3" />
    <path d="M3 5V19A9 3 0 0 0 21 19V5" />
    <path d="M3 12A9 3 0 0 0 21 12" />
  </svg>
);
