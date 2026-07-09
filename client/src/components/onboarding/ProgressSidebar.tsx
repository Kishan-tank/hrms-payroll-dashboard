import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActivityFeed from './ActivityFeed';
import HRReviewCard from './HRReviewCard';

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
  employeeId = 'EMP-0142',
  saveStatus,
  profileStrength = 0
}: ProgressSidebarProps) {
  
  return (
    <div className="sticky top-6 hidden xl:flex flex-col w-[340px] shrink-0 max-h-[calc(100vh-3rem)] overflow-y-auto pb-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
      
      {/* THE SINGLE UNIFIED BOX - READABLE SIZE */}
      <div className="rounded-[1.5rem] border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-sm dark:border-white/10 dark:bg-[#0B1121]/90 overflow-hidden flex flex-col">
        
        {/* SECTION 1: Progress */}
        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base tracking-tight">Your Progress</h3>
            <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              {employeeId}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Completion</span>
              <span className="text-sm font-black text-slate-900 dark:text-white">{completionPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden shadow-inner">
              <motion.div
                className="h-full rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                initial={{ width: 0 }}
                animate={{ width: `${completionPercent}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
          
          {/* Profile Strength */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Profile Strength</span>
              <span className={`text-sm font-black ${profileStrength >= 80 ? 'text-emerald-500' : profileStrength >= 50 ? 'text-amber-500' : 'text-blue-500'}`}>
                {profileStrength >= 80 ? 'Excellent' : profileStrength >= 50 ? 'Good' : 'Basic'}
              </span>
            </div>
            <div className="flex gap-1 h-2 w-full">
              {[20, 40, 60, 80, 100].map((threshold, i) => (
                <div key={i} className="flex-1 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full w-full ${profileStrength >= 80 ? 'bg-emerald-500' : profileStrength >= 50 ? 'bg-amber-500' : 'bg-blue-500'}`}
                    initial={{ x: '-100%' }}
                    animate={{ x: profileStrength >= threshold ? '0%' : '-100%' }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-1">
            <div className="flex-1 flex flex-col justify-center items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 py-3 px-2 dark:border-white/5 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-slate-400">
                <i className="ti ti-list-check text-sm" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Tasks</span>
              </div>
              <span className="text-base font-black text-slate-900 dark:text-white leading-none">{remainingSteps} <span className="text-xs font-semibold text-slate-500">Left</span></span>
            </div>
            <div className="flex-1 flex flex-col justify-center items-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50/50 py-3 px-2 dark:border-white/5 dark:bg-white/5">
              <div className="flex items-center gap-1.5 text-slate-400">
                <i className="ti ti-clock-hour-4 text-sm" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Time</span>
              </div>
              <span className="text-base font-black text-slate-900 dark:text-white leading-none">{estimatedMinutesRemaining} <span className="text-xs font-semibold text-slate-500">Min</span></span>
            </div>
          </div>
        </div>

        {/* SECTION 2: HR Review */}
        <HRReviewCard />

        {/* SECTION 3: Activity */}
        <ActivityFeed />

        {/* SECTION 4: Sync Status Footer */}
        <div className="px-5 py-4 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500">
            <i className="ti ti-server-cog text-sm" />
            <span className="text-xs font-bold uppercase tracking-widest">Sync Status</span>
          </div>
          <AnimatePresence mode="wait">
            {saveStatus === 'saving' && (
              <motion.span key="saving" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400">
                <i className="ti ti-loader-2 animate-spin text-sm" /> Saving...
              </motion.span>
            )}
            {saveStatus === 'saved' && (
              <motion.span key="saved" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                <i className="ti ti-check text-sm" /> Up to date
              </motion.span>
            )}
            {saveStatus === 'idle' && (
              <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <i className="ti ti-cloud-check text-sm" /> Synced
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

export default ProgressSidebar;
