import { useState, useEffect } from 'react';
import { useAuthContext } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';
import type { HrSummary } from '../../services/hrmsApi';

function useLiveTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

function getGreeting(hour: number): string {
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function DashboardHero({ summary }: { summary?: HrSummary | null }) {
  const { user } = useAuthContext();
  const rawName = (user?.name ?? 'don').split(' ')[0];
  const firstName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const now = useLiveTime();
  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl lg:p-8">
      {/* Background Dots Pattern */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, var(--tw-gradient-from, currentColor) 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />
      <div className="pointer-events-none absolute inset-0 hidden dark:block opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}
      />
      
      {/* Glow effect top right */}
      <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-600/10 blur-[100px]" />

      <div className="relative z-10 flex flex-col justify-between gap-8 xl:flex-row xl:items-center">
        {/* ── Left: Greeting & Badges ── */}
        <div className="flex flex-col gap-5">
          {/* Date */}
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{dateString}</span>
          </div>

          {/* Titles */}
          <div>
            <h1 className="flex items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {getGreeting(now.getHours())}, {firstName} 
              <Sparkles className="h-8 w-8 text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse" />
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Here's what's happening across your workforce today.
            </p>
          </div>

          {/* Pill Badges */}
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs dark:border-white/10 dark:bg-white/5 hover:scale-105 hover:bg-slate-100 dark:hover:bg-white/10 hover:shadow-md transition-all duration-300 cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
              <span className="font-bold text-slate-900 dark:text-white">{summary?.totalEmployees ?? 1248}</span>
              <span className="text-slate-600 dark:text-slate-400">Active Employees</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs dark:border-white/10 dark:bg-white/5 hover:scale-105 hover:bg-slate-100 dark:hover:bg-white/10 hover:shadow-md transition-all duration-300 cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span className="font-bold text-slate-900 dark:text-white">{summary?.presentToday ?? 1189}</span>
              <span className="text-slate-600 dark:text-slate-400">Present Today</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs dark:border-white/10 dark:bg-white/5 hover:scale-105 hover:bg-slate-100 dark:hover:bg-white/10 hover:shadow-md transition-all duration-300 cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <span className="font-bold text-slate-900 dark:text-white">{summary?.onLeave ?? 34}</span>
              <span className="text-slate-600 dark:text-slate-400">On Leave</span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs dark:border-white/10 dark:bg-white/5 hover:scale-105 hover:bg-slate-100 dark:hover:bg-white/10 hover:shadow-md transition-all duration-300 cursor-pointer">
              <span className="h-2 w-2 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
              <span className="font-bold text-slate-900 dark:text-white">{summary?.remoteCount ?? 25}</span>
              <span className="text-slate-600 dark:text-slate-400">Remote</span>
            </div>
          </div>
        </div>

        {/* ── Right: Workforce Health ── */}
        <div className="group flex items-center gap-6 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 backdrop-blur-md dark:border-white/5 dark:bg-white/[0.02] hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-300 cursor-pointer">
          {/* Circular Gauge */}
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-sm dark:bg-[#0F1629] dark:shadow-inner group-hover:scale-105 transition-transform duration-500">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" className="fill-none stroke-slate-100 stroke-[8] dark:stroke-white/5" />
              <circle
                cx="50"
                cy="50"
                r="40"
                className="fill-none stroke-blue-600 stroke-[8] dark:stroke-blue-500 transition-all duration-1000"
                strokeLinecap="round"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - (summary?.workforceHealth ?? 98) / 100)}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-bold leading-none text-slate-900 dark:text-white">{summary?.workforceHealth ?? 98}</span>
              <span className="text-[10px] font-bold text-slate-500">/100</span>
            </div>
          </div>

          {/* Health Stats */}
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Workforce Health</span>
            <span className="text-xl font-bold text-slate-900 dark:text-white">Excellent</span>
            <span className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">Score: {summary?.workforceHealth ?? 98} / 100</span>
            <span className="mt-1 flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
              </svg>
              +5 vs last quarter
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
