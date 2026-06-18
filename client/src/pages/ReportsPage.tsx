import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import { reportsService } from '../services/hrmsApi';
import { ChartSkeleton } from '../components/common/Skeletons';

// Custom Tooltip for Recharts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/95">
        <p className="mb-2 text-xs font-bold text-slate-500 dark:text-slate-400">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
            <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
            {p.name}: {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ReportsPage() {
  const [headcountData, setHeadcountData] = useState<any[]>([]);
  const [payrollTrend, setPayrollTrend] = useState<any[]>([]);
  const [leaveByType, setLeaveByType] = useState<any[]>([]);
  const [deptAttn, setDeptAttn] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [dateRange, setDateRange] = useState('Last 6 Months');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [hc, pt, lb, da] = await Promise.allSettled([
        reportsService.getHeadcountTrend(),
        reportsService.getPayrollTrend(),
        reportsService.getLeaveBreakdown(),
        reportsService.getDeptAttendance(),
      ]);
      
      if (hc.status === 'fulfilled') {
        setHeadcountData(hc.value.trend.map(([name, headcount]) => ({ name, headcount })));
      }
      if (pt.status === 'fulfilled') {
        setPayrollTrend(pt.value.trend.map(([name, amount]) => ({ name, amount })));
      }
      if (lb.status === 'fulfilled') {
        setLeaveByType(lb.value.breakdown.map(([name, value, color]) => ({ name, value, color })));
      }
      if (da.status === 'fulfilled') {
        setDeptAttn(da.value.attendance.map(([name, attendance]) => ({ name, attendance })));
      }
      
      setLoading(false);
    }
    void load();
  }, []);

  const latestHeadcount = headcountData.length > 0 ? headcountData[headcountData.length - 1].headcount : 0;
  const latestPayroll = payrollTrend.length > 0 ? payrollTrend[payrollTrend.length - 1].amount : 0;

  const summaryCards = [
    ['Total Headcount', latestHeadcount > 0 ? String(latestHeadcount) : '—', '+12%', 'text-blue-500', 'bg-blue-50 dark:bg-blue-500/10'],
    ['Avg Attendance', '94.2%', '+2.1%', 'text-emerald-500', 'bg-emerald-50 dark:bg-emerald-500/10'],
    ['Total Payroll', latestPayroll > 0 ? `₹${latestPayroll}L` : '—', '+8.4%', 'text-purple-500', 'bg-purple-50 dark:bg-purple-500/10'],
    ['Leave Rate', '6.2%', '-1.3%', 'text-amber-500', 'bg-amber-50 dark:bg-amber-500/10'],
  ];

  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="space-y-6 pb-12">
        {/* Header & Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reports Center</h1>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">Comprehensive analytics, trends, and organizational insights.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Picker Placeholder */}
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-white/10 dark:bg-slate-900">
              <span className="text-slate-400">📅</span>
              <select 
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-700 outline-none dark:text-slate-200"
              >
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
                <option>Year to Date</option>
                <option>All Time</option>
              </select>
            </div>
            
            {/* Exports */}
            <div className="flex items-center gap-2">
              <button className="flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-300 dark:hover:bg-white/10">
                <span>📄</span> CSV
              </button>
              <button className="flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-md transition hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                <span>⬇️</span> Export PDF
              </button>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(([label, value, trend, colorText, colorBg]) => (
            <div key={label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
              <div className="flex items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorBg} ${colorText} text-xl`}>
                  {label.slice(0, 2).toUpperCase()}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${trend.startsWith('+') ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}>
                  {trend}
                </span>
              </div>
              <p className="mt-6 text-3xl font-extrabold text-slate-900 dark:text-white">{loading ? '—' : value}</p>
              <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>

        {/* Main Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Headcount Trend (Area Chart) */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Headcount Growth</h2>
            {loading ? <ChartSkeleton /> : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={headcountData}>
                    <defs>
                      <linearGradient id="colorHc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="headcount" name="Headcount" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorHc)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Payroll Trend (Bar Chart) */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Payroll Expenditure (₹ Lakhs)</h2>
            {loading ? <ChartSkeleton /> : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={payrollTrend} maxBarSize={40}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                    <Bar dataKey="amount" name="Payroll" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </div>

        {/* Secondary Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Department Attendance (Horizontal Bar) */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Department Attendance Rate</h2>
            {loading ? <ChartSkeleton /> : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={deptAttn} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                    <XAxis type="number" domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dx={-10} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                    <Bar dataKey="attendance" name="Attendance %" fill="#10B981" radius={[0, 6, 6, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Leave Breakdown (Pie Chart) */}
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
            <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Leave Type Breakdown</h2>
            {loading ? <ChartSkeleton /> : (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={leaveByType}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {leaveByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
}
