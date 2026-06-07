import React from 'react';
import type { QbQuestionType } from '../../types/questionBank';

interface DynamicTypeProps {
  questionType: QbQuestionType;
  formData: any;
  updateForm: (field: string, value: any) => void;
}

export default function DynamicTypeForm({ questionType, formData, updateForm }: DynamicTypeProps) {
  if (!questionType) return null;

  return (
    <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-6 mt-6">
      <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-wider border-b border-indigo-500/20 pb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
        {questionType.replace(/_/g, ' ')} Configurations
      </h3>

      <div className="grid grid-cols-1 gap-4">
        {(questionType === 'SINGLE_CHOICE' || questionType === 'MULTIPLE_CHOICE') && (
          <>
            {[1, 2, 3, 4].map(idx => (
              <div key={idx} className="flex items-center gap-4">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Opt {idx}</span>
                <input
                  type="text"
                  placeholder={`Option ${idx}`}
                  value={formData.options?.[idx-1] || ''}
                  onChange={(e) => {
                    const newOpts = [...(formData.options || ['', '', '', ''])];
                    newOpts[idx-1] = e.target.value;
                    updateForm('options', newOpts);
                  }}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
                />
              </div>
            ))}
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Correct Answer(s)</label>
              <input
                type="text"
                placeholder="e.g. Option 1, Option 3"
                value={formData.correctAnswer || ''}
                onChange={e => updateForm('correctAnswer', e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-emerald-400 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40"
              />
            </div>
          </>
        )}

        {questionType === 'TRUE_FALSE' && (
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Correct Answer</label>
            <select
              value={formData.correctAnswer || ''}
              onChange={e => updateForm('correctAnswer', e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-emerald-400 appearance-none focus:outline-none focus:border-emerald-500/40"
            >
              <option value="" disabled>Select True or False</option>
              <option value="TRUE">TRUE</option>
              <option value="FALSE">FALSE</option>
            </select>
          </div>
        )}

        {(questionType === 'CODE_OUTPUT' || questionType === 'CODE_DEBUGGING' || questionType === 'CODE_WRITING') && (
          <>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Code Block</label>
              <textarea
                rows={6}
                value={formData.codeSnippet || ''}
                onChange={e => updateForm('codeSnippet', e.target.value)}
                placeholder="// Write code snippet here..."
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl px-4 py-3 text-sm text-indigo-300 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Expected Output / Solution</label>
              <textarea
                rows={3}
                value={formData.correctAnswer || ''}
                onChange={e => updateForm('correctAnswer', e.target.value)}
                placeholder="Expected output or correct solution..."
                className="w-full bg-[#0a0a0a] border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-400 placeholder:text-emerald-900/50 focus:outline-none focus:border-emerald-500/40 font-mono"
              />
            </div>
          </>
        )}

        {questionType === 'THEORY' && (
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Answer Guidelines / Keywords</label>
            <textarea
              rows={4}
              value={formData.correctAnswer || ''}
              onChange={e => updateForm('correctAnswer', e.target.value)}
              placeholder="List required keywords or structural expectations..."
              className="w-full bg-black/40 border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-emerald-400 placeholder:text-emerald-900/50 focus:outline-none focus:border-emerald-500/40"
            />
          </div>
        )}

        {questionType === 'MATCH_THE_FOLLOWING' && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Column A (Items)</label>
              <textarea
                rows={4}
                value={formData.matchLeft || ''}
                onChange={e => updateForm('matchLeft', e.target.value)}
                placeholder="1. CPU\n2. RAM..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Column B (Targets)</label>
              <textarea
                rows={4}
                value={formData.matchRight || ''}
                onChange={e => updateForm('matchRight', e.target.value)}
                placeholder="A. Processing\nB. Memory..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
