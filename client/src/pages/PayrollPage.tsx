import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { payrollService } from '../services/hrmsApi';
import type { PayrollRecord, PayrollSummary } from '../services/hrmsApi';

const statusClass: Record<string, string> = {
  Paid: 'bg-blue-50 text-blue-600',
  Processing: 'bg-teal-50 text-teal-600',
  Pending: 'bg-amber-50 text-amber-600',
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const CURRENT_MONTH = MONTHS[new Date().getMonth()];
const CURRENT_YEAR = new Date().getFullYear();

function fmt(n: number) {
  return `₹${n.toLocaleString('en-IN')}`;
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />;
}

export default function PayrollPage() {
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

  const summaryCards = summary
    ? [
        ['Total Payroll', fmt(summary.totalAmount), `${filterMonth} ${filterYear}`, '#2563EB', 'TP'],
        ['Paid', String(summary.paidCount), 'Completed', '#22C55E', 'PD'],
        ['Processing', String(summary.processingCount), 'In progress', '#14B8A6', 'PR'],
        ['Pending', String(summary.pendingCount), 'Needs approval', '#F59E0B', 'RV'],
      ]
    : null;

  return (
    <DashboardLayout title="Payroll">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950">Payroll</h1>
            <p className="text-sm text-slate-400">Process payroll, review deductions, and track payout status.</p>
          </div>
          <div className="flex items-center gap-3">
            <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none">
              {MONTHS.map((m) => <option key={m}>{m}</option>)}
            </select>
            <button
              type="button"
              onClick={() => void handleRunPayroll()}
              disabled={running}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-70"
            >
              {running ? 'Running...' : 'Run Payroll'}
            </button>
          </div>
        </div>

        {/* Run message */}
        {runMsg && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-medium ${runMsg.startsWith('✅') ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {runMsg}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            ⚠ {error} <button className="font-bold underline ml-2" onClick={() => void fetchData()}>Retry</button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading || !summaryCards
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
            : summaryCards.map(([label, value, sub, color, icon]) => (
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
      </div>
    </DashboardLayout>
  );
}
