import { DragEvent, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentsFormProps {
  govId: File | null;
  setGovId: (f: File | null) => void;
  offerLetter: File | null;
  setOfferLetter: (f: File | null) => void;
  certificates: File | null;
  setCertificates: (f: File | null) => void;
  
  govIdRef: React.RefObject<HTMLInputElement | null>;
  offerLetterRef: React.RefObject<HTMLInputElement | null>;
  certRef: React.RefObject<HTMLInputElement | null>;
  
  previewUrls: Record<string, string>;
  setPreviewUrls: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  
  draggingMap: Record<string, boolean>;
  setDraggingMap: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  
  onError: (msg: string) => void;
}

export type ProcessStage = 'idle' | 'uploading' | 'scanning' | 'image_quality' | 'encrypting' | 'processing' | 'verified' | 'error';

interface ProcessState {
  stage: ProcessStage;
  progress: number;
  errorMsg?: string;
  uploadTime?: string;
}

export default function DocumentsForm({
  govId,
  setGovId,
  offerLetter,
  setOfferLetter,
  certificates,
  setCertificates,
  govIdRef,
  offerLetterRef,
  certRef,
  previewUrls,
  setPreviewUrls,
  draggingMap,
  setDraggingMap,
  onError
}: DocumentsFormProps) {

  const [processMap, setProcessMap] = useState<Record<string, ProcessState>>({});
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleDrag = (e: DragEvent, id: string, isDragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingMap(prev => ({ ...prev, [id]: isDragging }));
  };

  const processFile = (file: File, id: string, setFile: (f: File | null) => void) => {
    if (file.size > 10 * 1024 * 1024) {
      setProcessMap(prev => ({ ...prev, [id]: { stage: 'error', progress: 100, errorMsg: 'File too large (Max 10MB)' }}));
      onError('File exceeds 10MB limit');
      return;
    }

    setProcessMap(prev => ({ ...prev, [id]: { stage: 'uploading', progress: 0 }}));
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 2.5;
      
      let stage: ProcessStage = 'uploading';
      if (currentProgress > 85) stage = 'processing';
      else if (currentProgress > 70) stage = 'encrypting';
      else if (currentProgress > 50) stage = 'image_quality';
      else if (currentProgress > 25) stage = 'scanning';
      
      setProcessMap(prev => ({ ...prev, [id]: { stage, progress: currentProgress }}));
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setProcessMap(prev => ({ ...prev, [id]: { stage: 'verified', progress: 100, uploadTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }}));
        setFile(file);
        if (file.type.startsWith('image/')) {
          setPreviewUrls(prev => ({ ...prev, [id]: URL.createObjectURL(file) }));
        }
      }
    }, 30);
  };

  const handleDrop = (e: DragEvent, id: string, setFile: (f: File | null) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingMap(prev => ({ ...prev, [id]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0], id, setFile);
    }
  };

  const renderDropzone = (
    id: string,
    label: string,
    file: File | null,
    setFile: (f: File | null) => void,
    inputRef: any,
    icon: string
  ) => {
    const isDragging = draggingMap[id];
    const preview = previewUrls[id];
    const process = processMap[id];
    const isActive = process && process.stage !== 'idle';
    const isProcessing = isActive && process.stage !== 'verified' && process.stage !== 'error';
    const isVerified = process?.stage === 'verified' || file;
    const isError = process?.stage === 'error';

    return (
      <div
        onDragEnter={(e) => handleDrag(e, id, true)}
        onDragLeave={(e) => handleDrag(e, id, false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, id, setFile)}
        onClick={() => (!isActive || isError) && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 min-h-[160px] p-5 group/zone ${
          isVerified 
            ? 'border-transparent bg-transparent p-0 min-h-[auto]' 
            : isError
              ? 'border-red-400/50 bg-red-50/50 dark:bg-red-500/10 cursor-pointer hover:border-red-400'
              : isDragging 
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-500/10 scale-[1.02]' 
                : isProcessing
                  ? 'border-blue-200 bg-blue-50/30 dark:border-blue-500/20 cursor-default'
                  : 'border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-blue-400 dark:hover:border-blue-500/50 hover:bg-white dark:hover:bg-white/10 cursor-pointer'
        }`}
      >
        <input
          id={`${id}-input`}
          type="file"
          hidden
          ref={inputRef}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => {
            if (e.target.files && e.target.files[0]) processFile(e.target.files[0], id, setFile);
          }}
        />
        <AnimatePresence mode="wait">
          {isVerified && file ? (
            <motion.div key="verified" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col w-full h-full text-left bg-white dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 items-center min-w-0">
                  {preview ? (
                    <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-white/10 relative group/thumb cursor-zoom-in" onClick={(e) => { e.stopPropagation(); setFullscreenImage(preview); }}>
                      <img src={preview} alt="preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                        <i className="ti ti-zoom-in text-white" />
                      </div>
                    </div>
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/5">
                       <i className="ti ti-file-text text-xl" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={file.name}>{file.name}</h4>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{(file.size/1024/1024).toFixed(1)} MB • Verified</p>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={(e) => { e.stopPropagation(); document.getElementById(`${id}-input`)?.click(); }} className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 flex items-center justify-center text-slate-400 transition-colors" title="Replace"><i className="ti ti-refresh text-sm" /></button>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setProcessMap(prev => ({...prev, [id]: {stage:'idle', progress:0}})); }} className="h-7 w-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors" title="Delete"><i className="ti ti-trash text-sm" /></button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="flex-1 h-1 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/30" />
                <i className="ti ti-shield-check text-emerald-500 text-sm" />
              </div>
            </motion.div>
          ) : isProcessing ? (
            <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col w-full items-center justify-center text-center py-2">
              <i className="ti ti-loader animate-spin text-blue-500 text-2xl mb-3" />
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2">{process.stage.replace('_', ' ')}</h4>
              <div className="w-full bg-slate-200 dark:bg-white/10 h-1.5 rounded-full overflow-hidden">
                <motion.div className="bg-blue-500 h-full rounded-full" animate={{ width: `${process.progress}%` }} transition={{ duration: 0.1 }} />
              </div>
            </motion.div>
          ) : isError ? (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center text-center">
               <i className="ti ti-alert-triangle text-red-500 text-2xl mb-2" />
               <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Upload Failed</h4>
               <p className="text-[10px] font-bold text-red-500 mb-3">{process.errorMsg}</p>
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Click to retry</span>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center pointer-events-none">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl mb-3 transition-colors ${isDragging ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' : 'bg-white dark:bg-white/5 text-slate-400 border border-slate-100 dark:border-white/5'}`}>
                <i className={`ti ti-${icon} text-xl`} />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">{label}</p>
              <p className="mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Drag & Drop or Click</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="max-w-4xl mx-auto flex flex-col gap-8 w-full">
        <div className="text-center">
          <div className="mx-auto h-14 w-14 bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 rounded-2xl flex items-center justify-center mb-4 border border-indigo-100 dark:border-indigo-500/20 shadow-sm shadow-indigo-500/10">
             <i className="ti ti-file-upload text-2xl" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Upload Documents</h3>
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Securely provide your official IDs</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {renderDropzone('gov', 'Government ID', govId, setGovId, govIdRef, 'id-badge')}
          {renderDropzone('offer', 'Offer Letter', offerLetter, setOfferLetter, offerLetterRef, 'file-description')}
          {renderDropzone('cert', 'Certificates', certificates, setCertificates, certRef, 'certificate')}
        </div>
      </motion.div>

      <AnimatePresence>
        {fullscreenImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4"
            onClick={() => setFullscreenImage(null)}
          >
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              src={fullscreenImage}
              className="max-w-full max-h-full rounded-2xl object-contain shadow-2xl"
              onClick={e => e.stopPropagation()}
            />
            <button className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors" onClick={() => setFullscreenImage(null)}>
              <i className="ti ti-x text-xl" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
