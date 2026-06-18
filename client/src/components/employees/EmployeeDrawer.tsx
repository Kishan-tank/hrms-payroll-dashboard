import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { ApiEmployee } from '../../services/hrmsApi';

interface EmployeeDrawerProps {
  open: boolean;
  onClose: () => void;
  employee: ApiEmployee | null;
}

type TabType = 'overview' | 'attendance' | 'leave' | 'payroll' | 'documents' | 'activity';

function CloseIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export default function EmployeeDrawer({ open, onClose, employee }: EmployeeDrawerProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  if (!employee) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-2xl flex-col bg-white shadow-2xl dark:bg-slate-950 sm:w-[500px] lg:w-[600px] border-l border-slate-200 dark:border-white/10"
          >
            {/* Header / Cover */}
            <div className="relative shrink-0 overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 px-6 pb-6 pt-12 text-white">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-md transition hover:bg-black/40"
              >
                <CloseIcon />
              </button>

              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl font-bold shadow-inner ring-2 ring-white/30 backdrop-blur-md">
                  {employee.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold">{employee.name}</h2>
                  <p className="font-medium text-blue-100">{employee.role} · {employee.department}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                      {employee.status}
                    </span>
                    <span className="text-xs text-blue-200">ID: {employee.employeeId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 gap-6 overflow-x-auto border-b border-slate-200 bg-white px-6 pt-4 dark:border-white/10 dark:bg-slate-900 scrollbar-hide">
              {(['overview', 'attendance', 'leave', 'payroll', 'documents', 'activity'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative pb-3 text-sm font-bold uppercase tracking-wide transition-colors ${
                    activeTab === tab
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="drawer-tab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <h3 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-slate-400">Contact Information</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Email Address</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{employee.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{employee.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <h3 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-slate-400">Employment Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Join Date</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{new Date(employee.joinDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Basic Pay</p>
                        <p className="font-semibold text-slate-900 dark:text-white">₹{employee.basicPay.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 text-5xl opacity-20">⏰</div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Attendance Records</h3>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Attendance sync is coming soon.</p>
                </div>
              )}

              {/* Mocks for other tabs */}
              {['leave', 'payroll', 'documents', 'activity'].includes(activeTab) && (
                 <div className="flex h-full flex-col items-center justify-center text-center">
                 <div className="mb-4 text-5xl opacity-20">🚧</div>
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white capitalize">{activeTab} Info</h3>
                 <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Detailed {activeTab} history will be displayed here.</p>
               </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="border-t border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-slate-900">
              <button
                onClick={onClose}
                className="w-full rounded-xl bg-slate-100 px-4 py-2.5 font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/20"
              >
                Close Drawer
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
