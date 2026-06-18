import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';

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
  const [, setLoading] = useState(true);
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);

  // Simulated initial load
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

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
          <EmployeeHero onViewProfile={() => setIsProfileDrawerOpen(true)} />
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
