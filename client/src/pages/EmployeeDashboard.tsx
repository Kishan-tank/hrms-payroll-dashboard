import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { dashboardService, EmployeeSummary } from '../services/hrmsApi';
import { useReducedMotion } from '../hooks/useReducedMotion';

import EmployeeHero from '../components/employee/EmployeeHero';
import WorkspaceSnapshot from '../components/employee/WorkspaceSnapshot';
import ProductivityOverview from '../components/employee/ProductivityOverview';
import PayrollAndLeave from '../components/employee/PayrollAndLeave';
import SkillsAndAchievements from '../components/employee/SkillsAndAchievements';
import EmployeeQuickActions from '../components/employee/EmployeeQuickActions';
import ActivityAndEvents from '../components/employee/ActivityAndEvents';
import MyGoals from '../components/employee/MyGoals';
import EmployeeProfileDrawer from '../components/employee/EmployeeProfileDrawer';

export default function EmployeeDashboard() {
  const reducedMotion = useReducedMotion();
  const fade: any = {
    hidden: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 20 },
    visible: (d: number) => ({
      opacity: 1,
      y: 0,
      transition: reducedMotion ? { duration: 0 } : { delay: d, duration: 0.5, ease: 'easeOut' },
    }),
  };

  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [summary, setSummary] = useState<EmployeeSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const res = await dashboardService.getEmployeeSummary();
        if (res.success && res.summary) {
          setSummary(res.summary);
        } else {
          throw new Error('Server returned an unexpected response.');
        }
      } catch (err: any) {
        console.error('EmployeeDashboard fetch failed:', err);
        setError('Unable to load your workspace. Please try again.');
        setSummary(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [retryKey]);

  // ── Skeleton loading state ─────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout title="Employee Workspace">
        <div className="space-y-3 pb-16">

          {/* Hero skeleton */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-2xl bg-white/5 animate-pulse shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-48 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-3 w-36 rounded-md bg-white/5 animate-pulse" />
              </div>
              <div className="h-9 w-28 rounded-xl bg-white/5 animate-pulse" />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-white/5 animate-pulse h-20" />
              ))}
            </div>
          </div>

          {/* Workspace snapshot skeleton — 4-col grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                <div className="mb-3 h-10 w-10 rounded-xl bg-white/5 animate-pulse" />
                <div className="mb-2 h-6 w-20 rounded-lg bg-white/5 animate-pulse" />
                <div className="h-3 w-28 rounded-md bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Productivity + Payroll row skeleton */}
          <div className="grid gap-3 lg:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-4 h-4 w-32 rounded-md bg-white/5 animate-pulse" />
                <div className="h-36 w-full rounded-xl bg-white/5 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Skills / Quick-actions / Activity row skeleton */}
          <div className="grid gap-3 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
                <div className="mb-4 h-4 w-28 rounded-md bg-white/5 animate-pulse" />
                <div className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-8 w-full rounded-xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              </div>
            ))}
          </div>

        </div>
      </DashboardLayout>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error || !summary) {
    return (
      <DashboardLayout title="Employee Workspace">
        <div className="flex h-[50vh] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-center max-w-sm">
            <div className="h-14 w-14 rounded-2xl border border-white/10 bg-red-500/10 text-red-400 flex items-center justify-center">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white">Failed to load workspace</h3>
            <p className="text-sm text-slate-400">{error || 'No data available. Please try again.'}</p>
            <button
              onClick={() => { setError(null); setRetryKey((k) => k + 1); }}
              className="mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-500 active:scale-95 transition-all"
            >
              Retry
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Employee Workspace">
      {/* Employee Profile Drawer */}
      <EmployeeProfileDrawer 
        isOpen={isProfileDrawerOpen} 
        onClose={() => setIsProfileDrawerOpen(false)} 
      />

      {/* Global ambient glows matching HR Dashboard */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-3 pb-16">
        
        {/* ROW 1: Hero Workspace */}
        <motion.div custom={0} variants={fade} initial="hidden" animate="visible">
          <EmployeeHero onViewProfile={() => setIsProfileDrawerOpen(true)} summary={summary} />
        </motion.div>
        
        {/* ROW 2: Snapshot Cards */}
        <motion.div custom={0.05} variants={fade} initial="hidden" animate="visible">
          <WorkspaceSnapshot summary={summary} />
        </motion.div>

        {/* ROW 2.5: Productivity Overview */}
        <motion.div custom={0.08} variants={fade} initial="hidden" animate="visible">
          <ProductivityOverview />
        </motion.div>

        {/* ROW 3: Payroll & Leave Analytics */}
        <motion.div custom={0.10} variants={fade} initial="hidden" animate="visible">
          <PayrollAndLeave summary={summary} />
        </motion.div>

        {/* ROW 4: Skills & Achievements */}
        <motion.div custom={0.15} variants={fade} initial="hidden" animate="visible">
          <SkillsAndAchievements />
        </motion.div>

        {/* ROW 5: Quick Actions (Grid) */}
        <motion.div custom={0.20} variants={fade} initial="hidden" animate="visible">
          <EmployeeQuickActions />
        </motion.div>

        {/* ROW 6: Recent Activity & Upcoming Events */}
        <motion.div custom={0.25} variants={fade} initial="hidden" animate="visible">
          <ActivityAndEvents />
        </motion.div>

        {/* ROW 7: My Goals & Sprint Tasks */}
        <motion.div custom={0.30} variants={fade} initial="hidden" animate="visible">
          <MyGoals />
        </motion.div>

      </div>
    </DashboardLayout>
  );
}
