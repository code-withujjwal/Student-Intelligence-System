import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { toast } from 'sonner';

interface StepUploadProps {
  onDataParsed: (data: any[], fileMeta: any) => void;
}

export default function StepUpload({ onDataParsed }: StepUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  const processFile = async (file: File) => {
    setLoading(true);
    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      
      if (extension === 'json') {
        const text = await file.text();
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error('JSON file must contain an array of questions');
        onDataParsed(parsed, { name: file.name, type: 'JSON', size: file.size });
      } 
      else if (extension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length) toast.error('Some rows had parsing issues');
            onDataParsed(results.data, { name: file.name, type: 'CSV', size: file.size });
          },
          error: (error) => {
            throw new Error(error.message);
          }
        });
      } 
      else if (extension === 'xlsx' || extension === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(firstSheet);
        onDataParsed(data, { name: file.name, type: 'Excel', size: file.size });
      } else {
        throw new Error('Unsupported file format. Use CSV, JSON, or Excel.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to parse file');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div 
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all ${
          isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-500/50 bg-black/20 hover:bg-black/40'
        }`}
      >
        {loading ? (
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-sm font-bold text-indigo-400">Parsing File...</p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-400">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Drag & Drop File Here</h3>
            <p className="text-sm text-slate-500 mb-6">Supports .xlsx, .csv, and .json formats</p>
            <label className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold text-white cursor-pointer transition-colors">
              Browse Files
              <input type="file" accept=".csv,.xlsx,.xls,.json" className="hidden" onChange={handleFileChange} />
            </label>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Excel / CSV', desc: 'Standard tabular data formats with headers.' },
          { title: 'JSON Arrays', desc: 'Pre-formatted JSON arrays for advanced data.' },
          { title: 'Download Templates', desc: 'Get structured templates to start instantly.', link: true }
        ].map((info, idx) => (
          <div key={idx} className="bg-[#0e1322]/50 border border-white/5 rounded-xl p-4 flex gap-3">
            <FileText className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white mb-1">{info.title}</p>
              <p className="text-[10px] text-slate-500">{info.desc}</p>
              {info.link && <button className="text-[10px] text-indigo-400 hover:underline mt-1 font-bold">Download .xlsx</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
