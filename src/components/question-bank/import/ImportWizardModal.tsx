import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2 } from 'lucide-react';
import { useQuestionBankStore } from '../../../store/useQuestionBankStore';
import StepUpload from './StepUpload';
import StepMapping from './StepMapping';
import StepValidationPreview from './StepValidationPreview';
import { toast } from 'sonner';

const STEPS = ['Upload File', 'Map Columns', 'Validate & Preview', 'Complete'];

export default function ImportWizardModal() {
  const store = useQuestionBankStore();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Data State
  const [fileMeta, setFileMeta] = useState<any>(null);
  const [rawParsedData, setRawParsedData] = useState<any[]>([]);
  const [mappedData, setMappedData] = useState<any[]>([]);
  const [validatedData, setValidatedData] = useState<any[]>([]);
  
  // Loading State
  const [isImporting, setIsImporting] = useState(false);

  const handleClose = () => {
    if (isImporting) return;
    store.closeImportWizard();
    // Reset state after animation
    setTimeout(() => {
      setCurrentStep(0);
      setFileMeta(null);
      setRawParsedData([]);
      setMappedData([]);
      setValidatedData([]);
    }, 300);
  };

  const handleDataParsed = (data: any[], meta: any) => {
    setRawParsedData(data);
    setFileMeta(meta);
    setCurrentStep(1); // Move to mapping
  };

  const validateAndCheckDuplicates = (data: any[]) => {
    const existingIds = store.questions.map(q => q.publicId);
    
    return data.map(row => {
      const errors: string[] = [];
      let duplicate = false;

      // Required validations
      if (!row.questionText?.trim()) errors.push('Missing Question Text');
      if (!row.questionType?.trim()) errors.push('Missing Question Type');
      if (!row.department?.trim()) errors.push('Missing Department');
      if (!row.subject?.trim()) errors.push('Missing Subject');
      if (!row.difficulty?.trim()) errors.push('Missing Difficulty');
      if (!row.sourceType?.trim()) errors.push('Missing Source Type');
      if (row.marks === undefined || isNaN(Number(row.marks))) errors.push('Marks must be a number');

      // Duplicate Check
      if (row.publicId && existingIds.includes(row.publicId)) {
        duplicate = true;
      }

      return {
        ...row,
        marks: Number(row.marks) || 0,
        _errors: errors,
        _duplicate: duplicate
      };
    });
  };

  const handleMapped = (data: any[]) => {
    setMappedData(data);
    const validated = validateAndCheckDuplicates(data);
    setValidatedData(validated);
    setCurrentStep(2); // Move to Validation Preview
  };

  const handleBulkEdit = (field: string, value: any) => {
    const updated = validatedData.map(row => {
      if (row._errors?.length || row._duplicate) return row; // Optional: only apply to valid rows or all rows?
      return { ...row, [field]: value };
    });
    // Revalidate
    setValidatedData(validateAndCheckDuplicates(updated));
    toast.success(`Bulk updated ${field}`);
  };

  const handleConfirmImport = async () => {
    setIsImporting(true);
    const validRows = validatedData.filter(r => !r._errors?.length && !r._duplicate);
    
    // Clean up internal flags before sending to store
    const payload = validRows.map(r => {
      const { _errors, _duplicate, ...cleanData } = r;
      return {
        ...cleanData,
        status: 'PENDING_REVIEW', // Default status
        tags: cleanData.tags ? cleanData.tags.split(',').map((t: string) => t.trim()) : [],
        qualityStatus: 'UNVERIFIED',
        academicImportance: 'NORMAL'
      };
    });

    try {
      await store.bulkAddQuestions(payload, {
        fileName: fileMeta.name,
        fileType: fileMeta.type,
        totalRecords: rawParsedData.length,
        successfulRecords: validRows.length,
        failedRecords: rawParsedData.length - validRows.length
      });
      setCurrentStep(3); // Move to Complete
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AnimatePresence>
      {store.isImportWizardOpen && (
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
            className="w-full max-w-6xl max-h-[90vh] bg-[#060912] border border-white/10 rounded-3xl shadow-2xl flex flex-col"
          >
            {/* Header & Stepper */}
            <div className="px-6 py-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white tracking-wide uppercase">Bulk Import Wizard</h2>
                <button onClick={handleClose} disabled={isImporting} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-slate-400 disabled:opacity-50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 -z-10" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 -z-10 transition-all duration-500" style={{ width: `${(currentStep / 3) * 100}%` }} />
                
                {STEPS.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                      currentStep > idx ? 'bg-indigo-500 border-indigo-500 text-white' : 
                      currentStep === idx ? 'bg-[#060912] border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 
                      'bg-[#060912] border-white/10 text-slate-600'
                    }`}>
                      {currentStep > idx ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${currentStep >= idx ? 'text-slate-300' : 'text-slate-600'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {currentStep === 0 && <StepUpload onDataParsed={handleDataParsed} />}
              {currentStep === 1 && <StepMapping parsedData={rawParsedData} onMapped={handleMapped} onCancel={handleClose} />}
              {currentStep === 2 && <StepValidationPreview data={validatedData} onConfirm={handleConfirmImport} onCancel={handleClose} onBulkEdit={handleBulkEdit} loading={isImporting} />}
              
              {currentStep === 3 && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">Import Successful!</h3>
                  <p className="text-slate-400 max-w-md mx-auto mb-8">
                    Your questions have been successfully parsed, validated, and added to the Question Bank. They are currently marked as "Pending Review".
                  </p>
                  <button 
                    onClick={handleClose}
                    className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                  >
                    Return to Dashboard
                  </button>
                </div>
              )}
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
