import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { dashboardService, reportsService } from '../services/hrmsApi';
import type { HrSummary, Activity } from '../services/hrmsApi';
import { useReducedMotion } from '../hooks/useReducedMotion';
import ErrorState from '../components/common/ErrorState';

import DashboardHero from '../components/dashboard/DashboardHero';
import KPIGrid from '../components/dashboard/KPIGrid';
import {
  WorkforceGrowthChart,
  DepartmentAttendanceChart,
} from '../components/dashboard/DashboardCharts';
import AIInsightsPanel from '../components/dashboard/AIInsightsPanel';
import QuickActionsPanel from '../components/dashboard/QuickActionsPanel';
import DepartmentOverview from '../components/dashboard/DepartmentOverview';
import EmployeeSpotlight from '../components/dashboard/EmployeeSpotlight';
import RecentActivityTimeline from '../components/dashboard/RecentActivityTimeline';
import ApprovalQueue from '../components/dashboard/ApprovalQueue';

export default function HRDashboard() {
  const reducedMotion = useReducedMotion();
  const fade: any = {
    hidden: { opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : 20 },
    visible: (d: number) => ({
      opacity: 1,
      y: 0,
      transition: reducedMotion ? { duration: 0 } : { delay: d, duration: 0.5, ease: 'easeOut' },
    }),
  };

  const [summary, setSummary] = useState<HrSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [headcountTrend, setHeadcountTrend] = useState<[string, number][]>([]);
  const [deptAttendance, setDeptAttendance] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [sumRes, actRes, headRes, deptRes] = await Promise.allSettled([
        dashboardService.getHrSummary(),
        dashboardService.getRecentActivity(),
        reportsService.getHeadcountTrend(),
        reportsService.getDeptAttendance(),
      ]);
      if (sumRes.status === 'fulfilled') setSummary(sumRes.value.summary);
      if (actRes.status === 'fulfilled') setActivities(actRes.value.activities);
      if (headRes.status === 'fulfilled') setHeadcountTrend(headRes.value.trend);
      if (deptRes.status === 'fulfilled') setDeptAttendance(deptRes.value.attendance);

      const allFailed = [sumRes, actRes, headRes, deptRes].every(r => r.status === 'rejected');
      if (allFailed) {
        setLoadError('Failed to load dashboard data. Please try again.');
      } else {
        setLoadError(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <DashboardLayout title="HR Dashboard">
      {/* Global ambient glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-4 pb-24">

        {/* ROW 1 ── Compact Executive Hero Bar ── */}
        <motion.div custom={0} variants={fade} initial="hidden" animate="visible">
          <DashboardHero summary={summary} />
        </motion.div>

        {loadError && (
          <ErrorState
            size="sm"
            description={loadError}
            onRetry={() => void load()}
          />
        )}

        {/* ROW 2 ── KPI Grid ── */}
        <motion.div custom={0.05} variants={fade} initial="hidden" animate="visible">
          <KPIGrid summary={summary} loading={loading} />
        </motion.div>

        {/* ROW 3 ── Main Operations Area (Matches Image 2) ── */}
        <div className="grid gap-4 xl:grid-cols-3">
          {/* Left Column (70%) */}
          <div className="flex flex-col gap-4 xl:col-span-2">
            <motion.div custom={0.10} variants={fade} initial="hidden" animate="visible">
              <QuickActionsPanel />
            </motion.div>
            <div className="grid flex-1 gap-4 md:grid-cols-2">
              <motion.div className="flex flex-col" custom={0.15} variants={fade} initial="hidden" animate="visible">
                <WorkforceGrowthChart data={headcountTrend} loading={loading} />
              </motion.div>
              <motion.div className="flex flex-col" custom={0.20} variants={fade} initial="hidden" animate="visible">
                <DepartmentAttendanceChart data={deptAttendance} loading={loading} />
              </motion.div>
            </div>
          </div>
          
          {/* Right Column (30%) */}
          <motion.div className="xl:col-span-1" custom={0.25} variants={fade} initial="hidden" animate="visible">
            <AIInsightsPanel summary={summary} />
          </motion.div>
        </div>

        {/* ROW 4 ── Approval Queue & Department Distribution ── */}
        <div className="grid gap-4 xl:grid-cols-2">
          <motion.div custom={0.30} variants={fade} initial="hidden" animate="visible">
            <ApprovalQueue summary={summary} onUpdate={() => void load()} />
          </motion.div>
          <motion.div custom={0.35} variants={fade} initial="hidden" animate="visible">
            <DepartmentOverview summary={summary} />
          </motion.div>
        </div>

        {/* ROW 6 ── Employee Spotlight & Recent Activity ── */}
        <div className="grid gap-4 xl:grid-cols-2">
          <motion.div custom={0.40} variants={fade} initial="hidden" animate="visible">
            <EmployeeSpotlight summary={summary} />
          </motion.div>
          <motion.div custom={0.45} variants={fade} initial="hidden" animate="visible">
            <RecentActivityTimeline activities={activities} loading={loading} />
          </motion.div>
        </div>

      </div>
    </DashboardLayout>
  );
}
