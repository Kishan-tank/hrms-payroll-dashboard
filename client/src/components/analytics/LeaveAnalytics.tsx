import { useMemo } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockApprovalRateTrend } from './mockData';
import type { ApiLeave } from '../../services/hrmsApi';

interface LeaveAnalyticsProps {
  leaveRecords: ApiLeave[];
  leaveByType: any[]; // Existing data from reportsService.getLeaveBreakdown()
  loading: boolean;
  CustomTooltip: any;
}

export default function LeaveAnalytics({ leaveRecords, leaveByType, loading, CustomTooltip }: LeaveAnalyticsProps) {

  // Compute Leave Trend (Monthly)
  const leaveTrend = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trendData: Record<string, number> = {};
    
    // Initialize current year months
    const currentMonth = new Date().getMonth();
    for (let i = Math.max(0, currentMonth - 5); i <= currentMonth; i++) {
      trendData[months[i]] = 0;
    }

    leaveRecords.forEach(r => {
      const d = new Date(r.fromDate);
      const mName = months[d.getMonth()];
      if (trendData[mName] !== undefined) {
        trendData[mName]++;
      }
    });

    return Object.entries(trendData).map(([name, count]) => ({ name, count }));
  }, [leaveRecords]);

  // Compute Department Leave Usage
  const deptLeave = useMemo(() => {
    const counts: Record<string, number> = {};
    leaveRecords.forEach(r => {
      const dept = r.employeeId?.department || 'Unknown';
      counts[dept] = (counts[dept] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [leaveRecords]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leave Type Distribution */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Type Distribution</h2>
          {loading ? <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leaveByType}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={100}
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

        {/* Leave Trend */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Leave Trend</h2>
          {loading ? <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={leaveTrend}>
                  <defs>
                    <linearGradient id="colorLv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Leaves Taken" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorLv)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Department Leave Usage */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Department Usage</h2>
          {loading ? <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptLeave} layout="vertical" margin={{ left: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                  <Bar dataKey="count" name="Leaves" fill="#06b6d4" radius={[0, 4, 4, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Approval Rate Trend (Mock Data) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">Approval Rate</h2>
            <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-400 ring-1 ring-inset ring-white/10">MOCK</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockApprovalRateTrend}>
                <defs>
                  <linearGradient id="colorApp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="approvalRate" name="Approval %" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorApp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
