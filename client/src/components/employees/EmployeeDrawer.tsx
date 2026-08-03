import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import { Clock, Calendar, CreditCard, FolderOpen, Zap, FileText, ExternalLink } from 'lucide-react';
import type { ApiEmployee, ApiAttendance, ApiLeave, PayrollRecord, ApiDocument } from '../../services/hrmsApi';
import { attendanceService, leaveService, payrollService, documentService } from '../../services/hrmsApi';
import { useFocusTrap } from '../../hooks/useFocusTrap';

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
  const drawerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const [cachedEmployee, setCachedEmployee] = useState<ApiEmployee | null>(null);

  useEffect(() => {
    if (employee) setCachedEmployee(employee);
  }, [open, employee]);

  useEffect(() => {
    if (!open) setIsFullyVisible(false);
    else if (shouldReduceMotion) setIsFullyVisible(true);
  }, [open, shouldReduceMotion]);

  const activeEmployee = employee || cachedEmployee;

  useFocusTrap(isFullyVisible && !!activeEmployee, onClose, drawerRef);

  const [attendance, setAttendance] = useState<ApiAttendance[]>([]);
  const [leaves, setLeaves] = useState<ApiLeave[]>([]);
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [documents, setDocuments] = useState<ApiDocument[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  // Robust multi-fallback matching helper
  const matchesEmployee = (ref: any, emp: ApiEmployee | null): boolean => {
    if (!ref || !emp) return false;

    // Direct string ID match
    if (typeof ref === 'string') {
      const empUserId = emp.userId ? (typeof emp.userId === 'object' ? String(emp.userId._id) : String(emp.userId)) : null;
      return (
        ref === emp._id ||
        ref === emp.employeeId ||
        (Boolean(empUserId) && ref === empUserId)
      );
    }

    // Object match
    const refId = ref._id ? String(ref._id) : null;
    const refEmpId = ref.employeeId ? String(ref.employeeId) : null;
    const refEmail = ref.email ? String(ref.email).toLowerCase() : null;
    const refUserId = ref.userId
      ? (typeof ref.userId === 'object' ? String(ref.userId._id) : String(ref.userId))
      : null;

    const targetId = String(emp._id);
    const targetEmpId = String(emp.employeeId);
    const targetEmail = emp.email ? String(emp.email).toLowerCase() : null;
    const targetUserId = emp.userId
      ? (typeof emp.userId === 'object' ? String(emp.userId._id) : String(emp.userId))
      : null;

    return Boolean(
      (refId && refId === targetId) ||
      (refEmpId && refEmpId === targetEmpId) ||
      (refEmail && targetEmail && refEmail === targetEmail) ||
      (refUserId && targetUserId && refUserId === targetUserId)
    );
  };

  useEffect(() => {
    if (!open || !employee?._id) return;
    async function load() {
      setLoadingData(true);
      try {
        const [attRes, leavRes, payRes, docRes] = await Promise.allSettled([
          attendanceService.getAll(),
          leaveService.getAll(),
          payrollService.getRecords(),
          documentService.getAll(employee!._id)
        ]);

        if (attRes.status === 'fulfilled') {
          setAttendance(attRes.value.records.filter((r) => matchesEmployee(r.employeeId, employee)));
        }
        if (leavRes.status === 'fulfilled') {
          setLeaves(leavRes.value.leaves.filter((l) => matchesEmployee(l.employeeId, employee)));
        }
        if (payRes.status === 'fulfilled') {
          setPayroll(payRes.value.records.filter((p) => matchesEmployee(p.employeeId, employee)));
        }

        // Merge separate Document records with employee.documents array
        const fetchedDocs: ApiDocument[] = docRes.status === 'fulfilled' ? docRes.value.documents : [];
        const empDocs: ApiDocument[] = (employee!.documents || []).map((d: any, idx: number) => ({
          _id: `emp_doc_${idx}`,
          title: d.name || d.type || 'Onboarding Document',
          type: d.type === 'gov_id' ? 'ID Proof' : d.type === 'offer_letter' ? 'Offer Letter' : 'Other',
          fileUrl: d.url,
          uploadedBy: employee!.name,
          createdAt: employee!.createdAt || new Date().toISOString()
        }));

        setDocuments([...fetchedDocs, ...empDocs]);

      } catch (err) {
        console.error('Failed to load employee drawer data', err);
      } finally {
        setLoadingData(false);
      }
    }
    void load();
  }, [open, employee]);

  if (!activeEmployee) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-drawer-title"
            tabIndex={-1}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', damping: 25, stiffness: 200 }}
            onAnimationComplete={() => { if (open) setIsFullyVisible(true); }}
            className="fixed inset-y-0 right-0 z-[110] flex w-full max-w-2xl flex-col bg-white shadow-2xl dark:bg-slate-950 sm:w-[500px] lg:w-[600px] border-l border-slate-200 dark:border-white/10 outline-none"
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
                  {activeEmployee.name.charAt(0)}
                </div>
                <div>
                  <h2 id="employee-drawer-title" className="text-2xl font-extrabold">{activeEmployee.name}</h2>
                  <p className="font-medium text-blue-100">{activeEmployee.role} · {activeEmployee.department}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                      {activeEmployee.status}
                    </span>
                    <span className="text-xs text-blue-200">ID: {activeEmployee.employeeId}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 gap-6 overflow-x-auto border-b border-slate-200 px-6 dark:border-white/10 relative z-10 bg-white dark:bg-slate-950 scrollbar-hide">
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
                        <p className="text-xs text-slate-500 dark:text-slate-400">Employee ID</p>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{activeEmployee.employeeId}</div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Phone Number</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{activeEmployee.phone || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.03]">
                    <h3 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-slate-400">Employment Details</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Join Date</p>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{new Date(activeEmployee.joinDate).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Basic Pay</p>
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">₹{activeEmployee.basicPay.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attendance' && (
                <div className="space-y-4">
                  {loadingData ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800/60 w-full" />
                      ))}
                    </div>
                  ) : attendance.length > 0 ? (
                    attendance.map((att) => (
                      <div key={att._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{new Date(att.date).toLocaleDateString()}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Check In: {att.checkIn ? new Date(att.checkIn).toLocaleTimeString() : 'N/A'} • Check Out: {att.checkOut ? new Date(att.checkOut).toLocaleTimeString() : 'N/A'}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${att.status === 'Present' ? 'bg-emerald-500/10 text-emerald-500' : att.status === 'Late' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                          {att.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center py-12">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-500/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-400 border border-blue-500/20 shadow-inner">
                        <Clock className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Attendance Records</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No recent check-in logs found for this employee.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'leave' && (
                <div className="space-y-4">
                  {loadingData ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800/60 w-full" />
                      ))}
                    </div>
                  ) : leaves.length > 0 ? (
                    leaves.map((l) => (
                      <div key={l._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{l.type} ({l.days} days)</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(l.fromDate).toLocaleDateString()} – {new Date(l.toDate).toLocaleDateString()}</p>
                          {l.reason && <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 italic">"{l.reason}"</p>}
                        </div>
                        <span className={`rounded-full px-3 py-1 text-xs font-bold ${l.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500' : l.status === 'Pending' ? 'bg-amber-500/10 text-amber-500' : 'bg-red-500/10 text-red-500'}`}>
                          {l.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center py-12">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400 border border-amber-500/20 shadow-inner">
                        <Calendar className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Leave Records</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This employee has not requested any leaves.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'payroll' && (
                <div className="space-y-4">
                  {loadingData ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800/60 w-full" />
                      ))}
                    </div>
                  ) : payroll.length > 0 ? (
                    payroll.map((p) => (
                      <div key={p._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                        <div>
                          <p className="font-bold text-sm text-slate-900 dark:text-white">{p.month} {p.year}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">Basic: ₹{p.basicPay.toLocaleString()} • Deductions: ₹{p.deductions.toLocaleString()}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">₹{p.netPay.toLocaleString()}</p>
                          <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${p.status === 'Paid' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center py-12">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400 border border-emerald-500/20 shadow-inner">
                        <CreditCard className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Payroll Records</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No generated payslips found for this employee.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  {loadingData ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-16 rounded-xl bg-slate-200 dark:bg-slate-800/60 w-full" />
                      ))}
                    </div>
                  ) : documents.length > 0 ? (
                    documents.map((doc) => {
                      const backendUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
                      const token = localStorage.getItem('token') || '';
                      const viewUrl = doc.fileUrl ? (doc.fileUrl.startsWith('http') ? doc.fileUrl : `${backendUrl}${doc.fileUrl}?token=${token}`) : '#';
                      return (
                        <div key={doc._id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-900 dark:text-white">{doc.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{doc.type} • {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'N/A'}</p>
                            </div>
                          </div>
                          <a href={viewUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                            View <ExternalLink className="h-3 w-3" />
                          </a>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center text-center py-12">
                      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-purple-500/10 text-purple-600 dark:bg-purple-400/10 dark:text-purple-400 border border-purple-500/20 shadow-inner">
                        <FolderOpen className="h-8 w-8" />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Documents</h3>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No documents uploaded for this employee yet.</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-4">
                  <div className="flex h-full flex-col items-center justify-center text-center py-12">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-500/10 text-indigo-600 dark:bg-indigo-400/10 dark:text-indigo-400 border border-indigo-500/20 shadow-inner">
                      <Zap className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Activity</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Employee profile created and active in {activeEmployee.department}.</p>
                  </div>
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
