import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { mockSalaryDistribution, mockDepartmentPayrollCost, mockCompensationBreakdown } from './mockData';

interface PayrollAnalyticsProps {
  payrollTrend: any[]; // Existing data from reportsService.getPayrollTrend()
  loading: boolean;
  CustomTooltip: any;
}

export default function PayrollAnalytics({ payrollTrend, loading, CustomTooltip }: PayrollAnalyticsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Payroll Trend (Real Data) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <h2 className="mb-6 text-sm font-extrabold uppercase tracking-widest text-slate-400">Payroll Trend (₹ Lakhs)</h2>
          {loading ? <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/50" /> : (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={payrollTrend} maxBarSize={40}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                  <Bar dataKey="amount" name="Payroll" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        {/* Department Payroll Cost (Mock Data) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">Department Cost</h2>
            <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-400 ring-1 ring-inset ring-white/10">MOCK</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockDepartmentPayrollCost} layout="vertical" margin={{ left: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(val: any) => `₹${val/100000}L`} />
                <YAxis dataKey="department" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} formatter={(value: any) => `₹${value.toLocaleString()}`} />
                <Bar dataKey="cost" name="Cost" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Salary Distribution (Mock Data) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">Salary Distribution</h2>
            <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-400 ring-1 ring-inset ring-white/10">MOCK</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockSalaryDistribution} margin={{ bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
                <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} />
                <Bar dataKey="count" name="Employees" fill="#10b981" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Compensation Breakdown (Mock Data) */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121]">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-400">Comp Breakdown</h2>
            <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold text-slate-400 ring-1 ring-inset ring-white/10">MOCK</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockCompensationBreakdown}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {mockCompensationBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} formatter={(val: any) => `${val}%`} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
