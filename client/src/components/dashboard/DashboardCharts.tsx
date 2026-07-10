import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell,
  PieChart, Pie,
} from 'recharts';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChartDataPoint {
  label: string;
  value: number;
  value2?: number;
}

// ─── Tooltip ─────────────────────────────────────────────────────────────

interface TTPayload { value: number; name?: string; color?: string }
interface TooltipProps { active?: boolean; payload?: TTPayload[]; label?: string; unit?: string }

function ThemedTooltip({ active, payload, label, unit = '' }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.color ?? '#3b82f6' }} />
          {unit}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
        </p>
      ))}
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 dark:bg-white/5 ${className}`} />;
}

function ChartCard({
  title, subtitle, children, loading, delay = 0,
}: {
  title: string; subtitle: string;
  children: React.ReactNode; loading: boolean; delay?: number;
}) {
  const [timescale, setTimescale] = useState('1M');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: 'easeOut' }}
      className="relative flex h-full flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl dark:hover:shadow-2xl"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
        
        {/* Timescale Filters */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-white/10 dark:bg-white/[0.02]">
          {['1W', '1M', '1Y'].map(ts => (
            <button
              key={ts}
              onClick={() => setTimescale(ts)}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                timescale === ts 
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-white/10 dark:text-white' 
                  : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {ts}
            </button>
          ))}
        </div>
      </div>
      {loading ? <Skeleton className="min-h-[220px] flex-1 w-full" /> : <div className="min-h-[220px] flex-1">{children}</div>}
    </motion.div>
  );
}

// ─── Workforce Growth ─────────────────────────────────────────────────────────

export function WorkforceGrowthChart({ data, loading }: { data: Array<[string, number]>; loading: boolean }) {
  const chartData = data.length > 0
    ? data.map(([label, value]) => ({ label, value }))
    : [
        { label: 'Jan', value: 940  },
        { label: 'Feb', value: 980  },
        { label: 'Mar', value: 1020 },
        { label: 'Apr', value: 1080 },
        { label: 'May', value: 1180 },
        { label: 'Jun', value: 1248 },
      ];

  return (
    <ChartCard
      title="Workforce Growth" subtitle="Total active headcount over time"
      loading={loading} delay={0.1}
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="wf-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
          <Tooltip content={<ThemedTooltip unit="" />} cursor={{ stroke: 'rgba(59,130,246,0.2)', strokeWidth: 1 }} />
          <Area type="monotone" dataKey="value" name="Employees"
            stroke="#3b82f6" strokeWidth={3}
            fill="url(#wf-grad)"
            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#ffffff', strokeWidth: 3 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── Department Attendance ────────────────────────────────────────────────────────

export function DepartmentAttendanceChart({ data, loading }: { data: Array<[string, number]>; loading: boolean }) {
  const chartData = data.length > 0
    ? data.map(([label, value]) => ({ label, value }))
    : [
        { label: 'Engineering', value: 96 }, { label: 'Sales', value: 89 },
        { label: 'Marketing', value: 92 }, { label: 'HR', value: 94 },
        { label: 'General', value: 91 }
      ];

  return (
    <ChartCard
      title="Department Attendance" subtitle="Attendance rate by department"
      loading={loading} delay={0.15}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="att-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#d946ef" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
          <XAxis dataKey="label" tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dy={10} />
          <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} axisLine={false} tickLine={false} dx={-10} />
          <Tooltip content={<ThemedTooltip unit="" />} cursor={{ fill: 'rgba(139,92,246,0.1)' }} />
          <Bar dataKey="value" name="Attendance %" fill="url(#att-grad)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

// ─── Leave Distribution ───────────────────────────────────────────────────────

export function LeaveDistributionChart({ data, loading }: { data: Array<[string, number, string]>; loading: boolean }) {
  const chartData = data.length > 0
    ? data.map(([name, value, color]) => ({ name, value, color }))
    : [
        { name: 'Sick Leave',     value: 45, color: '#ef4444' },
        { name: 'Casual',         value: 30, color: '#3b82f6' },
        { name: 'Earned',         value: 15, color: '#10b981' },
        { name: 'Maternity',      value: 10, color: '#8b5cf6' },
      ];

  return (
    <ChartCard
      title="Leave Breakdown" subtitle="Distribution by leave category"
      loading={loading} delay={0.2}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Pie
            data={chartData}
            cx="50%" cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={6}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<ThemedTooltip unit="%" />} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
