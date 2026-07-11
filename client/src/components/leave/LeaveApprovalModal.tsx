import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import type { ApiLeave } from '../../services/hrmsApi';

interface LeaveApprovalModalProps {
  open: boolean;
  action: 'Approved' | 'Rejected' | null;
  leave: ApiLeave | null;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function LeaveApprovalModal({
  open,
  action,
  leave,
  onConfirm,
  onCancel,
  loading,
}: LeaveApprovalModalProps) {
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  
  const [cachedLeave, setCachedLeave] = useState<ApiLeave | null>(null);
  const [cachedAction, setCachedAction] = useState<'Approved' | 'Rejected' | null>(null);

  useEffect(() => {
    if (leave) {
      setCachedLeave(leave);
      setCachedAction(action);
    }
  }, [open, leave, action]);

  useEffect(() => {
    if (!open) setIsFullyVisible(false);
    else if (shouldReduceMotion) setIsFullyVisible(true);
  }, [open, shouldReduceMotion]);

  const activeLeave = leave || cachedLeave;
  const activeAction = action || cachedAction;

  useFocusTrap(isFullyVisible && !!activeLeave, loading ? () => {} : onCancel, modalRef, { initialFocusRef: cancelBtnRef });

  if (!activeLeave) return null;

  const isApproved = activeAction === 'Approved';
  const iconBg = isApproved ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-red-100 dark:bg-red-500/20';
  const iconColor = isApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const iconClass = isApproved ? 'ti-circle-check' : 'ti-circle-x';
  const title = isApproved ? 'Confirm Approval' : 'Confirm Rejection';
  
  const daysString = `${activeLeave.days} day${activeLeave.days === 1 ? '' : 's'}`;
  const fromStr = activeLeave.fromDate?.split('T')[0] || (activeLeave as any).from;
  const toStr = activeLeave.toDate?.split('T')[0] || (activeLeave as any).to;
  const employeeName = activeLeave.employeeId?.name || (activeLeave as any).name || 'Unknown';

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" 
            onClick={() => {
              if (!loading) onCancel();
            }}
          />
          
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <motion.div 
              ref={modalRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby="leave-approval-modal-title"
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
              onAnimationComplete={() => { if (open) setIsFullyVisible(true); }}
              className="pointer-events-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-slate-900"
            >
          <div className="mb-6 flex flex-col items-center text-center">
            <div className={`mb-4 flex h-[56px] w-[56px] items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
              <i className={`ti ${iconClass} text-3xl`} />
            </div>
            <h2 id="leave-approval-modal-title" className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              This action will update the leave status and notify the employee.
            </p>
          </div>

          <div className="mb-6 space-y-2 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Employee</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{employeeName}</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Leave type</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activeLeave.type}</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Duration</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{daysString}</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Dates</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{fromStr} &rarr; {toStr}</span>
            </div>
            <div className="grid grid-cols-[1fr_2fr] gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Reason</span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{activeLeave.reason ?? '—'}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              ref={cancelBtnRef}
              onClick={onCancel}
              disabled={loading}
              className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 ${isApproved ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-red-500 hover:bg-red-600'}`}
            >
              {loading && <i className="ti ti-loader-2 animate-spin" aria-hidden="true" />}
              {isApproved ? 'Approve' : 'Reject'}
            </button>
          </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
