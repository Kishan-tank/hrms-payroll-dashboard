import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import { useAuthContext } from '../context/AuthContext';
import { employeeService } from '../services/hrmsApi';
import type { ApiEmployee } from '../services/hrmsApi';
import StatusBadge from '../components/common/StatusBadge';

import { OverviewTab, PersonalTab, EmploymentTab, PayrollBankTab, DocumentsTab, SkillsActivityTab } from '../components/profile/ProfileTabs';
import { User, FileText, Briefcase, CreditCard, Folder, Zap } from 'lucide-react';

type TabId = 'overview' | 'personal' | 'employment' | 'payroll' | 'documents' | 'skills';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: User },
  { id: 'personal', label: 'Personal', icon: FileText },
  { id: 'employment', label: 'Employment', icon: Briefcase },
  { id: 'payroll', label: 'Payroll & Bank', icon: CreditCard },
  { id: 'documents', label: 'Documents', icon: Folder },
  { id: 'skills', label: 'Skills & Activity', icon: Zap },
];

export default function ProfilePage() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [employee, setEmployee] = useState<ApiEmployee | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      try {
        const res = await employeeService.getMe();
        if (res.success && res.employee) {
          setEmployee(res.employee);
        }
      } catch (err) {
        console.error("Failed to fetch employee profile", err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout title="My Profile">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Fallback if not found in DB but logged in (e.g. admin or missing record)
  const displayEmployee: ApiEmployee = employee || {
    _id: (user as any)?._id || 'EMP-MOCK',
    employeeId: (user as any)?.employeeId || 'EMP-000',
    name: user?.name || 'Unknown User',
    email: user?.email || 'unknown@example.com',
    department: user?.department || 'Unassigned',
    role: user?.role || 'Employee',
    status: 'Active',
    joinDate: new Date().toISOString(),
    basicPay: 0,
  };

  const initials = displayEmployee.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  return (
    <DashboardLayout title="My Profile">
      <div className="mx-auto max-w-5xl space-y-6 pb-12">
        {/* Cover Banner & Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121]"
        >
          {/* Cover */}
          <div className="h-32 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 sm:h-48" />
          
          <div className="px-6 pb-6 sm:px-10">
            {/* Avatar overlapping cover */}
            <div className="relative -mt-16 sm:-mt-24 flex items-end justify-between">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-slate-900 text-4xl font-extrabold text-white shadow-lg dark:border-slate-950 sm:h-40 sm:w-40 sm:text-5xl">
                {initials}
              </div>
              <div className="mb-4 flex gap-3">
                <button className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.05] dark:text-slate-300 dark:hover:bg-white/10">
                  Request Time Off
                </button>
              </div>
            </div>

            {/* Basic Info */}
            <div className="mt-4 sm:mt-6">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white sm:text-3xl">{displayEmployee.name}</h1>
                <StatusBadge status={displayEmployee.status} />
              </div>
              <p className="mt-1 text-lg font-medium text-blue-600 dark:text-blue-400">{displayEmployee.role}</p>
              <p className="mt-1 flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> 
                  {displayEmployee.department}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> 
                  Remote / Hybrid
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="overflow-x-auto no-scrollbar">
          <div className="flex w-max gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-slate-900 text-white shadow-md dark:bg-blue-500/10 dark:text-blue-400 dark:shadow-none' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" /> {tab.label}
              </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          {activeTab === 'overview' && <OverviewTab employee={displayEmployee} />}
          {activeTab === 'personal' && <PersonalTab employee={displayEmployee} />}
          {activeTab === 'employment' && <EmploymentTab employee={displayEmployee} />}
          {activeTab === 'payroll' && <PayrollBankTab employee={displayEmployee} />}
          {activeTab === 'documents' && <DocumentsTab />}
          {activeTab === 'skills' && <SkillsActivityTab />}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
