import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, AlertCircle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import type { PayrollRecord } from '../../services/hrmsApi';

interface PayslipPreviewModalProps {
  open: boolean;
  onClose: () => void;
  record: PayrollRecord | null;
  onDownload: (rec: PayrollRecord) => void;
}

export default function PayslipPreviewModal({ open, onClose, record, onDownload }: PayslipPreviewModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (open && e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const fmt = (n?: number) => n !== undefined ? `₹${n.toLocaleString('en-IN')}` : '₹0';
  
  let payDate = 'Not processed';
  let taxEst = 0;
  let pfEst = 0;
  let otherEst = 0;

  if (record) {
    payDate = record.processedAt ? new Date(record.processedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Not processed';
    taxEst = Math.round((record.deductions ?? 0) * 0.6);
    pfEst = Math.round((record.deductions ?? 0) * 0.3);
    otherEst = (record.deductions ?? 0) - taxEst - pfEst;
  }

  return (
    <AnimatePresence>
      {open && record && (
        <div className="fixed inset-0 z-[200] flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-labelledby="payslip-modal-title">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
            className="relative flex w-full max-w-[900px] flex-col overflow-hidden rounded-t-[24px] border border-white/10 bg-slate-50/90 shadow-2xl backdrop-blur-xl dark:bg-[#0B1121]/90 sm:max-h-[90vh] sm:rounded-2xl"
            style={{ maxHeight: '90vh' }}
          >
            {/* Action Bar / Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-900/80">
              <div>
                <h2 id="payslip-modal-title" className="text-lg font-bold text-slate-900 dark:text-white">Payslip Preview</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{record.month} {record.year}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onDownload(record)}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700"
                >
                  <Printer size={16} />
                  <span className="hidden sm:inline">Print / Download PDF</span>
                  <span className="sm:hidden">Print</span>
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close modal"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8">
              <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-slate-950 sm:p-10">
                
                {/* Note about preview */}
                <div className="mb-8 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
                  <AlertCircle size={20} className="shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <strong>Preview generated from available payroll record.</strong><br/>
                    Some granular details (bank info, exact allowances, exact tax breakdowns) are estimated or marked as not available for this preview.
                  </div>
                </div>

                {/* Payslip Header */}
                <div className="mb-8 flex flex-col justify-between gap-6 border-b border-slate-100 pb-8 dark:border-white/5 sm:flex-row sm:items-end">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">HRMSPro</h1>
                    <p className="font-medium text-slate-500 dark:text-slate-400">Human Resource Management System</p>
                  </div>
                  <div className="sm:text-right">
                    <h2 className="text-xl font-bold uppercase tracking-widest text-slate-300 dark:text-slate-700">Payslip</h2>
                    <p className="mt-1 font-semibold text-slate-900 dark:text-white">{record.month} {record.year}</p>
                    <div className="mt-2 flex sm:justify-end"><StatusBadge status={record.status} /></div>
                  </div>
                </div>

                {/* Employee Info Grid */}
                <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Employee Name</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">{record.employeeId?.name || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Employee ID</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">{record.employeeId?.employeeId || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Department</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">{record.employeeId?.department || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Role</p>
                      <p className="text-sm font-medium italic text-slate-400 dark:text-slate-500">Not available</p>
                    </div>
                  </div>
                  <div className="space-y-4 sm:text-right">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pay Date</p>
                      <p className="text-base font-bold text-slate-900 dark:text-white">{payDate}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Bank Account</p>
                      <p className="text-sm font-medium italic text-slate-400 dark:text-slate-500">Not available</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">PAN / UAN</p>
                      <p className="text-sm font-medium italic text-slate-400 dark:text-slate-500">Not available</p>
                    </div>
                  </div>
                </div>

                {/* Financials Table */}
                <div className="mb-8 grid gap-6 sm:grid-cols-2">
                  {/* Earnings */}
                  <div>
                    <h3 className="mb-3 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:border-white/10 dark:text-slate-400">Earnings</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Basic Pay</span>
                        <span className="font-semibold text-slate-900 dark:text-white">{fmt(record.basicPay)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Other Allowances</span>
                        <span className="italic text-slate-400">Not available</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 dark:border-white/10">
                      <span className="font-bold text-slate-900 dark:text-white">Gross Earnings</span>
                      <span className="font-bold text-slate-900 dark:text-white">{fmt(record.basicPay)}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div>
                    <h3 className="mb-3 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:border-white/10 dark:text-slate-400">Deductions</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Income Tax (TDS) <span className="ml-1 text-[10px] uppercase text-amber-500">Estimated</span></span>
                        <span className="font-semibold text-slate-900 dark:text-white">{fmt(taxEst)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Provident Fund (PF) <span className="ml-1 text-[10px] uppercase text-amber-500">Estimated</span></span>
                        <span className="font-semibold text-slate-900 dark:text-white">{fmt(pfEst)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-300">Other Deductions <span className="ml-1 text-[10px] uppercase text-amber-500">Estimated</span></span>
                        <span className="font-semibold text-slate-900 dark:text-white">{fmt(otherEst)}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 dark:border-white/10">
                      <span className="font-bold text-red-500">Total Deductions</span>
                      <span className="font-bold text-red-500">{fmt(record.deductions)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Pay Footer Card */}
                <div className="rounded-xl bg-slate-50 p-6 dark:bg-white/5 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Net Pay (Take Home)</h4>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">For the period of {record.month} {record.year}</p>
                  </div>
                  <div className="mt-4 text-3xl font-black text-slate-900 dark:text-white sm:mt-0">
                    {fmt(record.netPay)}
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
