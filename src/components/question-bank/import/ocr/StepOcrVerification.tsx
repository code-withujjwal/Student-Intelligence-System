import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle2, SplitSquareHorizontal, Type, Edit3, Merge } from 'lucide-react';
import type { OcrResult, ExtractedQuestion } from '../../../../services/mockOcrService';
import type { QbQuestionType } from '../../../../types/questionBank';

interface StepOcrVerificationProps {
  ocrResults: OcrResult[];
  onVerified: (verifiedQuestions: any[]) => void;
  onCancel: () => void;
}

export default function StepOcrVerification({ ocrResults, onVerified, onCancel }: StepOcrVerificationProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  // We maintain a local mutable copy of the extracted questions for the current image
  const [editableResults, setEditableResults] = useState<OcrResult[]>(JSON.parse(JSON.stringify(ocrResults)));
  
  const currentResult = editableResults[currentIndex];

  const updateQuestionText = (qIdx: number, newText: string) => {
    const newResults = [...editableResults];
    newResults[currentIndex].extractedQuestions[qIdx].rawText = newText;
    setEditableResults(newResults);
  };

  const updateQuestionType = (qIdx: number, newType: QbQuestionType) => {
    const newResults = [...editableResults];
    newResults[currentIndex].extractedQuestions[qIdx].inferredType = newType;
    setEditableResults(newResults);
  };

  const removeQuestion = (qIdx: number) => {
    const newResults = [...editableResults];
    newResults[currentIndex].extractedQuestions.splice(qIdx, 1);
    setEditableResults(newResults);
  };

  const mergeWithPrevious = (qIdx: number) => {
    if (qIdx === 0) return;
    const newResults = [...editableResults];
    const currentQ = newResults[currentIndex].extractedQuestions[qIdx];
    const prevQ = newResults[currentIndex].extractedQuestions[qIdx - 1];
    
    prevQ.rawText += '\n' + currentQ.rawText;
    newResults[currentIndex].extractedQuestions.splice(qIdx, 1);
    setEditableResults(newResults);
  };

  const handleCompleteVerification = () => {
    // Flatten all verified questions into a single array
    const allQuestions = editableResults.flatMap(res => 
      res.extractedQuestions.map(q => ({
        questionText: q.rawText,
        questionType: q.inferredType,
        _sourceImage: res.imageUrl // Keep track if needed
      }))
    );
    onVerified(allQuestions);
  };

  if (!currentResult) return null;

  return (
    <div className="flex flex-col h-[600px] gap-6">
      
      {/* Header Controls */}
      <div className="flex items-center justify-between bg-black/20 p-4 rounded-xl border border-white/5 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="text-sm font-bold text-slate-300">
            Reviewing Image {currentIndex + 1} of {editableResults.length}
          </div>
          <button 
            onClick={() => setCurrentIndex(prev => Math.min(editableResults.length - 1, prev + 1))}
            disabled={currentIndex === editableResults.length - 1}
            className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-white disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <button 
          onClick={handleCompleteVerification}
          className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
        >
          Confirm All Extracted Content
        </button>
      </div>

      {/* Side by Side Editor */}
      <div className="flex flex-1 gap-6 min-h-0">
        
        {/* Left: Source Image */}
        <div className="w-1/2 flex flex-col bg-[#0e1322]/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-white/5 bg-black/40 flex items-center gap-2">
            <SplitSquareHorizontal className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Source Image</span>
          </div>
          <div className="flex-1 p-4 overflow-auto bg-black/20 custom-scrollbar flex items-center justify-center relative">
            <img 
              src={currentResult.imageUrl} 
              alt="Source" 
              className="max-w-full max-h-[800px] object-contain rounded border border-white/10" 
            />
          </div>
        </div>

        {/* Right: Extracted Questions */}
        <div className="w-1/2 flex flex-col bg-[#0e1322]/50 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-3 border-b border-white/5 bg-black/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Extracted Questions ({currentResult.extractedQuestions.length})</span>
            </div>
            <span className="text-[10px] text-slate-500 font-bold">Auto-split by engine</span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 custom-scrollbar">
            {currentResult.extractedQuestions.map((q, qIdx) => (
              <div key={q.id} className="bg-black/40 border border-white/10 rounded-xl p-4 flex flex-col gap-3 group relative">
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/30">
                    Extracted #{qIdx + 1}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {qIdx > 0 && (
                      <button onClick={() => mergeWithPrevious(qIdx)} className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded">
                        <Merge className="w-3 h-3" /> Merge Up
                      </button>
                    )}
                    <button onClick={() => removeQuestion(qIdx)} className="text-[10px] font-bold text-red-400 hover:text-red-300 flex items-center gap-1 bg-red-500/10 px-2 py-1 rounded">
                      Delete Noise
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <Edit3 className="absolute right-2 top-2 w-4 h-4 text-slate-500 pointer-events-none" />
                  <textarea
                    value={q.rawText}
                    onChange={(e) => updateQuestionText(qIdx, e.target.value)}
                    className="w-full bg-[#060912] border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 min-h-[80px] font-mono leading-relaxed resize-y"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Detected Type:</label>
                  <select
                    value={q.inferredType}
                    onChange={(e) => updateQuestionType(qIdx, e.target.value as QbQuestionType)}
                    className="flex-1 bg-[#060912] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-emerald-400 font-bold focus:outline-none focus:border-emerald-500/50 appearance-none"
                  >
                    <option value="SINGLE_CHOICE">Single Choice (MCQ)</option>
                    <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                    <option value="TRUE_FALSE">True / False</option>
                    <option value="THEORY">Theory / Subjective</option>
                    <option value="CODE_WRITING">Code Writing</option>
                    <option value="NUMERICAL">Numerical</option>
                  </select>
                </div>

              </div>
            ))}

            {currentResult.extractedQuestions.length === 0 && (
              <div className="text-center p-8 text-slate-500 text-sm font-bold">
                All questions merged or deleted.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
