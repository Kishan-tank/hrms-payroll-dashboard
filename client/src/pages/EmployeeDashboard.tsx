import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { dashboardService, EmployeeSummary } from '../services/hrmsApi';

import EmployeeHero from '../components/employee/EmployeeHero';
import WorkspaceSnapshot from '../components/employee/WorkspaceSnapshot';
import ProductivityOverview from '../components/employee/ProductivityOverview';
import PayrollAndLeave from '../components/employee/PayrollAndLeave';
import SkillsAndAchievements from '../components/employee/SkillsAndAchievements';
import EmployeeQuickActions from '../components/employee/EmployeeQuickActions';
import ActivityAndEvents from '../components/employee/ActivityAndEvents';
import MyGoals from '../components/employee/MyGoals';
import EmployeeProfileDrawer from '../components/employee/EmployeeProfileDrawer';

const fade: any = {
  hidden: { opacity: 0, y: 20 },
  visible: (d: number) => ({ opacity: 1, y: 0, transition: { delay: d, duration: 0.5, ease: 'easeOut' } }),
};

export default function EmployeeDashboard() {
  const [loading, setLoading] = useState(true);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [summary, setSummary] = useState<EmployeeSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await dashboardService.getEmployeeSummary();
        if (res.success && res.summary) {
          setSummary(res.summary);
        } else {
          throw new Error("Invalid response");
        }
      } catch (err: any) {
        console.warn("Failed to load employee dashboard data, using fallback mock data", err);
        // Fallback mock data if backend fails or Employee profile is missing
        setSummary({
          employee: {
            name: "Employee",
            role: "Frontend Developer",
            department: "Engineering"
          },
          workspace: {
            attendanceStatus: "Checked In",
            checkInTime: new Date().toISOString()
          },
          payrollLeave: {
            leavesTaken: 6,
            leaveBalance: 18,
            latestNetPay: 55000
          }
        });
        setError(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout title="Employee Workspace">
        <div className="flex h-[50vh] items-center justify-center text-slate-500">
          <div className="animate-pulse flex flex-col items-center gap-4">
            <div className="h-8 w-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
            <p>Loading your workspace...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !summary) {
    return (
      <DashboardLayout title="Employee Workspace">
        <div className="flex h-[50vh] items-center justify-center text-slate-500">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="h-12 w-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center mb-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-white">Failed to load workspace</h3>
            <p className="text-sm text-slate-400">{error || "No data available"}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
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
          <WorkspaceSnapshot />
        </motion.div>

        {/* ROW 2.5: Productivity Overview */}
        <motion.div custom={0.08} variants={fade} initial="hidden" animate="visible">
          <ProductivityOverview />
        </motion.div>

        {/* ROW 3: Payroll & Leave Analytics */}
        <motion.div custom={0.10} variants={fade} initial="hidden" animate="visible">
          <PayrollAndLeave />
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
