import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface PayrollTrendChartProps {
  loading: boolean;
}

// Static payroll data (₹ in millions)
const PAYROLL_DATA = [
  { month: 'Mar', value: 3.8 },
  { month: 'Apr', value: 4.2 },
  { month: 'May', value: 4.5 },
  { month: 'Jun', value: 4.3 },
  { month: 'Jul', value: 4.7 },
  { month: 'Aug', value: 5.1 },
];

function ThemedTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-slate-900/95 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">{label}</p>
      <p className="flex items-center gap-2 font-extrabold text-slate-900 dark:text-white">
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        ₹{payload[0].value.toLocaleString()}M
      </p>
    </div>
  );
}

function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-xl bg-slate-100 dark:bg-white/5 ${className}`} />;
}

export default function PayrollTrendChart({ loading }: PayrollTrendChartProps) {
  const [timescale, setTimescale] = useState('1M');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md dark:border-white/10 dark:bg-white/[0.03]"
    >
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Payroll Trend</h3>
          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">Monthly payroll in millions (₹)</p>
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

      {loading ? (
        <Skeleton className="h-[220px] w-full" />
      ) : (
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={PAYROLL_DATA}
              margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
              barCategoryGap="30%"
            >
              <defs>
                <linearGradient id="payroll-bar-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#10b981" stopOpacity={1} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-slate-200 dark:text-white/5" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                dx={-10}
              />
              <Tooltip content={<ThemedTooltip />} cursor={{ fill: 'currentColor' }} wrapperClassName="text-slate-100 dark:text-white/5" />
              <Bar dataKey="value" fill="url(#payroll-bar-gradient)" radius={[6, 6, 0, 0]}>
                {PAYROLL_DATA.map((_, index) => (
                  <Cell key={`cell-${index}`} fill="url(#payroll-bar-gradient)" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
