import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { payrollService } from '../services/hrmsApi';
import type { PayrollRecord, PayrollSummary } from '../services/hrmsApi';
import { useAuthContext } from '../context/AuthContext';

const statusClass: Record<string, string> = {
  Paid: 'bg-blue-50 text-blue-600',
  Processing: 'bg-teal-50 text-teal-600',
  Pending: 'bg-amber-50 text-amber-600',
};

const darkStatusClass: Record<string, string> = {
  Paid: 'dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30 border',
  Processing: 'dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500/30 border',
  Pending: 'dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30 border',
};

const statusDot: Record<string, string> = {
  Paid: 'bg-blue-500 dark:bg-blue-400',
  Processing: 'bg-teal-500 dark:bg-teal-400',
  Pending: 'bg-amber-500 dark:bg-amber-400',
};

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
  const isEmployee = user?.role === 'employee';

  const [records, setRecords] = useState<PayrollRecord[]>([]);
  const [summary, setSummary] = useState<PayrollSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [runMsg, setRunMsg] = useState<string | null>(null);

  const [filterMonth, setFilterMonth] = useState(CURRENT_MONTH);
  const [filterYear] = useState(CURRENT_YEAR);

  async function fetchData() {
    setLoading(true);
    setError(null);
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
            <select 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value)} 
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 dark:border-white/10 dark:bg-[#111827] dark:text-white"
            >
              {MONTHS.map((m) => <option className="bg-white dark:bg-[#111827] text-slate-900 dark:text-white" key={m}>{m}</option>)}
            </select>
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
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${runMsg.startsWith('✅') ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {runMsg}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
            ⚠ {error} <button className="font-bold underline ml-2" onClick={() => void fetchData()}>Retry</button>
          </div>
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
            {myRecords.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 px-6 text-center shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-white/5">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">No payslips available yet</h3>
                <p className="mb-6 max-w-sm text-sm text-slate-500 dark:text-slate-400">
                  Your payslips for {filterMonth} {filterYear} will appear here once payroll is processed by HR.
                </p>
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-50 dark:border-white/10 dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/5"
                >
                  Contact HR
                </button>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
                  <h2 className="font-bold text-slate-950 dark:text-white">Payslips</h2>
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                    {myRecords.length} records
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/[0.02]">
                        {['Month', 'Pay Date', 'Gross Pay', 'Deductions', 'Net Pay', 'Status', 'Action'].map((col) => (
                          <th key={col} className="px-5 py-4 text-left text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan={7} className="px-5 py-10 text-center text-sm text-slate-500">Loading payslips...</td></tr>
                      ) : (
                        myRecords.map((rec, index) => (
                          <tr key={rec._id} className={`transition-colors duration-150 hover:bg-slate-50 dark:hover:bg-white/[0.03] ${index < myRecords.length - 1 ? 'border-b border-slate-100 dark:border-white/5' : ''}`}>
                            <td className="px-5 py-4 text-sm font-bold text-slate-900 dark:text-white">{rec.month} {rec.year}</td>
                            <td className="px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
                              {rec.processedAt ? new Date(rec.processedAt).toLocaleDateString() : '—'}
                            </td>
                            <td className="px-5 py-4 text-sm font-semibold text-slate-700 dark:text-slate-300">{fmt(rec.basicPay)}</td>
                            <td className="px-5 py-4 text-sm text-red-500 dark:text-red-400">{fmt(rec.deductions)}</td>
                            <td className="px-5 py-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">{fmt(rec.netPay)}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[rec.status] || ''} ${darkStatusClass[rec.status] || ''}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${statusDot[rec.status] || 'bg-slate-400'}`} />
                                {rec.status}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex gap-2">
                                <button type="button" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10">
                                  View
                                </button>
                                <button 
                                  type="button" 
                                  onClick={() => alert('PDF generation coming soon')}
                                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                                >
                                  Download
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
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
                    <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center justify-between">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}18`, color: String(color) }}>{icon}</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-950">{value}</p>
                      <p className="mt-1 text-xs text-slate-400">{sub}</p>
                      <p className="mt-2 text-xs font-bold text-slate-500">{label}</p>
                    </div>
                  ))}
            </div>

            {/* Records table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <h2 className="font-bold text-slate-950">{filterMonth} {filterYear} Payroll</h2>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">{records.length} records</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[860px]">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {['Employee', 'Department', 'Basic Pay', 'Deductions', 'Net Pay', 'Status'].map((col) => (
                        <th key={col} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-400">{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">Loading payroll records...</td></tr>
                    ) : records.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-slate-400">
                        No payroll records for {filterMonth} {filterYear}. Click "Run Payroll" to generate.
                      </td></tr>
                    ) : records.map((rec) => (
                      <tr key={rec._id} className="border-b border-slate-100 hover:bg-slate-50 last:border-0">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-bold text-white">
                              {rec.employeeId?.name?.charAt(0) ?? '?'}
                            </span>
                            <span>
                              <span className="block text-sm font-bold text-slate-950">{rec.employeeId?.name ?? '—'}</span>
                              <span className="block text-xs text-slate-400">{rec.employeeId?.employeeId ?? '—'}</span>
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">{rec.employeeId?.department ?? '—'}</td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-950">{fmt(rec.basicPay)}</td>
                        <td className="px-4 py-3 text-sm text-red-500">{fmt(rec.deductions)}</td>
                        <td className="px-4 py-3 text-sm font-bold text-slate-950">{fmt(rec.netPay)}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusClass[rec.status] ?? 'bg-slate-100 text-slate-500'}`}>{rec.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
