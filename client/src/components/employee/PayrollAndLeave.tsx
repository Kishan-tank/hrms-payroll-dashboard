import { useState, useMemo } from 'react';
import { Download, DollarSign, Calendar, TrendingUp, ArrowUpRight, FileText, Shield, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Sector } from 'recharts';
import type { EmployeeSummary } from '../../services/hrmsApi';

const salaryTrend = [
  { month: 'Jan', salary: 82000 },
  { month: 'Feb', salary: 82000 },
  { month: 'Mar', salary: 82000 },
  { month: 'Apr', salary: 89500 },
  { month: 'May', salary: 89500 },
  { month: 'Jun', salary: 95000 },
];

// Fallback data for the trend chart


function SalaryTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white/95 px-3 py-2 backdrop-blur-md shadow-xl dark:border-white/10 dark:bg-[#0F1624]/95">
        <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide dark:text-slate-400">{label}</div>
        <div className="text-[14px] font-bold text-slate-900 flex items-center gap-1 mt-0.5 dark:text-white">
          ₹{(payload[0].value / 1000).toFixed(1)}K
        </div>
      </div>
    );
  }
  return null;
}

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
  return (
    <g>
      <text x={cx} y={cy - 12} textAnchor="middle" fill="currentColor" className="text-[26px] font-extrabold tracking-tight fill-slate-900 dark:fill-white">
        {payload.value}
      </text>
      <text x={cx} y={cy + 8} textAnchor="middle" fill="currentColor" className="text-[11px] font-semibold uppercase tracking-wider fill-slate-500 dark:fill-slate-400">
        Days Used
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 0 10px ${fill}80)` }}
      />
    </g>
  );
};

const AnyPie = Pie as any;

export default function PayrollAndLeave({ summary }: { summary?: EmployeeSummary | null }) {
  const [activeIndex, setActiveIndex] = useState(3); // Default to 'Remaining'

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const leavesTaken = summary?.payrollLeave.leavesTaken || 0;
  const leaveBalance = summary?.payrollLeave.leaveBalance || 0;

  // We map the total leaves taken into some dummy breakdown for the pie chart, but use the real total
  const leaveData = useMemo(() => [
    { name: 'Leaves Taken', value: leavesTaken, color: '#3b82f6' },
    { name: 'Sick Leave', value: 0, color: '#8b5cf6' }, // Phase 2
    { name: 'Casual Leave', value: 0, color: '#06b6d4' }, // Phase 2
    { name: 'Remaining', value: leaveBalance, color: 'rgba(255,255,255,0.06)' },
  ], [leavesTaken, leaveBalance]);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden hover:border-emerald-500/30 transition-colors duration-300 dark:border-white/5 dark:bg-[#0B1121] dark:shadow-xl dark:hover:border-emerald-500/20">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-40 transition-opacity duration-300 hover:opacity-60"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 65%)" }} />

        <div className="flex items-start justify-between z-10">
          <div>
            <h2 className="text-[16px] font-extrabold text-slate-900 tracking-wide dark:text-white">Payroll Insights</h2>
            <p className="mt-0.5 text-[12px] font-semibold uppercase text-slate-500 tracking-wider">June 2026 Cycle</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-slate-50 hover:text-slate-900 hover:border-emerald-500/30 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white">
            <Download size={13} /> Download Payslip
          </button>
        </div>

        <div className="z-10 grid gap-4 sm:grid-cols-2">
          {/* Current Salary */}
          <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm hover:bg-slate-100 transition-colors dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-[0_4px_12px_rgba(16,185,129,0.25)]"
                style={{ background: "linear-gradient(135deg, #10b981, #059669)" }}>
                <DollarSign size={15} className="text-white" />
              </div>
              <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide dark:text-slate-400">Net Salary</span>
            </div>
            <div>
              <div className="text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                ₹{((summary?.payrollLeave.latestNetPay || 0)).toLocaleString()}
              </div>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-500">
                <ArrowUpRight size={12} /> Real-time tracking
              </div>
            </div>
          </div>

          {/* Next Credit */}
          <div className="flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50 p-4 shadow-sm hover:bg-slate-100 transition-colors dark:border-white/5 dark:bg-white/[0.02] dark:hover:bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-[0_4px_12px_rgba(59,130,246,0.25)]"
                style={{ background: "linear-gradient(135deg, #3b82f6, #2563eb)" }}>
                <Calendar size={15} className="text-white" />
              </div>
              <span className="text-[12px] font-semibold text-slate-500 uppercase tracking-wide dark:text-slate-400">Next Credit</span>
            </div>
            <div>
              <div className="text-[26px] font-extrabold tracking-tight text-slate-900 dark:text-white">Jul 1</div>
              <div className="mt-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">13 days remaining</div>
            </div>
          </div>
        </div>

        {/* Enterprise Details Grid */}
        <div className="z-10 grid grid-cols-2 gap-3 mt-1">
          <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-purple-100 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <Shield size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500">Tax Status</span>
              <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">Regime: Old</span>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5 dark:border-white/5 dark:bg-white/[0.02]">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-orange-100 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
              <FileText size={14} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-500">YTD Earnings</span>
              <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">₹5,18,000</span>
            </div>
          </div>
        </div>

        <div className="z-10 mt-1 flex items-end gap-6 border-t border-slate-200 pt-3 dark:border-white/5">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-orange-500" />
              <span className="text-[12px] font-bold text-slate-500 uppercase tracking-wider dark:text-slate-400">Salary Growth Trend</span>
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <BarChart data={salaryTrend} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barSize={12}>
                <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={['dataMin - 10000', 'dataMax + 5000']} />
                <Tooltip content={<SalaryTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)', radius: 4 }} />
                <Bar dataKey="salary" radius={[4, 4, 0, 0]}>
                  {salaryTrend.map((_, index) => (
                    <Cell key={index} fill={index === salaryTrend.length - 1 ? "#10b981" : "rgba(59,130,246,0.3)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* RIGHT: Interactive Leave Analytics */}
      <div className="flex flex-col gap-3 rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden hover:border-purple-500/30 transition-colors duration-300 dark:border-white/5 dark:bg-[#0B1121] dark:shadow-xl dark:hover:border-purple-500/20">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full opacity-40 transition-opacity duration-300 hover:opacity-60"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)" }} />

        <div className="flex items-start justify-between z-10">
          <div>
            <h2 className="text-[16px] font-extrabold text-slate-900 tracking-wide dark:text-white">Leave Analytics</h2>
            <p className="mt-0.5 text-[12px] font-semibold uppercase text-slate-500 tracking-wider">Annual allocation · 36 days</p>
          </div>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500 cursor-help hover:text-slate-700 transition-colors dark:bg-white/5 dark:text-slate-400 dark:hover:text-slate-300">
            <Info size={16} />
          </div>
        </div>

        <div className="z-10 flex flex-1 items-center justify-center gap-6 mt-2">
          <div className="relative shrink-0 w-[150px] h-[150px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <AnyPie
                  data={leaveData.slice(0, 3)}
                  cx="50%"
                  cy="75%"
                  innerRadius={60}
                  outerRadius={75}
                  startAngle={0}
                  endAngle={180}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={0}
                  activeIndex={activeIndex > 2 ? -1 : activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                >
                  {leaveData.slice(0, 3).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} className="transition-all duration-300 hover:opacity-80 cursor-pointer" />
                  ))}
                </AnyPie>
              </PieChart>
            </ResponsiveContainer>
            {/* Fallback center text for when hovering "Remaining" or nothing */}
            {(activeIndex === -1 || activeIndex === 3) && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end pb-8">
                <div className="text-[26px] font-extrabold text-slate-900 tracking-tight dark:text-white">
                  {activeIndex === 3 ? leaveBalance : leaveBalance}
                </div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {activeIndex === 3 ? 'Days Available' : 'Total Used'}
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col justify-center gap-3">
            {leaveData.slice(0, 3).map((item, idx) => (
              <div
                key={item.name}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${activeIndex === idx ? 'bg-slate-100 border border-slate-200 dark:bg-white/10 dark:border-white/5' : 'hover:bg-slate-50 border border-transparent dark:hover:bg-white/5'}`}
                onMouseEnter={() => setActiveIndex(idx)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-2.5 w-2.5 rounded-full" style={{ background: item.color, boxShadow: `0 0 8px ${item.color}80` }} />
                  <span className={`text-[13px] font-semibold ${activeIndex === idx ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{item.name}</span>
                </div>
                <span className={`text-[14px] font-bold ${activeIndex === idx ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-300'}`}>{item.value}d</span>
              </div>
            ))}
            <div className="h-px w-full bg-slate-200 my-1 dark:bg-white/5" />
            <div
              className={`flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${activeIndex === 3 ? 'bg-slate-100 border border-slate-200 dark:bg-white/10 dark:border-white/5' : 'hover:bg-slate-50 border border-transparent dark:hover:bg-white/5'}`}
              onMouseEnter={() => setActiveIndex(3)}
            >
              <div className="flex items-center gap-2.5">
                <div className="h-2.5 w-2.5 rounded-full bg-slate-400 dark:bg-slate-600" />
                <span className={`text-[13px] font-bold ${activeIndex === 3 ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-500'}`}>Remaining</span>
              </div>
              <span className={`text-[14px] font-extrabold ${activeIndex === 3 ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>{leaveBalance}d</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
