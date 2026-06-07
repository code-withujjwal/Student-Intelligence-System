import React from 'react';
import type { QbSourceType, QbMetadata, QbExamType } from '../../types/questionBank';

interface DynamicMetadataProps {
  sourceType: QbSourceType;
  metadata: any;
  updateMetadata: (field: string, value: any) => void;
}

const EXAM_TYPES: QbExamType[] = [
  'MID_SEMESTER', 'END_SEMESTER', 'SUPPLEMENTARY', 'RETEST', 'PRACTICAL_EXAM',
  'LAB_EXAM', 'VIVA', 'SESSIONAL', 'INTERNAL_ASSESSMENT', 'ASSIGNMENT', 'MODEL_PAPER', 'UNIVERSITY_QUESTION_BANK'
];

export default function DynamicMetadataForm({ sourceType, metadata, updateMetadata }: DynamicMetadataProps) {
  if (!sourceType) return null;

  return (
    <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-6 mt-6">
      <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider border-b border-blue-500/20 pb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
        {sourceType.replace(/_/g, ' ')} Metadata
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sourceType === 'RGPV_PYQ' && (
          <>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">University</label>
              <input type="text" value={metadata.university || 'RGPV'} onChange={e => updateMetadata('university', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Year</label>
              <input type="number" value={metadata.year || ''} onChange={e => updateMetadata('year', Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Branch</label>
              <input type="text" value={metadata.branch || ''} onChange={e => updateMetadata('branch', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Semester</label>
              <input type="number" value={metadata.semester || ''} onChange={e => updateMetadata('semester', Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Exam Type</label>
              <select value={metadata.examType || ''} onChange={e => updateMetadata('examType', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40">
                <option value="">Select Exam Type</option>
                {EXAM_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Question No.</label>
              <input type="text" value={metadata.questionNumber || ''} onChange={e => updateMetadata('questionNumber', e.target.value)} placeholder="e.g. 4(a)" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
          </>
        )}

        {sourceType === 'TEXTBOOK' && (
          <>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Book Name</label>
              <input type="text" value={metadata.bookName || ''} onChange={e => updateMetadata('bookName', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Author</label>
              <input type="text" value={metadata.author || ''} onChange={e => updateMetadata('author', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Edition</label>
              <input type="text" value={metadata.edition || ''} onChange={e => updateMetadata('edition', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Chapter / Topic</label>
              <input type="text" value={metadata.chapter || ''} onChange={e => updateMetadata('chapter', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
          </>
        )}

        {sourceType === 'GATE' && (
          <>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Exam Year</label>
              <input type="number" value={metadata.examYear || ''} onChange={e => updateMetadata('examYear', Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Branch</label>
              <input type="text" value={metadata.branch || ''} onChange={e => updateMetadata('branch', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
          </>
        )}

        {sourceType === 'PLACEMENT' && (
          <>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Company</label>
              <input type="text" value={metadata.companyName || ''} onChange={e => updateMetadata('companyName', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Recruitment Year</label>
              <input type="number" value={metadata.recruitmentYear || ''} onChange={e => updateMetadata('recruitmentYear', Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Round Type</label>
              <input type="text" value={metadata.roundType || ''} onChange={e => updateMetadata('roundType', e.target.value)} placeholder="e.g. Technical, HR" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
          </>
        )}

        {sourceType === 'LAB_VIVA' && (
          <>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Lab Name</label>
              <input type="text" value={metadata.labName || ''} onChange={e => updateMetadata('labName', e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1.5">Experiment No.</label>
              <input type="number" value={metadata.experimentNumber || ''} onChange={e => updateMetadata('experimentNumber', Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500/40" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
