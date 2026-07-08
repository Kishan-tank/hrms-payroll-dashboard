import { motion } from 'framer-motion';
// @ts-ignore
import Confetti from 'react-confetti';

interface CompletionViewProps {
  onDashboardClick: () => void;
}

export default function CompletionView({ onDashboardClick }: CompletionViewProps) {
  return (
    <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-700 py-10 relative">
      <div className="fixed inset-0 pointer-events-none z-50 flex justify-center overflow-hidden">
        <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={800} colors={['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']} gravity={0.15} />
      </div>

      <div className="relative mb-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }} className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-2xl shadow-emerald-500/40 relative z-10">
          <i className="ti ti-check" style={{ fontSize: 64 }} />
        </motion.div>
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-[-15%] rounded-full border-4 border-dashed border-emerald-500/30 z-0" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute inset-[-30%] rounded-full border-2 border-emerald-500/10 z-0" />
      </div>

      <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="text-5xl font-black text-slate-900 dark:text-white mb-5 tracking-tight">You're All Set! 🎉</motion.h3>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-lg font-semibold text-slate-500 dark:text-slate-400 max-w-lg mx-auto mb-10 leading-relaxed">
        Your onboarding profile is 100% complete and has been securely submitted for HR review. Welcome to the team!
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-3xl mb-12">
        <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-xl shadow-slate-200/30 dark:bg-white/5 dark:border-white/10 dark:shadow-none text-left flex flex-col gap-4 group hover:border-emerald-200 transition-colors">
          <div className="flex h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-500 items-center justify-center dark:bg-emerald-500/10 group-hover:scale-110 transition-transform">
            <i className="ti ti-shield-check text-2xl" />
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white text-base">Verified User</p>
            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Documents Sync</p>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-xl shadow-slate-200/30 dark:bg-white/5 dark:border-white/10 dark:shadow-none text-left flex flex-col gap-4 group hover:border-amber-200 transition-colors">
          <div className="flex h-12 w-12 rounded-2xl bg-amber-50 text-amber-500 items-center justify-center dark:bg-amber-500/10 group-hover:scale-110 transition-transform">
            <i className="ti ti-award text-2xl" />
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white text-base">Profile Master</p>
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mt-0.5">Badge Earned</p>
          </div>
        </div>
        <div className="rounded-3xl bg-white p-6 border border-slate-100 shadow-xl shadow-slate-200/30 dark:bg-white/5 dark:border-white/10 dark:shadow-none text-left flex flex-col gap-4 group hover:border-blue-200 transition-colors">
          <div className="flex h-12 w-12 rounded-2xl bg-blue-50 text-blue-500 items-center justify-center dark:bg-blue-500/10 group-hover:scale-110 transition-transform">
            <i className="ti ti-rocket text-2xl" />
          </div>
          <div>
            <p className="font-black text-slate-900 dark:text-white text-base">Ready to Launch</p>
            <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-0.5">Next Step</p>
          </div>
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
        onClick={onDashboardClick}
        className="group relative rounded-full bg-slate-900 dark:bg-white overflow-hidden transition-all px-12 py-5 text-lg font-black text-white dark:text-slate-900 shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-1 active:scale-95"
      >
        <span className="relative z-10 flex items-center gap-3">
          Explore Your Dashboard <i className="ti ti-arrow-right group-hover:translate-x-1 transition-transform" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.button>
    </div>
  );
}
