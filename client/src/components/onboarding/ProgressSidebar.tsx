import React from 'react';
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
    <div className="sticky top-6 hidden xl:flex flex-col w-[340px] shrink-0 max-h-[calc(100vh-3rem)] overflow-y-auto pb-8">
      
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] overflow-hidden flex flex-col">
        
        {/* SECTION 1: Progress */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Your Progress</h3>
            <span className="text-xs font-bold text-slate-500">
              {employeeId}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500">Completion</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">{completionPercent}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
          
          {/* Profile Strength */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500">Profile Strength</span>
              <span className="text-sm font-bold text-blue-600">
                {profileStrength >= 80 ? 'Excellent' : profileStrength >= 50 ? 'Good' : 'Basic'}
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
               <div
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${profileStrength}%` }}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-2">
            <div className="flex-1 flex flex-col p-3 rounded-lg border border-slate-100 bg-slate-50 dark:border-white/5 dark:bg-white/5">
              <span className="text-xs font-medium text-slate-500">Tasks Left</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{remainingSteps}</span>
            </div>
            <div className="flex-1 flex flex-col p-3 rounded-lg border border-slate-100 bg-slate-50 dark:border-white/5 dark:bg-white/5">
              <span className="text-xs font-medium text-slate-500">Time (Min)</span>
              <span className="text-lg font-bold text-slate-900 dark:text-white">{estimatedMinutesRemaining}</span>
            </div>
          </div>
        </div>

        {/* SECTION 2: HR Review */}
        <HRReviewCard />

        {/* SECTION 3: Activity */}
        <ActivityFeed />

        {/* SECTION 4: Sync Status Footer */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Sync Status</span>
          <div>
            {saveStatus === 'saving' && (
              <span className="text-xs font-bold text-slate-400">Saving...</span>
            )}
            {saveStatus === 'saved' && (
              <span className="text-xs font-bold text-emerald-600">Up to date</span>
            )}
            {saveStatus === 'idle' && (
              <span className="text-xs font-bold text-slate-500">Synced</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProgressSidebar;
