import React, { useEffect, useRef, useState } from 'react';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import type { PayrollRecord } from '../../services/hrmsApi';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface PayslipPreviewModalProps {
  open: boolean;
  record: PayrollRecord | null;
  onClose: () => void;
  onDownload: (rec: PayrollRecord) => void;
}

const fmtINR = (n: number | undefined) => n !== undefined 
  ? `₹${n.toLocaleString('en-IN')}` : '₹0';

const fmtDate = (iso: string | undefined) => iso
  ? new Date(iso).toLocaleDateString('en-IN', { 
      day: '2-digit', month: 'long', year: 'numeric' 
    }) 
  : '—';

export default function PayslipPreviewModal({
  open,
  record,
  onClose,
  onDownload
}: PayslipPreviewModalProps) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isFullyVisible, setIsFullyVisible] = useState(false);
  const [cachedRecord, setCachedRecord] = useState<PayrollRecord | null>(null);

  // Keep a copy of the record so the modal can safely render while animating out
  useEffect(() => {
    if (record) setCachedRecord(record);
  }, [open, record]);

  useEffect(() => {
    if (!open) setIsFullyVisible(false);
    else if (shouldReduceMotion) setIsFullyVisible(true);
  }, [open, shouldReduceMotion]);

  const activeRecord = record || cachedRecord;
  
  // Only trap focus when the modal is fully mounted AND finished animating
  useFocusTrap(isFullyVisible && !!activeRecord, onClose, modalRef, { initialFocusRef: closeBtnRef });

  if (!activeRecord) return null;

  const handleScrimClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const employeeName = activeRecord.employeeId?.name ?? '—';
  const empId = activeRecord.employeeId?.employeeId ?? '—';
  const department = activeRecord.employeeId?.department ?? '—';
  const payDate = fmtDate(activeRecord.processedAt);
  
  const taxDeduction = Math.round((activeRecord.deductions ?? 0) * 0.6);
  const pfDeduction = Math.round((activeRecord.deductions ?? 0) * 0.3);
  const otherDeduction = (activeRecord.deductions ?? 0) - taxDeduction - pfDeduction;

  const getStatusColor = (status: string) => {
    if (status === 'Paid') return '#16a34a'; // green-600
    if (status === 'Processing') return '#0d9488'; // teal-600
    return '#d97706'; // amber-600
  };

  const getStatusBg = (status: string) => {
    if (status === 'Paid') return '#dcfce7'; // green-100
    if (status === 'Processing') return '#ccfbf1'; // teal-100
    return '#fef3c7'; // amber-100
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center pointer-events-none">
          {/* Scrim */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-[59] bg-black/45 pointer-events-auto"
            onClick={handleScrimClick}
            aria-hidden="true"
          />
          
          {/* Modal Container Wrapper for Centering / Bottom Sheet */}
          <motion.div 
            ref={modalRef}
            tabIndex={-1}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
            onAnimationComplete={() => {
              if (open) setIsFullyVisible(true);
            }}
            className="pointer-events-auto relative z-[60] flex flex-col w-full max-w-[680px] bg-white dark:bg-slate-900 rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[90vh] md:max-h-[85vh] origin-bottom overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payslip-modal-title"
          >
          {/* Action Bar */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900 px-4 py-3 shrink-0">
            <div>
              <h2 id="payslip-modal-title" className="text-base font-bold text-slate-900 dark:text-white">Payslip</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{activeRecord.month} {activeRecord.year}</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => onDownload(activeRecord)}
                className="flex items-center gap-1.5 rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <i className="ti ti-printer text-base leading-none" aria-hidden="true" />
                Print / Save PDF
              </button>
              <button 
                type="button"
                ref={closeBtnRef}
                onClick={onClose}
                aria-label="Close payslip"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                <i className="ti ti-x text-lg leading-none" aria-hidden="true" />
              </button>
            </div>
          </div>

          {/* Payslip Document (Print-safe inline styles) */}
          <div className="flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950 p-4 md:p-6">
            <div 
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontFamily: 'Arial, sans-serif',
                maxWidth: '760px',
                margin: '0 auto',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                overflow: 'hidden'
              }}
            >
              {/* HEADER */}
              <div style={{
                background: '#1e3a5f',
                color: '#ffffff',
                padding: '24px 32px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start'
              }}>
                <div>
                  <div style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px' }}>HRMSPro</div>
                  <div style={{ fontSize: '11px', opacity: 0.75, marginTop: '3px' }}>Human Resource Management System</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Payslip</h2>
                  <p style={{ fontSize: '11px', opacity: 0.8, margin: '4px 0 0 0' }}>{activeRecord.month} {activeRecord.year}</p>
                </div>
              </div>

              {/* EMPLOYEE INFO GRID */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Employee Name</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{employeeName}</div>
                </div>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Pay Date</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{payDate}</div>
                </div>
                
                <div style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Employee ID</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{empId}</div>
                </div>
                <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Department</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{department}</div>
                </div>
                
                <div style={{ padding: '16px 24px', borderRight: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Pay Period</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{activeRecord.month} {activeRecord.year}</div>
                </div>
                <div style={{ padding: '16px 24px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b', marginBottom: '4px', fontWeight: 600 }}>Status</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>
                    <span style={{ 
                      display: 'inline-block', 
                      padding: '4px 12px', 
                      borderRadius: '20px', 
                      fontSize: '11px', 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.05em',
                      backgroundColor: getStatusBg(activeRecord.status),
                      color: getStatusColor(activeRecord.status)
                    }}>
                      {activeRecord.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* EARNINGS TABLE */}
              <div style={{ padding: '24px 24px 0' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', margin: '0 0 12px 0' }}>Earnings</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#94a3b8', background: '#f8fafc' }}>Description</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#94a3b8', background: '#f8fafc' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>Basic Pay</td>
                      <td style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{fmtINR(activeRecord.basicPay)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ padding: '12px', fontWeight: 700, fontSize: '14px', color: '#0f172a', background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>Gross Earnings</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontWeight: 700, fontSize: '14px', color: '#0f172a', background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>{fmtINR(activeRecord.basicPay)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* DEDUCTIONS TABLE */}
              <div style={{ padding: '24px 24px 0', marginTop: '8px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', margin: '0 0 12px 0' }}>Deductions</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#94a3b8', background: '#f8fafc' }}>Description</th>
                      <th style={{ textAlign: 'right', padding: '10px 12px', fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', color: '#94a3b8', background: '#f8fafc' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>Income Tax (TDS)</td>
                      <td style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>{fmtINR(taxDeduction)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>Provident Fund (PF)</td>
                      <td style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>{fmtINR(pfDeduction)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', color: '#334155' }}>Other Deductions</td>
                      <td style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #f1f5f9', fontSize: '13px', fontWeight: 600, color: '#dc2626' }}>{fmtINR(otherDeduction)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td style={{ padding: '12px', fontWeight: 700, fontSize: '14px', color: '#0f172a', background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>Total Deductions</td>
                      <td style={{ textAlign: 'right', padding: '12px', fontWeight: 700, fontSize: '14px', color: '#dc2626', background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>{fmtINR(activeRecord.deductions)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* NET PAY BANNER */}
              <div style={{ margin: '24px', background: '#1e40af', borderRadius: '8px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
                <div>
                  <div style={{ fontSize: '12px', opacity: 0.85, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600 }}>Net Pay (Take Home)</div>
                  <div style={{ fontSize: '12px', opacity: 0.75, marginTop: '4px' }}>{activeRecord.month} {activeRecord.year} — Credited on {payDate}</div>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800 }}>{fmtINR(activeRecord.netPay)}</div>
              </div>

              {/* FOOTER */}
              <div style={{ padding: '16px 24px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center', fontSize: '11px', color: '#94a3b8' }}>
                This is a system-generated payslip and does not require a signature. &nbsp;|&nbsp; HRMSPro &copy; {new Date().getFullYear()}
              </div>
            </div>
          </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
