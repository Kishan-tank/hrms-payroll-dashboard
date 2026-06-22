
import { X, Mail, Phone, Building, Briefcase } from 'lucide-react';
import type { OrgNode } from './mockOrgData';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  open: boolean;
  onClose: () => void;
  employee: OrgNode | null;
}

export default function OrgEmployeePreviewDrawer({ open, onClose, employee }: Props) {
  return (
    <AnimatePresence>
      {open && employee && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm dark:bg-[#0B1121]/60"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0B1121] sm:max-w-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-white/10">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Employee Preview</h2>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-blue-100 text-3xl font-extrabold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 shadow-inner">
                  {employee.avatar}
                </div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{employee.name}</h3>
                <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">{employee.role}</p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Building className="h-3.5 w-3.5" />
                  {employee.department}
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">Contact & Info</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Email Address</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{employee.name.toLowerCase().replace(' ', '.')}@company.com</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Phone Number</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">+1 (555) 012-3456</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 dark:border-white/10 dark:bg-white/[0.02]">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-500 dark:bg-white/5 dark:text-slate-400">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Employee ID</p>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{employee.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-200 p-4 dark:border-white/10">
               <button 
                 onClick={onClose}
                 className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
               >
                 Close Preview
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
