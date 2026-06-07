import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, Scan } from 'lucide-react';
import { useQuestionBankStore } from '../../../../store/useQuestionBankStore';
import { ocrService, type OcrResult } from '../../../../services/mockOcrService';
import StepImageUpload from './StepImageUpload';
import StepOcrVerification from './StepOcrVerification';
import StepMetadataModes from './StepMetadataModes';
import StepValidationPreview from '../StepValidationPreview'; // Reuse Phase 3 UI
import { toast } from 'sonner';

const STEPS = ['Upload Images', 'OCR Verification', 'Apply Metadata', 'Validate & Confirm'];

export default function OcrImportWizardModal() {
  const store = useQuestionBankStore();
  const [currentStep, setCurrentStep] = useState(0);
  
  // OCR State
  const [ocrResults, setOcrResults] = useState<OcrResult[]>([]);
  const [verifiedQuestions, setVerifiedQuestions] = useState<any[]>([]); // Flattened valid text & types
  const [validatedData, setValidatedData] = useState<any[]>([]);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const handleClose = () => {
    if (isProcessing) return;
    store.closeOcrWizard();
    setTimeout(() => {
      setCurrentStep(0);
      setOcrResults([]);
      setVerifiedQuestions([]);
      setValidatedData([]);
    }, 300);
  };

  const handleImagesSelected = async (imageUrls: string[]) => {
    setIsProcessing(true);
    setCurrentStep(0.5); // "Processing" state UI 
    try {
      const results = await ocrService.processImages(imageUrls, (p) => setOcrProgress(p));
      setOcrResults(results);
      setCurrentStep(1); // Move to Verification
    } catch (err: any) {
      toast.error('OCR Extraction Failed');
      setCurrentStep(0);
    } finally {
      setIsProcessing(false);
      setOcrProgress(0);
    }
  };

  const handleVerified = (questions: any[]) => {
    if (questions.length === 0) {
      toast.error('No questions extracted.');
      return;
    }
    setVerifiedQuestions(questions);
    setCurrentStep(2); // Move to Metadata
  };

  const validateAndCheckDuplicates = (data: any[]) => {
    const existingIds = store.questions.map(q => q.publicId);
    
    return data.map(row => {
      const errors: string[] = [];
      let duplicate = false;

      if (!row.questionText?.trim()) errors.push('Missing Question Text');
      if (!row.department?.trim()) errors.push('Missing Department');
      if (!row.subject?.trim()) errors.push('Missing Subject');

      if (row.publicId && existingIds.includes(row.publicId)) {
        duplicate = true;
      }

      return {
        ...row,
        _errors: errors,
        _duplicate: duplicate
      };
    });
  };

  const handleApplyMetadata = (globalMetadata: any) => {
    const enriched = verifiedQuestions.map(q => ({
      ...q,
      ...globalMetadata
    }));
    setValidatedData(validateAndCheckDuplicates(enriched));
    setCurrentStep(3); // Move to Validation Preview
  };

  const handleBulkEdit = (field: string, value: any) => {
    const updated = validatedData.map(row => ({ ...row, [field]: value }));
    setValidatedData(validateAndCheckDuplicates(updated));
    toast.success(`Bulk updated ${field}`);
  };

  const handleConfirmImport = async () => {
    setIsProcessing(true);
    const validRows = validatedData.filter(r => !r._errors?.length && !r._duplicate);
    
    const payload = validRows.map(r => {
      const { _errors, _duplicate, _sourceImage, ...cleanData } = r;
      return {
        ...cleanData,
        status: 'PENDING_REVIEW', // Governance integration
        qualityStatus: 'UNVERIFIED',
      };
    });

    try {
      await store.bulkAddQuestions(payload, {
        fileName: 'OCR Image Import',
        fileType: 'IMAGES_OCR',
        totalRecords: verifiedQuestions.length,
        successfulRecords: validRows.length,
        failedRecords: verifiedQuestions.length - validRows.length
      });
      setCurrentStep(4); // Move to Complete
    } catch (err: any) {
      toast.error('Import failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <AnimatePresence>
      {store.isOcrWizardOpen && (
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
            className="w-full max-w-6xl max-h-[90vh] bg-[#060912] border border-indigo-500/30 rounded-3xl shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col overflow-hidden"
          >
            {/* Header & Stepper */}
            <div className="px-6 py-4 border-b border-white/10 bg-black/40">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-white tracking-wide uppercase flex items-center gap-2">
                  <Scan className="w-5 h-5 text-indigo-400" /> OCR Image Import
                </h2>
                <button onClick={handleClose} disabled={isProcessing} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 text-slate-400 disabled:opacity-50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex items-center justify-between relative">
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-white/5 -z-10" />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-indigo-500 -z-10 transition-all duration-500" style={{ width: `${(Math.floor(currentStep) / 3) * 100}%` }} />
                
                {STEPS.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500 ${
                      Math.floor(currentStep) > idx ? 'bg-indigo-500 border-indigo-500 text-white' : 
                      Math.floor(currentStep) === idx ? 'bg-[#060912] border-indigo-500 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 
                      'bg-[#060912] border-white/10 text-slate-600'
                    }`}>
                      {Math.floor(currentStep) > idx ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${Math.floor(currentStep) >= idx ? 'text-slate-300' : 'text-slate-600'}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              {currentStep === 0 && <StepImageUpload onImagesSelected={handleImagesSelected} />}
              
              {currentStep === 0.5 && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
                  <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mb-6" />
                  <h3 className="text-xl font-bold text-white mb-2">Extracting Text using Vision API...</h3>
                  <div className="w-64 h-2 bg-white/5 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${ocrProgress}%` }} />
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{ocrProgress}% Complete</p>
                </div>
              )}

              {currentStep === 1 && <StepOcrVerification ocrResults={ocrResults} onVerified={handleVerified} onCancel={handleClose} />}
              {currentStep === 2 && <StepMetadataModes onApply={handleApplyMetadata} />}
              {currentStep === 3 && <StepValidationPreview data={validatedData} onConfirm={handleConfirmImport} onCancel={handleClose} onBulkEdit={handleBulkEdit} loading={isProcessing} />}
              
              {currentStep === 4 && (
                <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
                  <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-black text-white mb-2">OCR Import Successful!</h3>
                  <p className="text-slate-400 max-w-md mx-auto mb-8">
                    Your images have been successfully converted into text, verified, and sent to the Review Queue.
                  </p>
                  <button onClick={handleClose} className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
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
