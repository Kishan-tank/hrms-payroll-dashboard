import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Clock, CalendarDays, DollarSign, FileText, ChevronRight, MapPin, Mail, Phone, Briefcase } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';

interface EmployeeProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABS = [
  { id: 'personal', label: 'Personal Details', icon: User },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'leave', label: 'Leave', icon: CalendarDays },
  { id: 'payroll', label: 'Payroll', icon: DollarSign },
  { id: 'documents', label: 'Documents', icon: FileText },
];

export default function EmployeeProfileDrawer({ isOpen, onClose }: EmployeeProfileDrawerProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const { user } = useAuthContext();

  const rawDisplayName = user?.name ?? 'Employee';
  const displayName = rawDisplayName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const displayRole = user?.role === 'hr-manager' ? 'HR Manager' : (user?.role || 'Employee');
  const displayEmail = user?.email || '-';
  const displayEmpId = (user as any)?.employeeId || '-';
  const displayDepartment = (user as any)?.department || '-';
  const displayPhone = (user as any)?.phone || '-';
  const displayManager = (user as any)?.manager || '-';
  const displayJoinDate = (user as any)?.joinDate || '-';

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3b82f6&color=fff`;
  const managerAvatarUrl = displayManager !== '-' ? `https://ui-avatars.com/api/?name=${encodeURIComponent(displayManager)}&background=8b5cf6&color=fff` : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#0B1121]/60 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-l border-white/10 bg-[#0B1121] shadow-[0_0_80px_rgba(0,0,0,0.8)]"
          >
            {/* Header */}
            <div className="relative border-b border-white/10 bg-gradient-to-b from-blue-600/20 to-transparent p-6 pb-0">
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4 pt-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-white/10 shadow-xl">
                  <img src={avatarUrl} alt={displayName} className="h-full w-full object-cover" />
                  <div className="absolute bottom-0 right-0 h-4 w-4 rounded-full border-2 border-[#0B1121] bg-emerald-500" />
                </div>
                <div>
                  <h2 className="text-[24px] font-black tracking-tight text-white">{displayName}</h2>
                  <p className="text-[14px] font-bold text-blue-400">{displayRole}</p>
                  <div className="mt-1 flex items-center gap-2 text-[12px] font-semibold text-slate-400">
                    <span className="flex items-center gap-1"><MapPin size={12} /> Office</span>
                    <span>•</span>
                    <span>Emp ID: {displayEmpId}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-8 flex gap-6 overflow-x-auto custom-scrollbar">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 pb-3 text-[13px] font-extrabold uppercase tracking-wider transition-colors ${
                      activeTab === tab.id ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  {activeTab === 'personal' && (
                    <>
                      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                        <h3 className="mb-4 text-[12px] font-extrabold uppercase tracking-wider text-slate-500">Contact Information</h3>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400"><Mail size={14} /></div>
                            <div>
                              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Work Email</div>
                              <div className="text-[14px] font-semibold text-white">{displayEmail}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400"><Phone size={14} /></div>
                            <div>
                              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Phone Number</div>
                              <div className="text-[14px] font-semibold text-white">{displayPhone}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5">
                        <h3 className="mb-4 text-[12px] font-extrabold uppercase tracking-wider text-slate-500">Work Details</h3>
                        <div className="flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-slate-400">Department</span>
                            <span className="text-[13px] font-bold text-white">{displayDepartment}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-slate-400">Reporting Manager</span>
                            <span className="flex items-center gap-2 text-[13px] font-bold text-white">
                              {displayManager !== '-' && (
                                <img src={managerAvatarUrl} alt={displayManager} className="h-5 w-5 rounded-full" />
                              )}
                              {displayManager}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[13px] font-bold text-slate-400">Date of Join</span>
                            <span className="text-[13px] font-bold text-white">{displayJoinDate}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {activeTab === 'attendance' && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Clock size={40} className="mb-4 text-slate-600" />
                      <h3 className="text-[16px] font-bold text-white">Attendance Records</h3>
                      <p className="mt-2 text-[13px] font-medium text-slate-400">Detailed attendance logs are available in the Attendance section.</p>
                      <button className="mt-4 flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-bold text-white hover:bg-white/20 transition-colors">
                        View Full Report <ChevronRight size={14} />
                      </button>
                    </div>
                  )}

                  {/* Render placeholders for other tabs to keep it concise, since focus is on the Drawer architecture */}
                  {['leave', 'payroll', 'documents'].includes(activeTab) && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <Briefcase size={40} className="mb-4 text-slate-600" />
                      <h3 className="text-[16px] font-bold text-white capitalize">{activeTab} Details</h3>
                      <p className="mt-2 text-[13px] font-medium text-slate-400">Detailed information is available in the main portal.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
