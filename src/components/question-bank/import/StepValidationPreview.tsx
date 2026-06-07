import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, Copy, Edit2 } from 'lucide-react';
import type { QbQuestion } from '../../types/questionBank';

interface StepValidationPreviewProps {
  data: any[];
  onConfirm: () => void;
  onCancel: () => void;
  onBulkEdit: (field: string, value: any) => void;
  loading: boolean;
}

export default function StepValidationPreview({ data, onConfirm, onCancel, onBulkEdit, loading }: StepValidationPreviewProps) {
  const [bulkField, setBulkField] = useState('');
  const [bulkValue, setBulkValue] = useState('');

  const validCount = data.filter(r => !r._errors?.length && !r._duplicate).length;
  const errorCount = data.filter(r => r._errors?.length).length;
  const dupCount = data.filter(r => r._duplicate).length;

  const handleApplyBulk = () => {
    if (bulkField && bulkValue) {
      onBulkEdit(bulkField, bulkValue);
      setBulkField('');
      setBulkValue('');
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#0e1322]/50 border border-emerald-500/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-2" />
          <p className="text-[10px] font-bold text-slate-500 uppercase">Valid Records</p>
          <p className="text-2xl font-black text-white">{validCount}</p>
        </div>
        <div className="bg-[#0e1322]/50 border border-red-500/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-6 h-6 text-red-400 mb-2" />
          <p className="text-[10px] font-bold text-slate-500 uppercase">Validation Errors</p>
          <p className="text-2xl font-black text-white">{errorCount}</p>
        </div>
        <div className="bg-[#0e1322]/50 border border-amber-500/30 rounded-xl p-4 flex flex-col items-center justify-center text-center">
          <Copy className="w-6 h-6 text-amber-400 mb-2" />
          <p className="text-[10px] font-bold text-slate-500 uppercase">Possible Duplicates</p>
          <p className="text-2xl font-black text-white">{dupCount}</p>
        </div>
      </div>

      {/* Bulk Editor */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-end gap-4">
        <div className="flex-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
            <Edit2 className="w-3 h-3" /> Bulk Edit Selected Field
          </label>
          <select value={bulkField} onChange={e => setBulkField(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white">
            <option value="">-- Select Field to Edit --</option>
            <option value="department">Department</option>
            <option value="subject">Subject</option>
            <option value="difficulty">Difficulty</option>
            <option value="sourceType">Source Type</option>
          </select>
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            placeholder="New Value..." 
            value={bulkValue} 
            onChange={e => setBulkValue(e.target.value)} 
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white" 
          />
        </div>
        <button 
          onClick={handleApplyBulk}
          disabled={!bulkField || !bulkValue}
          className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50"
        >
          Apply Bulk Change
        </button>
      </div>

      {/* Preview Table */}
      <div className="flex-1 bg-[#0e1322]/50 border border-white/5 rounded-2xl overflow-hidden min-h-[300px] flex flex-col">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0e1322] border-b border-white/5 z-10">
              <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4 pl-6">Status</th>
                <th className="p-4">Question Text</th>
                <th className="p-4">Subject</th>
                <th className="p-4">Type & Source</th>
                <th className="p-4 pr-6 text-right">Difficulty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.slice(0, 100).map((row, idx) => (
                <tr key={idx} className="hover:bg-white/[0.02]">
                  <td className="p-4 pl-6 align-top">
                    {row._errors?.length > 0 ? (
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-bold uppercase">
                        <AlertCircle className="w-3 h-3" /> Error
                      </span>
                    ) : row._duplicate ? (
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[9px] font-bold uppercase">
                        <Copy className="w-3 h-3" /> Duplicate
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[9px] font-bold uppercase">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </td>
                  <td className="p-4 align-top max-w-xs">
                    <p className="text-sm font-medium text-white line-clamp-2">{row.questionText || <span className="text-red-400 italic">Missing Text</span>}</p>
                    {row._errors?.length > 0 && (
                      <div className="mt-2 flex flex-col gap-1">
                        {row._errors.map((err: string, i: number) => (
                          <span key={i} className="text-[10px] text-red-400 font-mono">• {err}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="p-4 align-top text-xs text-slate-300">
                    {row.subject || '-'} <br/>
                    <span className="text-[10px] text-slate-500">{row.department || '-'}</span>
                  </td>
                  <td className="p-4 align-top text-[10px]">
                    <span className="text-indigo-400 font-bold block mb-1">{row.questionType?.replace(/_/g, ' ') || '-'}</span>
                    <span className="text-slate-500">{row.sourceType?.replace(/_/g, ' ') || '-'}</span>
                  </td>
                  <td className="p-4 pr-6 align-top text-right text-xs font-bold text-slate-400">
                    {row.difficulty || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 100 && (
            <div className="p-4 text-center text-xs text-slate-500 font-bold border-t border-white/5">
              Showing first 100 of {data.length} records.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="text-xs text-slate-400">
          * Invalid and Duplicate rows will be skipped during import unless resolved.
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white bg-white/5 transition-colors">
            Cancel Import
          </button>
          <button 
            onClick={onConfirm}
            disabled={validCount === 0 || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Confirm Import ({validCount} Valid)
          </button>
        </div>
      </div>
    </div>
  );
}
