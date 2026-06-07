import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, Clock, ShieldCheck, Search, SearchX, UploadCloud, Archive, MessageSquare } from 'lucide-react';
import { useQuestionBankStore } from '../../../store/useQuestionBankStore';
import { toast } from 'sonner';

export default function ReviewPanelModal() {
  const store = useQuestionBankStore();
  const q = store.reviewingQuestion;
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'AUDIT' | 'VERSIONS'>('DETAILS');
  const [showRejectionInput, setShowRejectionInput] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [rejectionAction, setRejectionAction] = useState<'REJECTED' | 'CHANGES_REQUESTED'>('REJECTED');
  
  const [isProcessing, setIsProcessing] = useState(false);

  if (!q) return null;

  const handleClose = () => {
    store.closeReviewPanel();
    setTimeout(() => {
      setActiveTab('DETAILS');
      setShowRejectionInput(false);
      setRejectionNote('');
    }, 300);
  };

  const handleStatusChange = async (status: any, requireNotes: boolean = false) => {
    if (requireNotes && !showRejectionInput) {
      setRejectionAction(status);
      setShowRejectionInput(true);
      return;
    }
    if (requireNotes && !rejectionNote.trim()) {
      toast.error('Notes are required for this action.');
      return;
    }

    setIsProcessing(true);
    await store.transitionQuestionStatus(q.id, status, requireNotes ? rejectionNote : `Changed status to ${status}`, 'admin_user', requireNotes ? rejectionNote : undefined);
    setIsProcessing(false);
    toast.success(`Question updated successfully`);
  };

  const renderDetails = () => (
    <div className="flex flex-col gap-6">
      {/* Overview Card */}
      <div className="bg-[#0e1322]/80 border border-white/5 rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Question Text</h3>
            <p className="text-lg text-white font-medium leading-relaxed">{q.questionText}</p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0 ml-6">
            <span className="text-[10px] font-bold bg-white/10 text-white px-2 py-1 rounded uppercase">{q.publicId}</span>
            <span className="text-[10px] font-bold border border-indigo-500/30 text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded uppercase">v{q.version || 1}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Subject</span>
            <span className="text-sm text-white font-medium">{q.subject}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Type</span>
            <span className="text-sm text-indigo-400 font-bold">{q.questionType.replace(/_/g, ' ')}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Difficulty</span>
            <span className="text-sm text-amber-400 font-bold">{q.difficulty.replace(/_/g, ' ')}</span>
          </div>
          <div>
            <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Marks</span>
            <span className="text-sm text-white font-mono">{q.marks}M (-{q.negativeMarks}M)</span>
          </div>
        </div>
      </div>

      {/* Rejection Reasons if applicable */}
      {(q.status === 'REJECTED' || q.status === 'CHANGES_REQUESTED') && q.rejectionReason && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-red-400 mb-1">Reviewer Feedback</h4>
            <p className="text-xs text-red-300/80">{q.rejectionReason}</p>
          </div>
        </div>
      )}
      
      {q.reviewNotes && q.status !== 'REJECTED' && q.status !== 'CHANGES_REQUESTED' && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex gap-3">
          <MessageSquare className="w-5 h-5 text-blue-400 shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-blue-400 mb-1">Latest Note</h4>
            <p className="text-xs text-blue-300/80">{q.reviewNotes}</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderAudit = () => (
    <div className="flex flex-col gap-0 relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-white/10 z-0" />
      {(q.auditTrail || []).map((event, idx) => (
        <div key={idx} className="relative z-10 flex gap-4 p-4 hover:bg-white/[0.02] transition-colors group">
          <div className="w-8 h-8 rounded-full bg-[#060912] border-2 border-indigo-500/30 flex items-center justify-center shrink-0">
            <Clock className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-bold text-white">{event.action}</span>
              <span className="text-[10px] text-slate-500 font-mono">{new Date(event.timestamp).toLocaleString()}</span>
            </div>
            <p className="text-xs text-slate-400 mb-1">{event.notes}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase">By: {event.user}</p>
          </div>
        </div>
      ))}
      {(!q.auditTrail || q.auditTrail.length === 0) && (
        <div className="text-center p-8 text-slate-500 text-sm">No audit history found.</div>
      )}
    </div>
  );

  const renderVersions = () => (
    <div className="flex flex-col gap-4">
      {(!q.versions || q.versions.length === 0) && (
        <div className="text-center p-8 text-slate-500 text-sm">No previous versions exist.</div>
      )}
      {(q.versions || []).map((v, idx) => (
        <div key={idx} className="bg-[#0e1322]/50 border border-white/5 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded">v{v.version}</span>
              <span className="text-xs text-slate-400 font-mono">{new Date(v.timestamp).toLocaleString()}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase">By {v.modifiedBy}</span>
          </div>
          <div className="text-sm text-slate-300">
            <p className="font-bold mb-1">Snapshot Question Text:</p>
            <p className="italic bg-black/40 p-3 rounded-lg border border-white/5">{v.snapshot.questionText}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {store.isReviewPanelOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex justify-end bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="w-full max-w-3xl h-full bg-[#060912] border-l border-white/10 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 bg-black/40 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-white tracking-wide uppercase flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" /> Quality Governance Review
                </h2>
                <div className="text-xs text-slate-400 font-mono mt-1">Current Status: <span className="font-bold text-white">{q.status.replace(/_/g, ' ')}</span></div>
              </div>
              <button onClick={handleClose} disabled={isProcessing} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-slate-400 disabled:opacity-50">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/5 px-6 pt-4 bg-[#0e1322]">
              {['DETAILS', 'AUDIT', 'VERSIONS'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 pb-3 text-xs font-bold uppercase tracking-wider relative transition-colors ${activeTab === tab ? 'text-indigo-400' : 'text-slate-500 hover:text-white'}`}
                >
                  {tab}
                  {activeTab === tab && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-indigo-500" />}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {activeTab === 'DETAILS' && renderDetails()}
              {activeTab === 'AUDIT' && renderAudit()}
              {activeTab === 'VERSIONS' && renderVersions()}
            </div>

            {/* Rejection Input Overlay */}
            {showRejectionInput && (
              <div className="p-6 border-t border-white/10 bg-[#0e1322]/90">
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                  Reason for {rejectionAction === 'REJECTED' ? 'Rejection' : 'Requesting Changes'}
                </label>
                <textarea
                  autoFocus
                  value={rejectionNote}
                  onChange={e => setRejectionNote(e.target.value)}
                  placeholder="Provide detailed feedback..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 mb-3"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowRejectionInput(false)} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white bg-white/5 rounded-lg">Cancel</button>
                  <button 
                    onClick={() => handleStatusChange(rejectionAction, true)}
                    disabled={!rejectionNote.trim() || isProcessing}
                    className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg disabled:opacity-50"
                  >
                    Confirm Action
                  </button>
                </div>
              </div>
            )}

            {/* Actions Bar (Only if not showing rejection input) */}
            {!showRejectionInput && (
              <div className="p-6 border-t border-white/10 bg-black/40 flex flex-wrap gap-3">
                <button onClick={() => handleStatusChange('APPROVED')} disabled={isProcessing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all">
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </button>
                <button onClick={() => handleStatusChange('PUBLISHED')} disabled={isProcessing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 hover:bg-indigo-500/20 transition-all">
                  <UploadCloud className="w-4 h-4" /> Publish
                </button>
                <button onClick={() => handleStatusChange('CHANGES_REQUESTED', true)} disabled={isProcessing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition-all">
                  <AlertCircle className="w-4 h-4" /> Request Fix
                </button>
                <button onClick={() => handleStatusChange('REJECTED', true)} disabled={isProcessing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 transition-all">
                  <X className="w-4 h-4" /> Reject
                </button>
              </div>
            )}
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
