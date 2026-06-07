import React, { useState, useCallback, useEffect } from 'react';
import { Upload, X, FileImage, Camera } from 'lucide-react';

interface StepImageUploadProps {
  onImagesSelected: (images: string[]) => void;
}

export default function StepImageUpload({ onImagesSelected }: StepImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const processFiles = (files: FileList | File[]) => {
    const urls: string[] = [];
    Array.from(files).forEach(file => {
      if (file.type.startsWith('image/')) {
        urls.push(URL.createObjectURL(file));
      }
    });
    setImageUrls(prev => [...prev, ...urls]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  }, []);

  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (e.clipboardData?.files?.length) {
      processFiles(e.clipboardData.files);
    }
  }, []);

  useEffect(() => {
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [handlePaste]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-6">
      <div 
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 transition-all ${
          isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 hover:border-indigo-500/50 bg-black/20 hover:bg-black/40'
        }`}
      >
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-400">
          <Upload className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Drag & Drop Images</h3>
        <p className="text-sm text-slate-500 mb-4">Supports .png, .jpg, .jpeg, .webp, or Paste from Clipboard</p>
        <label className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-bold text-white cursor-pointer transition-colors">
          Browse Files
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        </label>
      </div>

      {imageUrls.length > 0 && (
        <div className="bg-[#0e1322]/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileImage className="w-4 h-4 text-indigo-400" /> Selected Images ({imageUrls.length})
            </h4>
            <button 
              onClick={() => onImagesSelected(imageUrls)}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.2)]"
            >
              Start OCR Extraction
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {imageUrls.map((url, idx) => (
              <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-white/10 group bg-black/40">
                <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                <button 
                  onClick={() => removeImage(idx)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-md bg-black/60 hover:bg-red-500 text-white flex items-center justify-center transition-colors border border-white/10 hover:border-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white border border-white/10">
                  IMG_{idx + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Question Papers', desc: 'Scan old RGPV or GATE exam papers.' },
          { title: 'Textbooks', desc: 'Extract exercises from textbook photos.' },
          { title: 'Handwritten Notes', desc: 'Clear handwritten questions supported.' }
        ].map((info, idx) => (
          <div key={idx} className="bg-[#0e1322]/50 border border-white/5 rounded-xl p-4 flex gap-3">
            <Camera className="w-5 h-5 text-indigo-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-white mb-1">{info.title}</p>
              <p className="text-[10px] text-slate-500">{info.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
