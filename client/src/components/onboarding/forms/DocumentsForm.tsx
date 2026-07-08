import { DragEvent } from 'react';
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

  const handleDrag = (e: DragEvent, id: string, isDragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingMap(prev => ({ ...prev, [id]: isDragging }));
  };

  const handleDrop = (e: DragEvent, id: string, setFile: (f: File | null) => void) => {
    e.preventDefault();
    e.stopPropagation();
    setDraggingMap(prev => ({ ...prev, [id]: false }));
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        onError('File size exceeds 10MB limit');
        return;
      }
      setFile(file);
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        setPreviewUrls(prev => ({ ...prev, [id]: url }));
      }
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
    
    return (
      <div
        onDragEnter={(e) => handleDrag(e, id, true)}
        onDragLeave={(e) => handleDrag(e, id, false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => handleDrop(e, id, setFile)}
        onClick={() => !file && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-300 min-h-[240px] overflow-hidden ${
          file 
            ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-500/20 dark:bg-emerald-500/5' 
            : isDragging 
              ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10 scale-[1.02] shadow-xl shadow-blue-500/10' 
              : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-white hover:shadow-lg hover:shadow-slate-200/50 cursor-pointer dark:border-white/10 dark:bg-white/5 dark:hover:border-blue-500/30 dark:hover:bg-white/10 dark:hover:shadow-none'
        }`}
      >
        <input
          type="file"
          hidden
          ref={inputRef}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={e => {
            if (e.target.files && e.target.files[0]) {
              const f = e.target.files[0];
              if (f.size > 10 * 1024 * 1024) {
                onError('File size exceeds 10MB limit');
                return;
              }
              setFile(f);
              if (f.type.startsWith('image/')) {
                setPreviewUrls(prev => ({ ...prev, [id]: URL.createObjectURL(f) }));
              }
            }
          }}
        />
        <AnimatePresence mode="wait">
          {file ? (
            <motion.div key="uploaded" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4 w-full h-full justify-center z-10">
              <div className="relative">
                {preview ? (
                  <div className="h-16 w-16 rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-sm">
                    <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600 shadow-sm dark:from-emerald-500/20 dark:to-emerald-500/10 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-500/30">
                    <i className="ti ti-file-check" style={{ fontSize: 32 }} />
                  </div>
                )}
                <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0B1121] flex items-center justify-center text-white shadow-sm">
                  <i className="ti ti-check text-xs font-bold" />
                </div>
              </div>
              <div className="flex flex-col items-center max-w-full w-full">
                <span className="text-sm font-bold text-slate-900 dark:text-white truncate w-full px-4">{file.name}</span>
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB • Uploaded</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); setFile(null); const newUrls = {...previewUrls}; delete newUrls[id]; setPreviewUrls(newUrls); }} className="mt-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 active:scale-95">
                <i className="ti ti-trash" /> Remove File
              </button>
            </motion.div>
          ) : (
            <motion.div key="empty" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center pointer-events-none">
              <div className={`flex h-16 w-16 items-center justify-center rounded-2xl mb-5 shadow-sm transition-all duration-300 ${isDragging ? 'bg-blue-600 text-white scale-110 shadow-blue-500/30' : 'bg-white text-slate-400 dark:bg-[#111827] dark:text-slate-500 border border-slate-100 dark:border-white/5 group-hover:scale-105'}`}>
                <i className={`ti ti-${icon}`} style={{ fontSize: 32 }} />
              </div>
              <p className={`text-sm font-black ${isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'}`}>{label}</p>
              <p className="mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Drag & drop or click</p>
              <div className="flex gap-2 mt-4">
                <span className="bg-slate-100 dark:bg-white/5 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded text-slate-400">PDF, JPG, PNG</span>
                <span className="bg-slate-100 dark:bg-white/5 text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded text-slate-400">Max 10MB</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {renderDropzone('gov', 'Government ID', govId, setGovId, govIdRef, 'id-badge-2')}
        {renderDropzone('offer', 'Offer Letter', offerLetter, setOfferLetter, offerLetterRef, 'file-signature')}
        {renderDropzone('cert', 'Certificates', certificates, setCertificates, certRef, 'certificate')}
      </div>
    </motion.div>
  );
}
