import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { dashboardService, reportsService } from '../services/hrmsApi';
import type { HrSummary, Activity } from '../services/hrmsApi';

function Bars({ data, color = '#2563EB' }: { data: Array<[string, number]>; color?: string }) {
  const max = Math.max(...data.map(([, v]) => v), 1);
  return (
    <div className="flex h-44 items-end gap-3">
      {data.map(([label, value]) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-2">
          <div className="w-full rounded-t-xl" style={{ height: `${(value / max) * 140}px`, background: color }} />
          <span className="text-xs font-bold text-slate-400">{label}</span>
        </div>
      ))}
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />;
}

export default function HRDashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState<HrSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [headcountTrend, setHeadcountTrend] = useState<[string, number][]>([]);
  const [deptAttendance, setDeptAttendance] = useState<[string, number][]>([]);
  const [pieData, setPieData] = useState<[string, number, string][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [sumRes, actRes, hcRes, deptAttnRes, leaveRes] = await Promise.allSettled([
          dashboardService.getHrSummary(),
          dashboardService.getRecentActivity(),
          reportsService.getHeadcountTrend(),
          reportsService.getDeptAttendance(),
          reportsService.getLeaveBreakdown(),
        ]);

        if (sumRes.status === 'fulfilled') setSummary(sumRes.value.summary);
        if (actRes.status === 'fulfilled') setActivities(actRes.value.activities);
        if (hcRes.status === 'fulfilled') setHeadcountTrend(hcRes.value.trend);
        if (deptAttnRes.status === 'fulfilled') setDeptAttendance(deptAttnRes.value.attendance);
        if (leaveRes.status === 'fulfilled') setPieData(leaveRes.value.breakdown);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const cards = summary
    ? [
        ['Total Employees', String(summary.totalEmployees), '+12 this month', '#2563EB', 'EM'],
        ['Attendance Rate', summary.attendanceRate, '+2.1%', '#22C55E', 'AT'],
        ['Payroll Status', summary.payrollStatus, 'June cycle', '#8B5CF6', 'PR'],
        ['Pending Approvals', String(summary.pendingApprovals), 'Needs review', '#F59E0B', 'PA'],
      ]
    : null;

  return (
    <DashboardLayout title="HR Dashboard">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-950">HR Dashboard</h1>
            <p className="text-sm text-slate-400">Workforce, attendance, payroll, and approval overview.</p>
          </div>
          <button type="button" onClick={() => navigate('/employees')} className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700">
            Add Employee
          </button>
        </div>

        {/* Summary cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {loading || !cards
            ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)
            : cards.map(([label, value, trend, color, icon]) => (
                <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold" style={{ background: `${color}18`, color: String(color) }}>{icon}</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-950">{value}</p>
                  <p className="mt-1 text-xs font-bold text-emerald-500">{trend}</p>
                  <p className="mt-2 text-xs font-bold text-slate-500">{label}</p>
                </div>
              ))}
        </div>

        {/* Charts row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Headcount Growth</h2>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">6 months</span>
            </div>
            {loading ? <Skeleton className="h-44" /> : <Bars data={headcountTrend} />}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950">Leave By Type</h2>
            {loading
              ? <Skeleton className="h-44" />
              : (
                <div className="space-y-3">
                  {pieData.map(([name, value, color]) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                        <span className="font-semibold text-slate-600">{name}</span>
                      </div>
                      <span className="font-bold text-slate-950">{value}%</span>
                    </div>
                  ))}
                </div>
              )}
          </section>
        </div>

        {/* Bottom row */}
        <div className="grid gap-4 lg:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-5 font-bold text-slate-950">Department Attendance</h2>
            {loading
              ? <Skeleton className="h-32" />
              : (
                <div className="space-y-3">
                  {deptAttendance.map(([name, value]) => (
                    <div key={name} className="flex items-center gap-3">
                      <span className="w-24 text-xs font-bold text-slate-500">{name}</span>
                      <div className="h-2 flex-1 rounded-full bg-slate-100">
                        <div className="h-2 rounded-full bg-blue-600" style={{ width: `${value}%` }} />
                      </div>
                      <span className="w-8 text-right text-xs font-bold text-slate-950">{value}%</span>
                    </div>
                  ))}
                </div>
              )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-slate-950">Recent Activity</h2>
            {loading
              ? <Skeleton className="h-32" />
              : (
                <div className="space-y-3">
                  {activities.map((act) => (
                    <div key={`${act.action}-${act.name}`} className="flex items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{act.name.charAt(0)}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-slate-950">{act.action}</span>
                        <span className="block truncate text-xs text-slate-400">{act.name} - {act.dept}</span>
                      </span>
                      <span className="text-xs text-slate-400">{act.time}</span>
                    </div>
                  ))}
                </div>
              )}
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-bold text-slate-950">Quick Links</h2>
            </div>
            <div className="space-y-2">
              {[
                ['Manage Employees', '/employees', '#2563EB'],
                ['View Payroll', '/payroll', '#8B5CF6'],
                ['Reports & Analytics', '/reports', '#22C55E'],
                ['Settings', '/settings', '#F59E0B'],
              ].map(([label, path, color]) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:border-slate-200 hover:bg-white transition"
                >
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
                  {label}
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
