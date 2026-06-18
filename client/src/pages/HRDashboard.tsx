import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { dashboardService } from '../services/hrmsApi';
import type { HrSummary, Activity } from '../services/hrmsApi';

import DashboardHero from '../components/dashboard/DashboardHero';
import KPIGrid from '../components/dashboard/KPIGrid';
import {
  WorkforceGrowthChart,
  AttendanceTrendChart,
} from '../components/dashboard/DashboardCharts';
import AIInsightsPanel from '../components/dashboard/AIInsightsPanel';
import QuickActionsPanel from '../components/dashboard/QuickActionsPanel';
import DepartmentOverview from '../components/dashboard/DepartmentOverview';
import EmployeeSpotlight from '../components/dashboard/EmployeeSpotlight';
import RecentActivityTimeline from '../components/dashboard/RecentActivityTimeline';
import ApprovalQueue from '../components/dashboard/ApprovalQueue';

const fade: any = {
  hidden:  { opacity: 0, y: 20 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { delay: d, duration: 0.5, ease: 'easeOut' } }),
};

export default function HRDashboard() {
  const [summary,       setSummary]       = useState<HrSummary | null>(null);
  const [activities,    setActivities]    = useState<Activity[]>([]);

  const [loading,       setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sumRes, actRes] = await Promise.allSettled([
          dashboardService.getHrSummary(),
          dashboardService.getRecentActivity(),
        ]);
        if (sumRes.status   === 'fulfilled') {
          // Use consistent enterprise demo dataset as requested
          setSummary({
            totalEmployees: 1248,
            attendanceRate: '97.8%',
            payrollStatus: '₹4.12M Processed',
            pendingApprovals: 18,
          });
        }
        if (actRes.status   === 'fulfilled') setActivities(actRes.value.activities);

      } finally {
        setLoading(false);
      }
    }
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
          <DashboardHero />
        </motion.div>

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
                <WorkforceGrowthChart data={[]} loading={loading} />
              </motion.div>
              <motion.div className="flex flex-col" custom={0.20} variants={fade} initial="hidden" animate="visible">
                <AttendanceTrendChart data={[]} loading={loading} />
              </motion.div>
            </div>
          </div>
          
          {/* Right Column (30%) */}
          <motion.div className="xl:col-span-1" custom={0.25} variants={fade} initial="hidden" animate="visible">
            <AIInsightsPanel />
          </motion.div>
        </div>

        {/* ROW 4 ── Approval Queue & Department Distribution ── */}
        <div className="grid gap-4 xl:grid-cols-2">
          <motion.div custom={0.30} variants={fade} initial="hidden" animate="visible">
            <ApprovalQueue />
          </motion.div>
          <motion.div custom={0.35} variants={fade} initial="hidden" animate="visible">
            <DepartmentOverview />
          </motion.div>
        </div>

        {/* ROW 6 ── Employee Spotlight & Recent Activity ── */}
        <div className="grid gap-4 xl:grid-cols-2">
          <motion.div custom={0.40} variants={fade} initial="hidden" animate="visible">
            <EmployeeSpotlight />
          </motion.div>
          <motion.div custom={0.45} variants={fade} initial="hidden" animate="visible">
            <RecentActivityTimeline activities={activities} loading={loading} />
          </motion.div>
        </div>

      </div>
    </DashboardLayout>
  );
}
