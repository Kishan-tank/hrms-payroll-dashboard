import { useEffect, useState } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { reportsService } from '../services/hrmsApi';

function BarChart({ data, color = '#2563EB' }: { data: Array<[string, number]>; color?: string }) {
  const max = Math.max(...data.map(([, v]) => v), 1);
  return (
    <div className="flex h-48 items-end gap-3">
      {data.map(([label, value]) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-xl" style={{ height: `${(value / max) * 150}px`, background: color }} />
          <span className="text-xs font-semibold text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />;
}

export default function ReportsPage() {
  const [headcountData, setHeadcountData] = useState<[string, number][]>([]);
  const [payrollTrend, setPayrollTrend] = useState<[string, number][]>([]);
  const [leaveByType, setLeaveByType] = useState<[string, number, string][]>([]);
  const [deptAttn, setDeptAttn] = useState<[string, number][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [hc, pt, lb, da] = await Promise.allSettled([
        reportsService.getHeadcountTrend(),
        reportsService.getPayrollTrend(),
        reportsService.getLeaveBreakdown(),
        reportsService.getDeptAttendance(),
      ]);
      if (hc.status === 'fulfilled') setHeadcountData(hc.value.trend);
      if (pt.status === 'fulfilled') setPayrollTrend(pt.value.trend);
      if (lb.status === 'fulfilled') setLeaveByType(lb.value.breakdown);
      if (da.status === 'fulfilled') setDeptAttn(da.value.attendance);
      setLoading(false);
    }
    void load();
  }, []);

  // derive top-level stats from fetched data
  const latestHeadcount = headcountData.length > 0 ? headcountData[headcountData.length - 1][1] : 0;
  const latestPayroll = payrollTrend.length > 0 ? payrollTrend[payrollTrend.length - 1][1] : 0;

  const summaryCards = [
    ['Headcount', latestHeadcount > 0 ? String(latestHeadcount) : '—', 'Latest month', '#2563EB'],
    ['Attendance', '94.2%', '+2.1%', '#22C55E'],
    ['Payroll', latestPayroll > 0 ? `₹${latestPayroll}L` : '—', '+8.4%', '#8B5CF6'],
    ['Leave Usage', '62%', '-4.3%', '#F59E0B'],
  ];

  return (
    <DashboardLayout title="Reports">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950">Reports</h1>
            <p className="text-sm text-slate-400">Analytics, trends, and export-ready HR insights.</p>
          </div>
          <button className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700" type="button">Export Report</button>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(([label, value, trend, color]) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}18`, color: String(color) }}>
                {String(label).slice(0, 2).toUpperCase()}
              </span>
              <p className="mt-4 text-2xl font-bold text-slate-950">{loading ? '—' : value}</p>
              <p className="mt-1 text-xs font-bold text-emerald-500">{trend}</p>
              <p className="mt-2 text-xs font-semibold text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950">Headcount Growth</h2>
            {loading ? <Skeleton className="h-48" /> : <BarChart data={headcountData} />}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950">Payroll Trend (₹ Lakhs)</h2>
            {loading ? <Skeleton className="h-48" /> : <BarChart data={payrollTrend} color="#8B5CF6" />}
          </section>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-5 font-bold text-slate-950">Leave By Type</h2>
            {loading ? <Skeleton className="h-32" /> : (
              <div className="space-y-3">
                {leaveByType.map(([name, value, color]) => (
                  <div key={name}>
                    <div className="mb-1 flex justify-between text-sm font-semibold">
                      <span className="text-slate-700">{name}</span>
                      <span className="text-slate-400">{value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full" style={{ width: `${value}%`, background: color }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-5 font-bold text-slate-950">Department Attendance</h2>
            {loading ? <Skeleton className="h-32" /> : (
              <div className="space-y-3">
                {deptAttn.map(([name, value]) => (
                  <div key={name} className="flex items-center gap-4">
                    <span className="w-28 text-sm font-semibold text-slate-600">{name}</span>
                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-blue-600" style={{ width: `${value}%` }} />
                    </div>
                    <span className="w-10 text-right text-sm font-bold text-slate-950">{value}%</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
