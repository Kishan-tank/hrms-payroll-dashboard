import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressSidebarProps {
  completionPercent: number;
  remainingSteps: number;
  estimatedMinutesRemaining: number;
  employeeId?: string;
  saveStatus: 'idle' | 'saving' | 'saved';
  profileStrength?: number;
}

const ProgressSidebar = React.memo(function ProgressSidebar({
  completionPercent,
  remainingSteps,
  estimatedMinutesRemaining,
  employeeId = 'EMP-NEW',
  saveStatus,
  profileStrength = 0
}: ProgressSidebarProps) {
  const getStrengthColor = (score: number) => {
    if (score < 40) return 'from-red-500 to-rose-500 text-red-500';
    if (score < 70) return 'from-amber-400 to-orange-500 text-amber-500';
    return 'from-emerald-400 to-teal-500 text-emerald-500';
  };

  const strengthColor = getStrengthColor(profileStrength);
  const colorSplit = strengthColor.split(' ');
  const gradient = `${colorSplit[0]} ${colorSplit[1]}`;
  const textColor = colorSplit[2];

  return (
    <div className="sticky top-6 hidden xl:flex flex-col gap-6 w-[340px] shrink-0">
      
      {/* Main Progress Card */}
      <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl p-7 shadow-xl shadow-slate-200/40 dark:border-white/10 dark:bg-[#0B1121]/80 dark:shadow-none overflow-hidden relative">
        {/* Glow Effects */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/20 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/5 dark:bg-emerald-500/10 blur-[50px] rounded-full pointer-events-none" />
        
        <div className="flex items-center justify-between mb-8 relative z-10">
          <div className="flex flex-col">
            <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">Your Progress</h3>
            <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 mt-1">
              {employeeId}
            </span>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
             <i className="ti ti-target text-xl" />
          </div>
        </div>

        <div className="mb-6 relative z-10 bg-slate-50/50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex items-end justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Flow Completion</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white leading-none tracking-tighter">
              {completionPercent}<span className="text-sm text-slate-400">%</span>
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10 shadow-inner">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 relative"
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            >
              <div className="absolute inset-0 bg-white/20 w-full h-full animate-pulse" />
            </motion.div>
          </div>
        </div>

        <div className="mb-8 relative z-10 bg-slate-50/50 dark:bg-white/5 rounded-2xl p-4 border border-slate-100 dark:border-white/5 shadow-sm">
          <div className="flex items-end justify-between mb-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Profile Strength</span>
            <span className={`text-sm font-black leading-none ${textColor}`}>
              {profileStrength >= 90 ? 'All Star' : profileStrength >= 60 ? 'Intermediate' : 'Beginner'}
            </span>
          </div>
          <div className="flex gap-1 h-2.5 w-full">
            {[20, 40, 60, 80, 100].map((threshold, i) => (
              <div key={i} className="flex-1 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden">
                <motion.div
                  className={`h-full w-full bg-gradient-to-r ${gradient}`}
                  initial={{ x: '-100%' }}
                  animate={{ x: profileStrength >= threshold ? '0%' : '-100%' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 relative z-10">
          <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-blue-200 hover:shadow-blue-500/10 dark:border-white/5 dark:bg-white/5 dark:hover:border-blue-500/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 dark:group-hover:bg-blue-500/20 dark:group-hover:text-blue-400 transition-colors">
              <i className="ti ti-list-check" style={{ fontSize: 20 }} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 dark:text-white leading-tight">{remainingSteps} Tasks</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Remaining</span>
            </div>
          </div>
          
          <div className="group flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm transition-all hover:border-amber-200 hover:shadow-amber-500/10 dark:border-white/5 dark:bg-white/5 dark:hover:border-amber-500/30">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-500 dark:group-hover:bg-amber-500/20 dark:group-hover:text-amber-400 transition-colors">
              <i className="ti ti-clock-hour-4" style={{ fontSize: 20 }} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-slate-900 dark:text-white leading-tight">{estimatedMinutesRemaining} Mins</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-0.5">Estimated Time</span>
            </div>
          </div>
        </div>
      </div>

      {/* Auto Save Card */}
      <div className="rounded-2xl border border-slate-200 bg-white/80 backdrop-blur-xl p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1121]/80 flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
          <i className="ti ti-server-cog text-[16px]" /> Sync Status
        </span>
        <div className="flex items-center">
          <AnimatePresence mode="wait">
            {saveStatus === 'saving' && (
              <motion.span key="saving" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" /> Saving...
              </motion.span>
            )}
            {saveStatus === 'saved' && (
              <motion.span key="saved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-600 border border-emerald-100 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400">
                <i className="ti ti-check" /> All Saved
              </motion.span>
            )}
            {saveStatus === 'idle' && (
              <motion.span key="idle" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-bold text-slate-500 border border-slate-100 dark:border-white/5 dark:bg-white/5 dark:text-slate-400">
                <i className="ti ti-cloud-check" /> Up to date
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

export default ProgressSidebar;
