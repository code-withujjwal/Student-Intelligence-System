import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Send, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useQuestionBankStore } from '../../store/useQuestionBankStore';
import BasicInfoSection from './BasicInfoSection';
import DynamicTypeForm from './DynamicTypeForm';
import DynamicMetadataForm from './DynamicMetadataForm';
import TagManager from './TagManager';
import { toast } from 'sonner';
import type { QbQuestion, QbStatus } from '../../types/questionBank';
import { questionApi } from '../../api/questionApi';

interface QuestionEditorModalProps {
  onSave?: () => void;
}

export default function QuestionEditorModal({ onSave }: QuestionEditorModalProps) {
  const store = useQuestionBankStore();
  
  // Local state for the massive form payload
  const [formData, setFormData] = useState<Partial<QbQuestion>>({});
  const [metadata, setMetadata] = useState<any>({});
  const [tags, setTags] = useState<string[]>([]);
  const [academicImportance, setAcademicImportance] = useState<any>('NORMAL');
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form when opened
  useEffect(() => {
    if (store.isEditorOpen) {
      if (store.editingQuestion) {
        setFormData(store.editingQuestion);
        setMetadata(store.editingQuestion.metadata || {});
        setTags(store.editingQuestion.tags || []);
        setAcademicImportance(store.editingQuestion.academicImportance || 'NORMAL');
        // Simulate image preview from existing url if applicable
        setImagePreview((store.editingQuestion as any).imageUrl || null);
      } else {
        // Reset defaults for new question
        setFormData({
          department: '',
          subject: '',
          questionType: 'SINGLE_CHOICE',
          sourceType: 'FACULTY_CREATED',
          difficulty: 'MEDIUM',
          marks: 1,
          negativeMarks: 0,
        });
        setMetadata({ sourceType: 'FACULTY_CREATED' });
        setTags([]);
        setAcademicImportance('NORMAL');
        setImagePreview(null);
      }
    }
  }, [store.isEditorOpen, store.editingQuestion]);

  // If sourceType changes, reset metadata payload type
  useEffect(() => {
    if (formData.sourceType && formData.sourceType !== metadata.sourceType) {
      setMetadata({ sourceType: formData.sourceType });
    }
  }, [formData.sourceType]);

  const updateForm = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateMetadata = (field: string, value: any) => {
    setMetadata((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      updateForm('imageUrl', url);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    updateForm('imageUrl', null);
  };

  const validateForm = () => {
    if (!formData.title?.trim()) { toast.error('Title is required'); return false; }
    if (!formData.questionText?.trim()) { toast.error('Question text is required'); return false; }
    if (!formData.department) { toast.error('Department is required'); return false; }
    if (!formData.subject) { toast.error('Subject is required'); return false; }
    if (formData.marks === undefined || formData.marks < 0) { toast.error('Valid marks required'); return false; }
    return true;
  };

  const handleSubmit = async (status: QbStatus) => {
    if (!validateForm()) return;
    
    const payload: Omit<QbQuestion, 'id' | 'publicId' | 'createdAt' | 'updatedAt'> = {
      title: formData.title!,
      questionText: formData.questionText!,
      questionType: formData.questionType as any,
      department: formData.department!,
      subject: formData.subject!,
      unit: formData.unit || 1,
      topic: formData.topic || 'General',
      difficulty: formData.difficulty as any,
      sourceType: formData.sourceType as any,
      status: status,
      marks: formData.marks!,
      negativeMarks: formData.negativeMarks || 0,
      createdBy: 'currentUser',
      metadata: metadata,
      tags: tags,
      academicImportance: academicImportance,
      qualityStatus: 'UNVERIFIED',
      // Dynamic internal fields
      ...(formData as any)
    };

    try {
      if (store.editingQuestion) {
        await questionApi.updateQuestion(store.editingQuestion.id, payload);
        toast.success('Question updated successfully!');
      } else {
        await questionApi.createQuestion(payload);
        toast.success('Question added successfully!');
      }
      
      store.closeEditor();
      onSave?.();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save question');
    }
  };

  return (
    <AnimatePresence>
      {store.isEditorOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="w-full max-w-5xl max-h-[90vh] bg-[#060912] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-3">
                <button onClick={() => store.closeEditor()} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-slate-400">
                  <X className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold text-white tracking-wide uppercase">
                  {store.editingQuestion ? 'Edit Question' : 'Create New Question'}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleSubmit('DRAFT')}
                  disabled={store.loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save Draft
                </button>
                <button 
                  onClick={() => handleSubmit('PENDING_REVIEW')}
                  disabled={store.loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" /> Submit for Review
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
              
              <BasicInfoSection formData={formData} updateForm={updateForm} />
              
              {/* Image Upload Section */}
              <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider border-b border-white/5 pb-3 mb-4 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-slate-400" /> Reference Image
                </h3>
                {imagePreview ? (
                  <div className="relative inline-block border border-white/10 rounded-xl overflow-hidden bg-black/40 p-2">
                    <img src={imagePreview} alt="Preview" className="max-h-48 object-contain rounded-lg" />
                    <button 
                      onClick={handleRemoveImage}
                      className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full max-w-sm h-32 border-2 border-dashed border-white/10 rounded-xl hover:border-indigo-500/50 hover:bg-indigo-500/5 cursor-pointer transition-colors">
                    <ImageIcon className="w-6 h-6 text-slate-500 mb-2" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Click to upload image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              {formData.questionType && (
                <DynamicTypeForm 
                  questionType={formData.questionType as any} 
                  formData={formData} 
                  updateForm={updateForm} 
                />
              )}

              {formData.sourceType && (
                <DynamicMetadataForm 
                  sourceType={formData.sourceType as any} 
                  metadata={metadata} 
                  updateMetadata={updateMetadata} 
                />
              )}

              <TagManager 
                tags={tags} 
                updateTags={setTags} 
                academicImportance={academicImportance} 
                updateAcademicImportance={setAcademicImportance} 
              />
              
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
