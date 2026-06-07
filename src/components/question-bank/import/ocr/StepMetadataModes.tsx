import React, { useState } from 'react';
import { BookOpen, GraduationCap, Briefcase, FileText } from 'lucide-react';
import type { QbDifficulty } from '../../../../types/questionBank';

interface StepMetadataModesProps {
  onApply: (globalMetadata: any) => void;
}

const MODES = [
  { id: 'RGPV_PYQ', icon: GraduationCap, label: 'RGPV Exam Papers', desc: 'Pre-fills University, Branch, Year, etc.' },
  { id: 'GATE', icon: FileText, label: 'GATE Questions', desc: 'Pre-fills Exam Year, Branch, Difficulty.' },
  { id: 'TEXTBOOK', icon: BookOpen, label: 'Textbook Extract', desc: 'Pre-fills Book Name, Author, Edition.' },
  { id: 'FACULTY_CREATED', icon: Briefcase, label: 'Faculty Notes', desc: 'Generic assignment or class notes.' }
];

export default function StepMetadataModes({ onApply }: StepMetadataModesProps) {
  const [selectedMode, setSelectedMode] = useState<string>('RGPV_PYQ');
  
  // Shared global fields
  const [department, setDepartment] = useState('Computer Science');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState<QbDifficulty>('MEDIUM');
  const [marks, setMarks] = useState(7);
  const [tags, setTags] = useState('');

  // Mode specific fields
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [bookName, setBookName] = useState('');

  const handleApply = () => {
    let metadata: any = { sourceType: selectedMode };
    
    if (selectedMode === 'RGPV_PYQ') {
      metadata = { ...metadata, university: 'RGPV', branch: department, year, subject };
    } else if (selectedMode === 'GATE') {
      metadata = { ...metadata, examYear: year, branch: department, difficulty };
    } else if (selectedMode === 'TEXTBOOK') {
      metadata = { ...metadata, bookName };
    }

    onApply({
      department,
      subject,
      difficulty,
      marks,
      sourceType: selectedMode,
      metadata,
      tags: tags ? tags.split(',').map(t => t.trim()) : []
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      
      <div>
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">1. Select Import Mode</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {MODES.map(mode => {
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
                  isSelected ? 'bg-indigo-500/10 border-indigo-500' : 'bg-black/20 border-white/5 hover:border-white/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isSelected ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400'}`}>
                  <mode.icon className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${isSelected ? 'text-indigo-400' : 'text-slate-300'}`}>{mode.label}</span>
                <span className="text-[10px] text-slate-500 leading-tight">{mode.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6 border-b border-white/5 pb-4">
          2. Global Properties
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Department</label>
            <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white">
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics">Electronics</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Subject</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. DBMS" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value as any)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white">
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
                <option value="UNIVERSITY_EXAM">University Exam</option>
                <option value="GATE_LEVEL">GATE Level</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Marks</label>
              <input type="number" value={marks} onChange={e => setMarks(Number(e.target.value))} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Tags (Comma Separated)</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. Important, Unit 1" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white" />
          </div>

          {/* Conditional Mode Fields */}
          {(selectedMode === 'RGPV_PYQ' || selectedMode === 'GATE') && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Exam Year</label>
              <input type="number" value={year} onChange={e => setYear(Number(e.target.value))} className="w-full bg-black/40 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500" />
            </div>
          )}
          {selectedMode === 'TEXTBOOK' && (
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Book Name</label>
              <input type="text" value={bookName} onChange={e => setBookName(e.target.value)} className="w-full bg-black/40 border border-indigo-500/30 rounded-xl px-4 py-2.5 text-sm text-white focus:border-indigo-500" />
            </div>
          )}

        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={handleApply}
          className="px-6 py-3 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
        >
          Apply to All Extracted Questions
        </button>
      </div>

    </div>
  );
}
