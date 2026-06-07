import React, { useState } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import type { QbAcademicImportance } from '../../types/questionBank';

interface TagManagerProps {
  tags: string[];
  updateTags: (tags: string[]) => void;
  academicImportance: QbAcademicImportance;
  updateAcademicImportance: (val: QbAcademicImportance) => void;
}

const IMPORTANCE_LEVELS: QbAcademicImportance[] = [
  'NORMAL', 'IMPORTANT', 'REPEATED_PYQ', 'HIGH_WEIGHTAGE', 'MUST_PRACTICE'
];

const SUGGESTED_TAGS = [
  'Important', 'Repeated PYQ', 'High Weightage', 'Must Practice', 
  'Faculty Recommended', 'Placement Favorite', 'GATE Favorite', 'Viva Important'
];

export default function TagManager({ tags, updateTags, academicImportance, updateAcademicImportance }: TagManagerProps) {
  const [newTag, setNewTag] = useState('');

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !tags.includes(trimmed)) {
      updateTags([...tags, trimmed]);
    }
    setNewTag('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(newTag);
    }
  };

  const removeTag = (tagToRemove: string) => {
    updateTags(tags.filter(t => t !== tagToRemove));
  };

  return (
    <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6 flex flex-col gap-6 mt-6">
      <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-3 flex items-center gap-2">
        <TagIcon className="w-4 h-4 text-slate-400" /> Tags & Academic Info
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Academic Importance</label>
          <select
            value={academicImportance}
            onChange={e => updateAcademicImportance(e.target.value as QbAcademicImportance)}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white appearance-none focus:outline-none focus:border-amber-500/40"
          >
            {IMPORTANCE_LEVELS.map(level => (
              <option key={level} value={level} className="bg-[#0e1322]">
                {level === 'NORMAL' ? level : `★ ${level.replace(/_/g, ' ')}`}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Custom Tags</label>
          <div className="relative flex items-center">
            <input
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type and press Enter..."
              className="w-full bg-black/40 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/40"
            />
            <button 
              onClick={(e) => { e.preventDefault(); addTag(newTag); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-slate-400 hover:text-white bg-white/5 rounded-md transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Active Tags</label>
        <div className="flex flex-wrap gap-2 min-h-[40px] p-2 rounded-xl bg-black/20 border border-white/5">
          {tags.length === 0 && <span className="text-xs text-slate-600 italic px-2 py-1">No tags added...</span>}
          {tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
              {tag}
              <button onClick={() => removeTag(tag)} className="hover:text-indigo-200">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Suggested Quick Tags</label>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_TAGS.map(tag => (
            <button
              key={tag}
              onClick={(e) => { e.preventDefault(); addTag(tag); }}
              disabled={tags.includes(tag)}
              className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed border border-white/5 px-2 py-1 rounded uppercase transition-colors"
            >
              + {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
