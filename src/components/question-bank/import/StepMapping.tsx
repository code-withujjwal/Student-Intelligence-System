import React, { useState, useEffect } from 'react';
import { ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StepMappingProps {
  parsedData: any[];
  onMapped: (mappedData: any[]) => void;
  onCancel: () => void;
}

const SCHEMA_FIELDS = [
  { key: 'title', label: 'Question Title', required: false },
  { key: 'questionText', label: 'Question Text', required: true },
  { key: 'questionType', label: 'Question Type', required: true },
  { key: 'department', label: 'Department', required: true },
  { key: 'subject', label: 'Subject', required: true },
  { key: 'difficulty', label: 'Difficulty', required: true },
  { key: 'sourceType', label: 'Source Type', required: true },
  { key: 'marks', label: 'Marks', required: true },
  { key: 'negativeMarks', label: 'Negative Marks', required: false },
  { key: 'unit', label: 'Unit', required: false },
  { key: 'topic', label: 'Topic', required: false },
  { key: 'year', label: 'Year (Metadata)', required: false },
  { key: 'companyName', label: 'Company (Metadata)', required: false },
  { key: 'bookName', label: 'Book (Metadata)', required: false },
  { key: 'tags', label: 'Tags (Comma separated)', required: false },
];

export default function StepMapping({ parsedData, onMapped, onCancel }: StepMappingProps) {
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({}); // schemaKey -> fileHeader

  useEffect(() => {
    if (parsedData.length > 0) {
      const headers = Object.keys(parsedData[0]);
      setFileHeaders(headers);

      // Auto-map based on similar names
      const initialMap: Record<string, string> = {};
      SCHEMA_FIELDS.forEach(field => {
        const exactMatch = headers.find(h => h.toLowerCase() === field.key.toLowerCase() || h.toLowerCase() === field.label.toLowerCase());
        if (exactMatch) initialMap[field.key] = exactMatch;
      });
      setMapping(initialMap);
    }
  }, [parsedData]);

  const handleApplyMapping = () => {
    // Transform parsedData based on mapping
    const mappedData = parsedData.map(row => {
      const newRow: any = {};
      Object.keys(mapping).forEach(schemaKey => {
        const fileHeader = mapping[schemaKey];
        if (fileHeader && row[fileHeader] !== undefined) {
          newRow[schemaKey] = row[fileHeader];
        }
      });
      return newRow;
    });
    onMapped(mappedData);
  };

  const missingRequired = SCHEMA_FIELDS.filter(f => f.required && !mapping[f.key]);

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-4 flex gap-3">
        <AlertCircle className="w-5 h-5 text-indigo-400 shrink-0" />
        <div>
          <h4 className="text-sm font-bold text-indigo-400 mb-1">Column Mapping</h4>
          <p className="text-xs text-indigo-300/70">
            We extracted {fileHeaders.length} columns from your file. Map them to the system's required question properties.
          </p>
        </div>
      </div>

      <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl overflow-hidden">
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0e1322] border-b border-white/5 z-10">
              <tr>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">System Field</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider w-12 text-center"></th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider">File Column</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {SCHEMA_FIELDS.map(field => {
                const isMapped = !!mapping[field.key];
                return (
                  <tr key={field.key} className="hover:bg-white/[0.02]">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold ${field.required ? 'text-white' : 'text-slate-400'}`}>
                          {field.label}
                        </span>
                        {field.required && <span className="text-red-400 text-xs">*</span>}
                        {isMapped && <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-2" />}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <ArrowRight className="w-4 h-4 text-slate-600 inline-block" />
                    </td>
                    <td className="p-4">
                      <select
                        value={mapping[field.key] || ''}
                        onChange={e => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className={`w-full bg-black/40 border rounded-xl px-4 py-2.5 text-sm appearance-none focus:outline-none transition-colors ${
                          isMapped ? 'border-emerald-500/30 text-emerald-400' : 'border-white/10 text-slate-400 focus:border-indigo-500/40'
                        }`}
                      >
                        <option value="">-- Ignore / Leave Blank --</option>
                        {fileHeaders.map(h => (
                          <option key={h} value={h} className="bg-[#0e1322]">{h}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <div className="text-xs font-bold">
          {missingRequired.length > 0 ? (
            <span className="text-red-400 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Missing {missingRequired.length} required mappings</span>
          ) : (
            <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> All required fields mapped</span>
          )}
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-400 hover:text-white bg-white/5 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleApplyMapping}
            disabled={missingRequired.length > 0}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Process Mappings
          </button>
        </div>
      </div>
    </div>
  );
}
