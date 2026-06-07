import React from 'react';
import type { QbQuestionType, QbDifficulty, QbSourceType } from '../../types/questionBank';

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Electrical', 'Mechanical', 'Civil'];
const SUBJECTS = ['DBMS', 'OS', 'DSA', 'OOP', 'CN', 'C Programming', 'C++', 'Java', 'Python'];

const QUESTION_TYPES: QbQuestionType[] = [
  'SINGLE_CHOICE', 'MULTIPLE_CHOICE', 'TRUE_FALSE', 'ASSERTION_REASON', 
  'MATCH_THE_FOLLOWING', 'FILL_IN_THE_BLANK', 'NUMERICAL', 'THEORY', 
  'SHORT_ANSWER', 'LONG_ANSWER', 'CODE_OUTPUT', 'CODE_DEBUGGING', 
  'CODE_WRITING', 'CASE_STUDY', 'DIAGRAM_BASED', 'IMAGE_BASED'
];

const SOURCES: QbSourceType[] = [
  'RGPV_PYQ', 'TEXTBOOK', 'FACULTY_CREATED', 'PLACEMENT', 'GATE', 
  'AI_GENERATED', 'LAB_VIVA', 'INTERVIEW_QUESTION', 'ASSIGNMENT_QUESTION', 
  'UNIVERSITY_QUESTION_BANK', 'OTHER'
];

const DIFFICULTIES: QbDifficulty[] = [
  'EASY', 'MEDIUM', 'HARD', 'UNIVERSITY_EXAM', 'PLACEMENT_LEVEL', 'GATE_LEVEL'
];

interface BasicInfoProps {
  formData: any;
  updateForm: (field: string, value: any) => void;
}

export default function BasicInfoSection({ formData, updateForm }: BasicInfoProps) {
  return (
    <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-3">Basic Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Question Title <span className="text-red-400">*</span></label>
          <input
            type="text"
            required
            value={formData.title || ''}
            onChange={e => updateForm('title', e.target.value)}
            placeholder="e.g. ACID Properties Explanation"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Question Text <span className="text-red-400">*</span></label>
          <textarea
            required
            rows={4}
            value={formData.questionText || ''}
            onChange={e => updateForm('questionText', e.target.value)}
            placeholder="Type your main question prompt here..."
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40 font-mono"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Question Type <span className="text-red-400">*</span></label>
          <select
            required
            value={formData.questionType || ''}
            onChange={e => updateForm('questionType', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/40"
          >
            <option value="" disabled>Select Type...</option>
            {QUESTION_TYPES.map(t => <option key={t} value={t} className="bg-[#0e1322]">{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Source Type <span className="text-red-400">*</span></label>
          <select
            required
            value={formData.sourceType || ''}
            onChange={e => updateForm('sourceType', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/40"
          >
            <option value="" disabled>Select Source...</option>
            {SOURCES.map(t => <option key={t} value={t} className="bg-[#0e1322]">{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Department <span className="text-red-400">*</span></label>
          <select
            required
            value={formData.department || ''}
            onChange={e => updateForm('department', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/40"
          >
            <option value="" disabled>Select Department...</option>
            {DEPARTMENTS.map(t => <option key={t} value={t} className="bg-[#0e1322]">{t}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Subject <span className="text-red-400">*</span></label>
          <select
            required
            value={formData.subject || ''}
            onChange={e => updateForm('subject', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/40"
          >
            <option value="" disabled>Select Subject...</option>
            {SUBJECTS.map(t => <option key={t} value={t} className="bg-[#0e1322]">{t}</option>)}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Difficulty <span className="text-red-400">*</span></label>
          <select
            required
            value={formData.difficulty || ''}
            onChange={e => updateForm('difficulty', e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500/40"
          >
            <option value="" disabled>Select Difficulty...</option>
            {DIFFICULTIES.map(t => <option key={t} value={t} className="bg-[#0e1322]">{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        
        <div>
           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Unit / Module</label>
           <input
             type="number"
             min={1}
             value={formData.unit || ''}
             onChange={e => updateForm('unit', Number(e.target.value))}
             placeholder="e.g. 1"
             className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
           />
        </div>

        <div className="md:col-span-2">
           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Specific Topic</label>
           <input
             type="text"
             value={formData.topic || ''}
             onChange={e => updateForm('topic', e.target.value)}
             placeholder="e.g. Normalization (1NF, 2NF)"
             className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
           />
        </div>

        <div>
           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Marks <span className="text-red-400">*</span></label>
           <input
             type="number"
             required
             min={0}
             value={formData.marks === undefined ? '' : formData.marks}
             onChange={e => updateForm('marks', Number(e.target.value))}
             placeholder="e.g. 5"
             className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
           />
        </div>

        <div>
           <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Negative Marks</label>
           <input
             type="number"
             min={0}
             value={formData.negativeMarks === undefined ? '' : formData.negativeMarks}
             onChange={e => updateForm('negativeMarks', Number(e.target.value))}
             placeholder="e.g. 1 (Leave 0 if none)"
             className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
           />
        </div>

      </div>
    </div>
  );
}
