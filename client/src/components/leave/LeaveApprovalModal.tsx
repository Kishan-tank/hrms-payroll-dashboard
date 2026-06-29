import { useEffect, useState, useRef } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Small delay to allow the element to render before focusing
      setTimeout(() => cancelBtnRef.current?.focus(), 10);
    } else {
      setMounted(false);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, loading, onCancel]);

  if (!open || !leave) return null;

  const isApproved = action === 'Approved';
  const iconBg = isApproved ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-red-100 dark:bg-red-500/20';
  const iconColor = isApproved ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';
  const iconClass = isApproved ? 'ti-circle-check' : 'ti-circle-x';
  const title = isApproved ? 'Confirm Approval' : 'Confirm Rejection';
  
  const daysString = `${leave.days} day${leave.days === 1 ? '' : 's'}`;
  const fromStr = leave.fromDate?.split('T')[0] || (leave as any).from;
  const toStr = leave.toDate?.split('T')[0] || (leave as any).to;
  const employeeName = leave.employeeId?.name || (leave as any).name || 'Unknown';

  return (
    <>
      <div 
        className="fixed inset-0 z-[60] bg-black/50" 
        onClick={() => {
          if (!loading) onCancel();
        }}
      />
      
      <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
        <div 
          className={`pointer-events-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-150 dark:border-white/10 dark:bg-slate-900 ${mounted ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        >
          <div className="mb-6 flex flex-col items-center text-center">
            <div className={`mb-4 flex h-[56px] w-[56px] items-center justify-center rounded-full ${iconBg} ${iconColor}`}>
              <i className={`ti ${iconClass} text-3xl`} />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
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
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{leave.type}</span>
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
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{leave.reason ?? '—'}</span>
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
        </div>
      </div>
    </>
  );
}
