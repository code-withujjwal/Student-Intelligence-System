import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Database, Search, Filter, Plus, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, XCircle, Archive, AlertCircle, FileText, Settings, Scan
} from 'lucide-react';
import QuestionEditorModal from '../components/question-bank/QuestionEditorModal';
import ImportWizardModal from '../components/question-bank/import/ImportWizardModal';
import OcrImportWizardModal from '../components/question-bank/import/ocr/OcrImportWizardModal';
import ReviewPanelModal from '../components/question-bank/governance/ReviewPanelModal';
import { useQuestionBankStore } from '../store/useQuestionBankStore';
import type { QbStatus, QbDifficulty, QbQuestion, QbDashboardStats } from '../types/questionBank';
import { questionApi } from '../api/questionApi';

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Electrical', 'Mechanical', 'Civil'];
const SUBJECTS = ['DBMS', 'OS', 'DSA', 'OOP', 'CN', 'C Programming', 'C++', 'Java', 'Python'];
const SOURCES = ['RGPV_PYQ', 'TEXTBOOK', 'FACULTY_CREATED', 'PLACEMENT', 'GATE', 'AI_GENERATED', 'LAB_VIVA', 'INTERVIEW_QUESTION', 'ASSIGNMENT_QUESTION', 'UNIVERSITY_QUESTION_BANK', 'OTHER'];

