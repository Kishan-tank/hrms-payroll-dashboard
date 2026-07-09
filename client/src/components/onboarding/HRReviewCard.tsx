import { motion } from 'framer-motion';

export default function HRReviewCard() {
  return (
    <div className="p-6 border-t border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/[0.01]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <i className="ti ti-shield-check text-amber-500 text-lg" />
          <h3 className="font-bold text-slate-900 dark:text-white text-sm tracking-tight">Review Status</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-500 border border-amber-200/50 dark:border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
          Pending
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Assigned To</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white">Sarah Jenkins</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Stage</span>
          <span className="text-sm font-bold text-amber-600 dark:text-amber-500">Data Verification</span>
        </div>
        <div className="w-full bg-slate-200/50 dark:bg-white/10 h-1.5 rounded-full overflow-hidden mt-1 shadow-inner">
          <motion.div 
            className="bg-amber-500 h-full rounded-full shadow-[0_0_8px_rgba(245,158,11,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: '33%' }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>
    </div>
  );
}
