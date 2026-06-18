import React, { useState, useEffect } from 'react';
import { TrendingUp, BarChart2, Medal, Info } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, YAxis } from 'recharts';

const trendData = [
  { val: 60 }, { val: 65 }, { val: 75 }, { val: 72 }, { val: 85 }, { val: 92 }, { val: 92 }
];

function CircularProgress({ value, size = 120, strokeWidth = 8, color }: { value: number; size?: number; strokeWidth?: number; color: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  
  const [currentOffset, setCurrentOffset] = useState(circumference);
  
  useEffect(() => {
    const timer = setTimeout(() => setCurrentOffset(offset), 100);
    return () => clearTimeout(timer);
  }, [offset]);

  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        className="stroke-slate-200 dark:stroke-white/10"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={currentOffset}
        style={{ filter: `drop-shadow(0 0 8px ${color}80)`, transition: "stroke-dashoffset 1.5s ease-out" }}
      />
    </svg>
  );
}

function Tooltip({ content, children }: { content: string, children: React.ReactNode }) {
  return (
    <div className="group/tt relative inline-flex items-center">
      {children}
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 opacity-0 shadow-lg border border-slate-100 transition-opacity group-hover/tt:opacity-100 dark:bg-slate-800 dark:text-white dark:border-none">
        {content}
        <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-white dark:border-t-slate-800" />
      </div>
    </div>
  );
}

function ProgressBar({ label, value, color, status, tooltip }: { label: string; value: number; color: string; status?: string; tooltip?: string }) {
  const [width, setWidth] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setWidth(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 dark:text-slate-300">
          {label}
          {tooltip && (
            <Tooltip content={tooltip}>
              <Info size={14} className="text-slate-400 hover:text-slate-600 cursor-help transition-colors dark:text-slate-500 dark:hover:text-slate-300" />
            </Tooltip>
          )}
        </div>
        <div className="flex items-center gap-2">
          {status && <span className={`text-[11px] font-bold ${color.includes('f59e0b') ? 'text-amber-600 dark:text-amber-500' : 'text-emerald-600 dark:text-emerald-500'}`}>{status}</span>}
          <span className="text-[14px] font-bold text-slate-900 dark:text-white">{value}%</span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner dark:bg-slate-800/50">
        <div
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${width}%`, background: `linear-gradient(90deg, ${color}60 0%, ${color} 100%)`, boxShadow: `0 0 10px ${color}60` }}
        />
      </div>
    </div>
  );
}

export default function ProductivityOverview() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {/* LEFT: Productivity Score */}
      <div className="relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-blue-500/30 transition-colors duration-300 dark:border-white/5 dark:bg-[#0B1121] dark:shadow-xl dark:hover:border-blue-500/20">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full opacity-40 transition-opacity duration-300 group-hover:opacity-60"
             style={{ background: "radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 65%)" }} />
             
        <div className="relative z-10 mb-6 flex items-center justify-between">
          <h2 className="text-[16px] font-extrabold text-slate-900 tracking-wide dark:text-white">Productivity Score</h2>
          <Tooltip content="Trend compared to previous week">
            <span className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-600 shadow-sm cursor-help dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
              <TrendingUp size={12} /> +12% Weekly
            </span>
          </Tooltip>
        </div>

        <div className="relative z-10 flex flex-1 items-center gap-8">
          <div className="relative shrink-0">
            <CircularProgress value={92} color="#3b82f6" />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="flex items-baseline text-[36px] font-extrabold tracking-tight text-slate-900 drop-shadow-md dark:text-white">
                92<span className="ml-0.5 text-[18px] font-bold text-blue-600 dark:text-blue-400">%</span>
              </span>
              <span className="mt-[-4px] text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Score</span>
            </div>
          </div>

          <div className="flex flex-1 flex-col justify-center gap-4">
            {/* New Rank & Comparison */}
            <div className="flex items-center gap-3">
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 p-3 shadow-sm dark:border-blue-500/20 dark:bg-blue-500/5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shadow-[0_0_12px_rgba(59,130,246,0.15)] dark:bg-blue-500/20 dark:text-blue-400 dark:shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                  <Medal size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[12px] font-bold text-blue-900 dark:text-blue-100">Top 10% Rank</span>
                  <span className="text-[10px] text-blue-700 dark:text-blue-300/70">Engineering Team</span>
                </div>
              </div>
              
              <div className="flex flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/5 dark:bg-white/[0.02]">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Team Average</span>
                  <span className="text-[14px] font-extrabold text-slate-700 dark:text-slate-300">84%</span>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 mt-1 shadow-sm dark:border-white/5 dark:bg-white/[0.02]">
              <div className="relative z-10 flex flex-col pointer-events-none">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Last Month</span>
                <span className="text-[15px] font-bold text-slate-700 dark:text-slate-300">87%</span>
              </div>
              <div className="relative z-10 h-6 w-px bg-slate-200 pointer-events-none dark:bg-white/10" />
              <div className="relative z-10 flex flex-col items-end pointer-events-none">
                <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider dark:text-blue-400">Current</span>
                <span className="text-[15px] font-bold text-slate-900 flex items-center gap-1 dark:text-white">
                  92% <TrendingUp size={14} className="text-emerald-500" />
                </span>
              </div>

              {/* Mini trend chart inside the small box */}
              <div className="absolute bottom-0 left-0 right-0 z-0 h-full w-full opacity-40 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData}>
                    <defs>
                      <linearGradient id="prodTrendGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                    <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={2.5} fill="url(#prodTrendGrad)" isAnimationActive={true} animationDuration={1500} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT: Work Performance Summary */}
      <div className="relative flex flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:border-purple-500/30 transition-colors duration-300 dark:border-white/5 dark:bg-[#0B1121] dark:shadow-xl dark:hover:border-purple-500/20">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-40 transition-opacity duration-300 group-hover:opacity-60"
             style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 65%)" }} />

        <div className="relative z-10 mb-4 flex items-center justify-between">
          <h2 className="text-[16px] font-extrabold text-slate-900 tracking-wide dark:text-white">Work Performance Summary</h2>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-purple-100 bg-purple-50 text-purple-600 shadow-sm dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400">
            <BarChart2 size={16} />
          </div>
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-between gap-2">
          <ProgressBar 
            label="Attendance Consistency" 
            value={98} 
            color="#10b981" 
            status="Excellent"
            tooltip="Based on on-time check-ins over the last 90 days"
          />
          <ProgressBar 
            label="Completed Tasks" 
            value={85} 
            color="#3b82f6" 
            status="Good"
            tooltip="Ratio of tasks completed on time"
          />
          <ProgressBar 
            label="Training Progress" 
            value={65} 
            color="#8b5cf6" 
            status="On Track"
            tooltip="Completion rate of assigned learning modules"
          />
          <ProgressBar 
            label="Project Contribution" 
            value={88} 
            color="#f59e0b" 
            status="High"
            tooltip="Peer reviews and code commits impact"
          />
        </div>
      </div>
    </div>
  );
}