const STATUS_CONFIG: Record<QbStatus, { icon: React.ElementType, color: string, bg: string, border: string, label: string }> = {
  APPROVED: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Approved' },
  PUBLISHED: { icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', label: 'Published' },
  PENDING_REVIEW: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Pending Review' },
  UNDER_REVIEW: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', label: 'Under Review' },
  CHANGES_REQUESTED: { icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30', label: 'Changes Requested' },
  DRAFT: { icon: FileText, color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30', label: 'Draft' },
  REJECTED: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30', label: 'Rejected' },
  ARCHIVED: { icon: Archive, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/30', label: 'Archived' },
};

const DIFF_COLORS: Record<QbDifficulty, string> = {
  EASY: 'text-green-400 border-green-500/20 bg-green-500/10',
  MEDIUM: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
  HARD: 'text-red-400 border-red-500/20 bg-red-500/10',
  UNIVERSITY_EXAM: 'text-blue-400 border-blue-500/20 bg-blue-500/10',
  PLACEMENT_LEVEL: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10',
  GATE_LEVEL: 'text-purple-400 border-purple-500/20 bg-purple-500/10',
};

// Custom hook for debouncing search input
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function ManageQuestions() {
  const navigate = useNavigate();
  const store = useQuestionBankStore();
  const [showFilters, setShowFilters] = useState(false);
  const [localSearch, setLocalSearch] = useState('');

  // Local state for backend API integration
  const [questions, setQuestions] = useState<QbQuestion[]>([]);
  const [stats, setStats] = useState<QbDashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const debouncedSearch = useDebounce(localSearch, 500);

  const fetchBackendData = async () => {
    setLoading(true);
    try {
      // Spring Data JPA pages are 0-indexed, so we subtract 1 from currentPage
      const response = await questionApi.getAllQuestions(store.currentPage > 0 ? store.currentPage - 1 : 0, store.pageSize, store.filters);
      setQuestions(response.data || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 1);

      // Optionally fetch stats if a dedicated API exists (mocking the fallback if absent)
      // setStats(await someStatsApiCall());
    } catch (error) {
      console.error('API Error: Failed to fetch questions.', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBackendData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentPage, store.filters]);

  useEffect(() => {
    store.setFilters({ searchQuery: debouncedSearch });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  const handleFilterChange = (key: string, value: string) => {
    store.setFilters({ [key]: value || undefined });
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      setLoading(true);
      await questionApi.deleteQuestion(id);
      await fetchBackendData();
    } catch (error) {
      console.error('API Error: Failed to delete question.', error);
      alert('Failed to delete question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { currentPage } = store;

  return (
    <div
      className="min-h-screen text-slate-200"
      style={{
        background: '#060912',
        backgroundImage: 'radial-gradient(#ffffff0a 1px, transparent 1px)',
        backgroundSize: '20px 20px',
        fontFamily: '"Inter", system-ui, sans-serif'
      }}
    >
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 35% at 50% 0%, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />

      <header className="sticky top-0 z-40 bg-[#060912]/90 backdrop-blur-md border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/features')}
              className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/5 border border-white/5 text-slate-400 hover:text-white transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p className="text-[10px] font-bold text-indigo-400 font-mono tracking-widest uppercase flex items-center gap-2 mb-1">
                <Database className="w-3 h-3" /> MASTER QUESTION REPOSITORY
              </p>
              <h1 className="text-xl font-black text-white tracking-wide">Manage Questions</h1>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={() => store.openOcrWizard()}
              className="flex items-center gap-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            >
              <Scan className="w-4 h-4" /> OCR Import
            </button>
            <button
              onClick={() => store.openImportWizard()}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
            >
              <Database className="w-4 h-4" /> Import Data
            </button>
            <button
              onClick={() => store.openEditor()}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              <Plus className="w-4 h-4" /> Add New Question
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 flex flex-col gap-8 relative z-10">

        <div className="flex items-center gap-6 border-b border-white/5 mb-8 overflow-x-auto custom-scrollbar pb-1">
          {(
            [
              { label: 'All Questions', status: undefined },
              { label: 'Pending Review', status: 'PENDING_REVIEW' },
              { label: 'Under Review', status: 'UNDER_REVIEW' },
              { label: 'Approved', status: 'APPROVED' },
              { label: 'Published', status: 'PUBLISHED' },
              { label: 'Changes Requested', status: 'CHANGES_REQUESTED' },
              { label: 'Rejected', status: 'REJECTED' },
              { label: 'Drafts', status: 'DRAFT' },
              { label: 'Archived', status: 'ARCHIVED' },
            ] as { label: string; status?: QbStatus }[]
          ).map(tab => {
            const isActive = store.filters.status === tab.status;
            return (
              <button
                key={tab.label}
                onClick={() => store.setFilters({ status: tab.status })}
                className={`pb-4 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors relative ${isActive ? 'text-indigo-400' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                )}
              </button>
            );
          })}
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Database} label="Total Bank" value={stats?.totalQuestions || 0} />
          <StatCard icon={Clock} label="Pending" value={stats?.pendingReview || 0} color="text-amber-400" />
          <StatCard icon={Search} label="In Review" value={stats?.underReview || 0} color="text-blue-400" />
          <StatCard icon={CheckCircle2} label="Approved" value={stats?.approvedQuestions || 0} color="text-emerald-400" />
          <StatCard icon={CheckCircle2} label="Published" value={stats?.publishedQuestions || 0} color="text-indigo-400" />
          <StatCard icon={XCircle} label="Rejected" value={stats?.rejectedQuestions || 0} color="text-red-400" />
        </section>

        <section className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Search by ID, title, or content..."
                className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 transition-colors"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-all ${showFilters ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400' : 'bg-white/5 border-white/5 text-slate-400 hover:text-white hover:border-white/10'
                  }`}
              >
                <Filter className="w-4 h-4" /> Filters
              </button>
              <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-slate-400 hover:text-white transition-all">
                <Settings className="w-4 h-4" /> Export
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-white/5 mt-2">
                  {[
                    { label: 'Source', key: 'sourceType', options: SOURCES },
                    { label: 'Department', key: 'department', options: DEPARTMENTS },
                    { label: 'Subject', key: 'subject', options: SUBJECTS },
                    { label: 'Difficulty', key: 'difficulty', options: Object.keys(DIFF_COLORS) },
                    { label: 'Status', key: 'status', options: Object.keys(STATUS_CONFIG) },
                  ].map(filter => (
                    <div key={filter.key}>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">{filter.label}</label>
                      <select
                        value={store.filters[filter.key as keyof typeof store.filters] as string || ''}
                        onChange={e => handleFilterChange(filter.key, e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/40 cursor-pointer"
                      >
                        <option value="" className="bg-[#0e1322]">All</option>
                        {filter.options.map(opt => <option key={opt} value={opt} className="bg-[#0e1322]">{opt.replace(/_/g, ' ')}</option>)}
                      </select>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section className="bg-[#0e1322]/50 border border-white/5 rounded-2xl flex flex-col flex-1 overflow-hidden min-h-[500px]">
          {loading ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
              <p className="text-xs font-bold text-indigo-400 font-mono tracking-widest uppercase animate-pulse">Syncing Repository...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <AlertCircle className="w-12 h-12 text-slate-600 mb-4" />
              <p className="text-lg font-bold text-slate-300">No questions found</p>
              <p className="text-sm text-slate-500 mt-1">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#0e1322] border-b border-white/5 sticky top-0 z-20">
                  <tr>
                    <th className="p-4 pl-6 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12">
                      <input type="checkbox" className="rounded bg-black/40 border-white/10" />
                    </th>
                    <th className="p-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[250px]">Question Details</th>
                    <th className="p-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[150px]">Classification</th>
                    <th className="p-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider min-w-[150px]">Source & Type</th>
                    <th className="p-4 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status & Ver.</th>
                    <th className="p-4 pr-6 text-right text-[10px] font-bold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {questions.map((q) => {
                    const statusCfg = STATUS_CONFIG[q.status] || STATUS_CONFIG.DRAFT;
                    return (
                      <tr key={q.id} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="p-4 pl-6"><input type="checkbox" className="rounded bg-black/40 border-white/10" /></td>
                        <td className="p-4 align-top">
                          <p className="text-sm font-medium text-white line-clamp-2 leading-relaxed mb-2">{q.questionText || "No content available"}</p>
                          <div className="flex flex-wrap gap-2">
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${q.difficulty ? (DIFF_COLORS[q.difficulty] || DIFF_COLORS.MEDIUM) : DIFF_COLORS.MEDIUM}`}>
                              {(q.difficulty || "UNKNOWN").replace(/_/g, ' ')}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded uppercase">{q.publicId || "NO-ID"}</span>
                            {(q.version ?? 1) > 1 && (
                              <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded">v{q.version}</span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-top">
                          <p className="text-xs font-bold text-slate-300">{q.subject || "No Subject"}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Unit {q.unit ?? "N/A"} · {q.topic || "No Topic"}</p>
                        </td>
                        <td className="p-4 align-top">
                          <div className="flex flex-col gap-1.5">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-white/5 border border-white/10 px-2 py-1 rounded w-max">
                              {(q.questionType || "UNKNOWN").replace(/_/g, ' ')}
                            </p>

                            <div className="mt-1">
                              <p className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{(q.sourceType || "UNKNOWN").replace(/_/g, ' ')}</p>
                              {q.metadata?.sourceType === 'GATE' && (
                                <p className="text-[9px] text-slate-400 font-mono mt-0.5">GATE {q.metadata?.examYear ?? "N/A"} • {q.metadata?.branch ?? "N/A"}</p>
                              )}
                              {q.metadata?.sourceType === 'RGPV_PYQ' && (
                                <p className="text-[9px] text-slate-400 font-mono mt-0.5">{q.metadata?.university ?? "N/A"} {q.metadata?.year ?? "N/A"} • {q.metadata?.branch ?? "N/A"}</p>
                              )}
                              {q.metadata?.sourceType === 'TEXTBOOK' && (
                                <p className="text-[9px] text-slate-400 font-mono mt-0.5 line-clamp-1">{q.metadata?.bookName ?? "N/A"}</p>
                              )}
                              {q.metadata?.sourceType === 'PLACEMENT' && (
                                <p className="text-[9px] text-slate-400 font-mono mt-0.5">{q.metadata?.companyName ?? "N/A"} {q.metadata?.recruitmentYear ?? "N/A"}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 pr-6 align-top text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => store.openEditor(q)}
                              className="text-[10px] font-bold text-slate-400 hover:text-white uppercase tracking-wider border border-white/10 hover:bg-white/5 px-3 py-1.5 rounded transition-all"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => store.openReviewPanel(q)}
                              className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider border border-indigo-500/30 hover:bg-indigo-500/10 px-3 py-1.5 rounded transition-all"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleDeleteQuestion(q.id)}
                              className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase tracking-wider border border-red-500/30 hover:bg-red-500/10 px-3 py-1.5 rounded transition-all"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          <div className="mt-auto border-t border-white/5 bg-black/20 p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Showing <span className="text-white">{questions.length ? (currentPage - 1) * store.pageSize + 1 : 0}</span> to <span className="text-white">{Math.min(currentPage * store.pageSize, totalElements)}</span> of <span className="text-white">{totalElements}</span> entries
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1 || loading}
                onClick={() => store.setPage(currentPage - 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, idx) => {
                  let pageNum = idx + 1;
                  if (totalPages > 5 && currentPage > 3) {
                    pageNum = currentPage - 2 + idx;
                    if (pageNum > totalPages) return null;
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => store.setPage(pageNum)}
                      disabled={loading}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold transition-all ${currentPage === pageNum
                        ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                        : 'border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                        }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <span className="text-slate-500 text-xs tracking-widest px-1">...</span>
                )}
              </div>
              <button
                disabled={currentPage === totalPages || loading || totalElements === 0}
                onClick={() => store.setPage(currentPage + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Editor Modal Overlay */}
      <QuestionEditorModal onSave={fetchBackendData} />

      {/* Bulk Import Wizard Overlay */}
      <ImportWizardModal />

      {/* Governance Review Panel Overlay */}
      <ReviewPanelModal />

      {/* OCR Import Wizard Overlay */}
      <OcrImportWizardModal />
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color?: string;
}

const StatCard = ({ icon: Icon, label, value, color }: StatCardProps) => (
  <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden group">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 border border-white/5 ${color || 'text-slate-400'}`}>
      <Icon className="w-4 h-4" />
    </div>
    <div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</p>
    </div>
  </div>
);
