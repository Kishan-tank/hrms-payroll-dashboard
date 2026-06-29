import { useEffect, useState, useMemo, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { payrollService } from '../services/hrmsApi';
import type { PayrollRecord, PayrollSummary } from '../services/hrmsApi';
import { useAuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import DataTable from '../components/common/DataTable';
import type { DataTableColumn } from '../components/common/DataTable';
import StatusBadge from '../components/common/StatusBadge';
import PayslipPreviewModal from '../components/payroll/PayslipPreviewModal';
import ContextMenu from '../components/common/ContextMenu';
import { useContextMenu } from '../hooks/useContextMenu';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CURRENT_MONTH = MONTHS[new Date().getMonth()];
const CURRENT_YEAR = new Date().getFullYear();

function fmt(n: number | undefined) {
  if (n === undefined) return '—';
  return `₹${n.toLocaleString('en-IN')}`;
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`} />;
}

export default function PayrollPage() {
  const { user } = useAuthContext();
  const toast = useToast();
  const isEmployee = user?.role === 'employee';


  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [runMsg, setRunMsg] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(null);

  const { menuProps, handleContextMenu } = useContextMenu();
  const contextTargetRef = useRef<PayrollRecord | null>(null);

  function buildPayrollMenuItems(row: PayrollRecord) {
    return [
      { label: 'View payslip', icon: 'eye', onClick: () => setSelectedRecord(row) },
      { label: 'Download payslip', icon: 'download', onClick: () => handleDownloadPayslip(row) },
    ];
  }

  const [filterMonth, setFilterMonth] = useState(CURRENT_MONTH);
  const [filterYear] = useState(CURRENT_YEAR);

  async function fetchData() {
    setLoading(true);
    setError(null);

    // MOCK DATA FOR EMPLOYEE VIEW UNTIL BACKEND IS READY
    if (isEmployee) {
      setTimeout(() => {
        setRecords([
          {
            _id: `mock-pr-${filterMonth}-${filterYear}`,
            employeeId: { name: user?.name, employeeId: currentEmployeeId, department: user?.department || 'Engineering' } as any,
            basicPay: 75000,
            deductions: 3500,
            netPay: 71500,
            status: 'Paid',
            month: filterMonth,
            year: filterYear,
            processedAt: new Date().toISOString(),
          }
        ]);
        setSummary({
          totalAmount: 75000,
          paidCount: 1,
          processingCount: 0,
          pendingCount: 0
        });
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const [recs, sum] = await Promise.all([
        payrollService.getRecords({ month: filterMonth, year: filterYear }),
        payrollService.getSummary(filterMonth, filterYear),
      ]);
      setRecords(recs.records);
      setSummary(sum.summary);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void fetchData(); }, [filterMonth, filterYear]);

  async function handleRunPayroll() {
    setRunning(true);
    setRunMsg(null);
    try {
      const res = await payrollService.run(filterMonth, filterYear);
      setRunMsg(`✅ ${res.message}`);
      void fetchData();
    } catch (err) {
      setRunMsg(`❌ ${(err as Error).message}`);
    } finally {
      setRunning(false);
    }
  }

  const getCurrentEmployeeId = () => {
    return (user as any)?.employeeId || user?.id || (user as any)?._id || "";
  };
  const currentEmployeeId = getCurrentEmployeeId();

  function handleDownloadPayslip(rec: PayrollRecord) {
    const employeeName = rec.employeeId?.name || user?.name || 'Employee';
    const empId = rec.employeeId?.employeeId || currentEmployeeId || '—';
    const department = rec.employeeId?.department || user?.department || '—';
    const payDate = rec.processedAt ? new Date(rec.processedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';
    const fmtNum = (n: number | undefined) => n !== undefined ? `₹${n.toLocaleString('en-IN')}` : '₹0';
    const taxDeduction = Math.round((rec.deductions ?? 0) * 0.6);
    const pfDeduction  = Math.round((rec.deductions ?? 0) * 0.3);
    const otherDeduction = (rec.deductions ?? 0) - taxDeduction - pfDeduction;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Payslip — ${rec.month} ${rec.year}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; background: #fff; padding: 40px; font-size: 13px; }
    .slip { max-width: 760px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
    /* Header */
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #1e40af 100%); color: #fff; padding: 28px 32px; display: flex; justify-content: space-between; align-items: flex-start; }
    .company-name { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .company-sub  { font-size: 11px; opacity: 0.75; margin-top: 3px; }
    .slip-title   { text-align: right; }
    .slip-title h2 { font-size: 16px; font-weight: 700; }
    .slip-title p  { font-size: 11px; opacity: 0.8; margin-top: 4px; }
    /* Employee Info */
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border-bottom: 1px solid #e2e8f0; }
    .info-cell { padding: 18px 24px; border-right: 1px solid #e2e8f0; }
    .info-cell:last-child, .info-cell:nth-child(2) { border-right: none; }
    .info-cell:nth-child(n+3) { border-top: 1px solid #e2e8f0; }
    .info-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 4px; font-weight: 600; }
    .info-value { font-size: 14px; font-weight: 600; color: #0f172a; }
    /* Earnings / Deductions */
    .section { padding: 24px 24px 0; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 0; }
    table { width: 100%; border-collapse: collapse; }
    table th { text-align: left; padding: 10px 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #94a3b8; background: #f8fafc; }
    table th:last-child { text-align: right; }
    table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #334155; }
    table td:last-child { text-align: right; font-weight: 600; color: #0f172a; }
    .deduct td:last-child { color: #dc2626; }
    .total-row td { font-weight: 700; font-size: 14px; color: #0f172a; background: #f8fafc; border-top: 2px solid #e2e8f0; border-bottom: none; }
    /* Net Pay Banner */
    .net-pay { margin: 24px; background: linear-gradient(135deg, #1e40af, #7c3aed); border-radius: 8px; padding: 20px 24px; display: flex; justify-content: space-between; align-items: center; color: #fff; }
    .net-pay-label { font-size: 12px; opacity: 0.85; text-transform: uppercase; letter-spacing: 0.1em; }
    .net-pay-amount { font-size: 28px; font-weight: 800; }
    /* Status Badge */
    .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .badge-paid { background: #dcfce7; color: #16a34a; }
    .badge-pending { background: #fef3c7; color: #d97706; }
    .badge-processing { background: #ccfbf1; color: #0d9488; }
    /* Footer */
    .footer { padding: 16px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; text-align: center; font-size: 11px; color: #94a3b8; }
    @media print {
      body { padding: 0; }
      .slip { border: none; border-radius: 0; }
    }
  </style>
</head>
<body>
<div class="slip">
  <div class="header">
    <div>
      <div class="company-name">HRMSPro</div>
      <div class="company-sub">Human Resource Management System</div>
    </div>
    <div class="slip-title">
      <h2>Payslip</h2>
      <p>${rec.month} ${rec.year}</p>
    </div>
  </div>

  <div class="info-grid">
    <div class="info-cell"><div class="info-label">Employee Name</div><div class="info-value">${employeeName}</div></div>
    <div class="info-cell"><div class="info-label">Pay Date</div><div class="info-value">${payDate}</div></div>
    <div class="info-cell"><div class="info-label">Employee ID</div><div class="info-value">${empId}</div></div>
    <div class="info-cell"><div class="info-label">Department</div><div class="info-value">${department}</div></div>
    <div class="info-cell"><div class="info-label">Pay Period</div><div class="info-value">${rec.month} ${rec.year}</div></div>
    <div class="info-cell"><div class="info-label">Status</div><div class="info-value"><span class="badge badge-${rec.status.toLowerCase()}">${rec.status}</span></div></div>
  </div>

  <div class="section">
    <div class="section-title">Earnings</div>
    <table>
      <thead><tr><th>Description</th><th>Amount</th></tr></thead>
      <tbody>
        <tr><td>Basic Pay</td><td>${fmtNum(rec.basicPay)}</td></tr>
      </tbody>
      <tfoot><tr class="total-row"><td>Total Earnings</td><td>${fmtNum(rec.basicPay)}</td></tr></tfoot>
    </table>
  </div>

  <div class="section" style="margin-top:16px">
    <div class="section-title">Deductions</div>
    <table>
      <thead><tr><th>Description</th><th>Amount</th></tr></thead>
      <tbody class="deduct">
        <tr><td>Income Tax (TDS)</td><td>${fmtNum(taxDeduction)}</td></tr>
        <tr><td>Provident Fund (PF)</td><td>${fmtNum(pfDeduction)}</td></tr>
        <tr><td>Other Deductions</td><td>${fmtNum(otherDeduction)}</td></tr>
      </tbody>
      <tfoot><tr class="total-row deduct"><td>Total Deductions</td><td style="color:#dc2626">${fmtNum(rec.deductions)}</td></tr></tfoot>
    </table>
  </div>

  <div class="net-pay">
    <div>
      <div class="net-pay-label">Net Pay (Take Home)</div>
      <div style="font-size:12px;opacity:0.75;margin-top:4px">${rec.month} ${rec.year} — Credited on ${payDate}</div>
    </div>
    <div class="net-pay-amount">${fmtNum(rec.netPay)}</div>
  </div>

  <div class="footer">This is a system-generated payslip and does not require a signature. &nbsp;|&nbsp; HRMSPro &copy; ${new Date().getFullYear()}</div>
</div>
</body>
</html>`;

    // Open in hidden iframe and trigger print
    let iframe = document.getElementById('payslip-print-frame') as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'payslip-print-frame';
      iframe.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:0;height:0;border:none;';
      document.body.appendChild(iframe);
    }
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    setTimeout(() => { iframe!.contentWindow?.focus(); iframe!.contentWindow?.print(); }, 300);
    toast.success(`Payslip for ${rec.month} ${rec.year} sent to print.`);
  }

  // Employee Specific Data
  const myRecords = records.filter(
    (r) =>
      r.employeeId?.employeeId &&
      currentEmployeeId &&
      r.employeeId.employeeId === currentEmployeeId
  );
  const latestMyRecord = myRecords.length > 0 ? myRecords[0] : null;

  const hrSummaryCards = summary
    ? [
        ['Total Payroll', fmt(summary.totalAmount), `${filterMonth} ${filterYear}`, '#2563EB', 'TP'],
        ['Paid', String(summary.paidCount), 'Completed', '#22C55E', 'PD'],
        ['Processing', String(summary.processingCount), 'In progress', '#14B8A6', 'PR'],
        ['Pending', String(summary.pendingCount), 'Needs approval', '#F59E0B', 'RV'],
      ]
    : null;

  const hrColumns = useMemo<DataTableColumn<PayrollRecord>[]>(() => [
    {
      key: 'employee',
      header: 'Employee',
      sortable: true,
      sortValue: (row) => row.employeeId?.name ?? '',
      render: (row) => (
        <div className="flex h-full w-full items-center gap-2.5" onMouseEnter={() => { contextTargetRef.current = row; }}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white dark:bg-slate-800">
            {row.employeeId?.name?.charAt(0) ?? '?'}
          </span>
          <span>
            <span className="block text-sm font-bold text-slate-950 dark:text-white">{row.employeeId?.name ?? '—'}</span>
            <span className="block text-xs text-slate-400">{row.employeeId?.employeeId ?? '—'}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      sortValue: (row) => row.employeeId?.department ?? '',
      render: (row) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}><span className="text-sm text-slate-600 dark:text-slate-400">{row.employeeId?.department ?? '—'}</span></div>,
    },
    {
      key: 'basicPay',
      header: 'Basic Pay',
      sortable: true,
      sortValue: (row) => row.basicPay ?? 0,
      render: (row) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}><span className="text-sm font-bold text-slate-950 dark:text-white">{fmt(row.basicPay)}</span></div>,
    },
    {
      key: 'deductions',
      header: 'Deductions',
      sortable: true,
      sortValue: (row) => row.deductions ?? 0,
      render: (row) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}><span className="text-sm text-red-500 dark:text-red-400">{fmt(row.deductions)}</span></div>,
    },
    {
      key: 'netPay',
      header: 'Net Pay',
      sortable: true,
      sortValue: (row) => row.netPay ?? 0,
      render: (row) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}><span className="text-sm font-bold text-slate-950 dark:text-white">{fmt(row.netPay)}</span></div>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status ?? '',
      render: (row) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}><StatusBadge status={row.status ?? 'Pending'} /></div>,
    },
  ], []);

  const employeeColumns = useMemo<DataTableColumn<PayrollRecord>[]>(() => [
    {
      key: 'month',
      header: 'Month',
      sortable: true,
      sortValue: (row) => `${row.month} ${row.year}`,
      render: (row) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}><span className="text-sm font-bold text-slate-900 dark:text-white">{row.month} {row.year}</span></div>,
    },
    {
      key: 'payDate',
      header: 'Pay Date',
      sortable: true,
      sortValue: (row) => row.processedAt ?? '',
      render: (row) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}><span className="text-sm text-slate-600 dark:text-slate-400">{row.processedAt ? new Date(row.processedAt).toLocaleDateString() : '—'}</span></div>,
    },
    {
      key: 'grossPay',
      header: 'Gross Pay',
      sortable: true,
      sortValue: (row) => row.basicPay ?? 0,
      render: (row) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}><span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{fmt(row.basicPay)}</span></div>,
    },
    {
      key: 'deductions',
      header: 'Deductions',
      sortable: true,
      sortValue: (row) => row.deductions ?? 0,
      render: (row) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}><span className="text-sm text-red-500 dark:text-red-400">{fmt(row.deductions)}</span></div>,
    },
    {
      key: 'netPay',
      header: 'Net Pay',
      sortable: true,
      sortValue: (row) => row.netPay ?? 0,
      render: (row) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}><span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmt(row.netPay)}</span></div>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status ?? '',
      render: (row) => <div className="h-full w-full flex items-center" onMouseEnter={() => { contextTargetRef.current = row; }}><StatusBadge status={row.status ?? 'Pending'} /></div>,
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) => (
        <div className="flex h-full w-full items-center gap-2" onMouseEnter={() => { contextTargetRef.current = row; }}>
          <button 
            type="button" 
            onClick={() => setSelectedRecord(row)}
            className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
          >
            View
          </button>
          <button 
            type="button" 
            onClick={() => handleDownloadPayslip(row)}
            className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
          >
            Download
          </button>
        </div>
      ),
    },
  ], [toast, currentEmployeeId, user]); // Added dependencies to satisfy linter, though handleDownloadPayslip uses them implicitly

  return (
    <DashboardLayout title={isEmployee ? "My Payslips" : "Payroll Management"}>
      {/* Ambient glows for dark mode */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden dark:block">
        <div className="absolute -right-[15%] -top-[10%] h-[55vw] w-[55vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[25%] top-[35%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/5 blur-[100px]" />
      </div>

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {isEmployee ? 'My Payslips' : 'Payroll'}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {isEmployee 
                ? 'View your salary details, deductions, and download payslips.'
                : 'Process payroll, review deductions, and track payout status.'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center justify-between gap-2 w-36 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm outline-none transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                {filterMonth}
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform dark:text-slate-500 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                  <div className="absolute right-0 z-50 mt-2 w-48 max-h-64 overflow-y-auto no-scrollbar rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/50 dark:border-white/10 dark:bg-slate-900 dark:shadow-none">
                    {MONTHS.map((m) => (
                      <button
                        key={m}
                        onClick={() => { setFilterMonth(m); setIsDropdownOpen(false); }}
                        className={`w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                          filterMonth === m
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400'
                            : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
            {!isEmployee && (
              <button
                type="button"
                onClick={() => void handleRunPayroll()}
                disabled={running}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:opacity-90 disabled:opacity-70 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #2563eb)' }}
              >
                {running ? 'Running...' : 'Run Payroll'}
              </button>
            )}
          </div>
        </div>

        {/* HR Messages */}
        {!isEmployee && runMsg && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${runMsg.startsWith('✅') ? 'border-green-200 bg-green-50 text-green-700 dark:border-green-500/20 dark:bg-green-500/10 dark:text-green-400' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-400'}`}>
            {runMsg}
          </div>
        )}

        {error && (
          <ErrorState
            size="sm"
            description={error}
            onRetry={() => void fetchData()}
          />
        )}

        {isEmployee ? (
          /* =========================================
             EMPLOYEE VIEW
             ========================================= */
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                ['Net Salary', fmt(latestMyRecord?.netPay), 'text-emerald-500 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/20', 'This month', 'NS'],
                ['Gross Salary', fmt(latestMyRecord?.basicPay), 'text-blue-500 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/20', 'Before deductions', 'GS'],
                ['Deductions', fmt(latestMyRecord?.deductions), 'text-red-500 bg-red-50 dark:text-red-400 dark:bg-red-500/20', 'Taxes & Benefits', 'DD'],
                ['Last Payment Date', latestMyRecord?.processedAt ? new Date(latestMyRecord.processedAt).toLocaleDateString() : '—', 'text-purple-500 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/20', 'Processed on', 'PD'],
              ].map(([label, value, classes, sub, abbr]) => (
                <div
                  key={String(label)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl dark:hover:border-white/20"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-bold ${classes}`}>
                      {abbr}
                    </span>
                  </div>
                  <p className="text-3xl font-extrabold text-slate-900 dark:text-white">{value}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
                    <p className="text-xs text-slate-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payslip List */}
            <div className="hidden md:block" onContextMenu={(e) => {
              if (!contextTargetRef.current) return;
              handleContextMenu(e, buildPayrollMenuItems(contextTargetRef.current));
            }}>
              <DataTable<PayrollRecord>
                columns={employeeColumns}
                data={myRecords}
                rowKey={(row, i) => row._id ?? i}
                loading={loading}
                searchable={false}
                pageSize={10}
                minWidth={900}
                emptyState={
                  <EmptyState
                    icon={
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    }
                    title="No payslips available yet"
                    description={`Your payslips for ${filterMonth} ${filterYear} will appear here once payroll is processed by your HR team.`}
                  />
                }
              />
            </div>

            {/* Mobile Cards View */}
            <div className="flex flex-col gap-3 md:hidden">
              {myRecords.map((record, i) => (
                <div key={record._id ?? i} className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">{record.month} {record.year}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Processed: {record.processedAt ? new Date(record.processedAt).toLocaleDateString() : '—'}</p>
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs mb-4">
                    <div>
                      <p className="text-slate-400">Gross Pay</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{fmt(record.basicPay)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Deductions</p>
                      <p className="font-semibold text-red-500 dark:text-red-400">{fmt(record.deductions)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Net Pay</p>
                      <p className="font-bold text-slate-900 dark:text-white text-base">{fmt(record.netPay)}</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-white/10">
                    <button
                      type="button"
                      onClick={() => setSelectedRecord(record)}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:bg-[#0B1121] dark:text-slate-300 dark:hover:bg-white/5"
                    >
                      View Payslip
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDownloadPayslip(record)}
                      className="flex items-center gap-2 rounded-lg border border-transparent bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              ))}
              {myRecords.length === 0 && !loading && (
                <div className="rounded-[16px] border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                  <p className="text-sm font-semibold text-slate-500">No payslips available yet.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* =========================================
             HR VIEW
             ========================================= */
          <>
            {/* Summary cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {loading || !hrSummaryCards
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
                : hrSummaryCards.map(([label, value, sub, color, icon]) => (
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl dark:hover:border-white/20">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}18`, color: String(color) }}>{icon}</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
                      <p className="mt-1 text-xs text-slate-400">{sub}</p>
                      <p className="mt-2 text-xs font-bold text-slate-500">{label}</p>
                    </div>
                  ))}
            </div>

            {/* Records table */}
            <div className="hidden md:block" onContextMenu={(e) => {
              if (!contextTargetRef.current) return;
              handleContextMenu(e, buildPayrollMenuItems(contextTargetRef.current));
            }}>
              <DataTable<PayrollRecord>
                columns={hrColumns}
                data={records}
                rowKey={(row, i) => row._id ?? i}
                loading={loading}
                searchable={true}
                searchPlaceholder="Search by name, ID, department or status..."
                getSearchText={(row) =>
                  [
                    row.employeeId?.name,
                    row.employeeId?.employeeId,
                    row.employeeId?.department,
                    row.status,
                  ]
                    .filter(Boolean)
                    .join(' ')
                }
                pageSize={10}
                minWidth={860}
                emptyState={
                  <EmptyState
                    icon={
                      <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    }
                    title={`No payroll records for ${filterMonth} ${filterYear}`}
                    description="Click 'Run Payroll' to generate records."
                  />
                }
              />
            </div>

            {/* Mobile Cards View */}
            <div className="flex flex-col gap-3 md:hidden">
              {records.map((record, i) => (
                <div key={record._id ?? i} className="rounded-[16px] border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white dark:bg-slate-800">
                        {record.employeeId?.name?.charAt(0) ?? '?'}
                      </span>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{record.employeeId?.name ?? '—'}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{record.employeeId?.department ?? '—'}</p>
                      </div>
                    </div>
                    <StatusBadge status={record.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-xs mb-4">
                    <div>
                      <p className="text-slate-400">Basic Pay</p>
                      <p className="font-semibold text-slate-700 dark:text-slate-300">{fmt(record.basicPay)}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Deductions</p>
                      <p className="font-semibold text-red-500 dark:text-red-400">{fmt(record.deductions)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-slate-400">Net Pay</p>
                      <p className="font-bold text-slate-900 dark:text-white text-base">{fmt(record.netPay)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {records.length === 0 && !loading && (
                <div className="rounded-[16px] border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
                  <p className="text-sm font-semibold text-slate-500">No payroll records generated.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <PayslipPreviewModal
        open={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        record={selectedRecord}
        onDownload={handleDownloadPayslip}
      />
      <ContextMenu {...menuProps} />
    </DashboardLayout>
  );
}
