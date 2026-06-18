import { motion } from 'framer-motion';
import type { Activity } from '../../services/hrmsApi';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ActivityItem {
  id: string;
  action: string;
  name: string;
  dept: string;
  time: string;
}

// ─── Event config helper ──────────────────────────────────────────────────────

function getEventConfig(action: string): {
  accent: string; dimBg: string; dot: string; icon: React.ReactNode;
} {
  const lower = action.toLowerCase();

  if (lower.includes('employee') || lower.includes('added') || lower.includes('joined')) return {
    accent: '#3b82f6', dimBg: 'rgba(59,130,246,0.12)', dot: 'bg-blue-500',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="#3b82f6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8v6M22 11h-6" />
      </svg>
    ),
  };
  if (lower.includes('leave') || lower.includes('approved')) return {
    accent: '#22c55e', dimBg: 'rgba(34,197,94,0.12)', dot: 'bg-emerald-500',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="#22c55e" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="16" rx="2" strokeWidth={1.8} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 3v4M8 3v4M3 11h18M9 16l2 2 4-4" />
      </svg>
    ),
  };
  if (lower.includes('payroll') || lower.includes('salary') || lower.includes('paid')) return {
    accent: '#8b5cf6', dimBg: 'rgba(139,92,246,0.12)', dot: 'bg-violet-500',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="#8b5cf6" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M6 3h12M6 8h12M6 13h8.5a3.5 3.5 0 1 0 0-7H6v15" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m14.5 13-8.5 8" />
      </svg>
    ),
  };
  if (lower.includes('attendance') || lower.includes('absent') || lower.includes('alert')) return {
    accent: '#f59e0b', dimBg: 'rgba(245,158,11,0.12)', dot: 'bg-amber-500',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="#f59e0b" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 7v5l3 2" />
      </svg>
    ),
  };
  if (lower.includes('policy') || lower.includes('update') || lower.includes('published')) return {
    accent: '#ec4899', dimBg: 'rgba(236,72,153,0.12)', dot: 'bg-pink-500',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="#ec4899" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z" />
      </svg>
    ),
  };

  return {
    accent: '#6b7280', dimBg: 'rgba(107,114,128,0.12)', dot: 'bg-slate-500',
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="#6b7280" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4M12 16h.01" />
      </svg>
    ),
  };
}

// ─── Static fallback data ─────────────────────────────────────────────────────

const FALLBACK: Activity[] = [
  { action: 'New employee added',   name: 'Priya Sharma',     dept: 'joined as Product Designer', time: '12m ago' },
  { action: 'Leave approved',       name: 'Marcus Lee',       dept: 'Annual leave — 4 days',       time: '48m ago' },
  { action: 'Payroll processed',    name: 'August cycle',     dept: '1,284 employees paid',        time: '2h ago'  },
  { action: 'Attendance alert',     name: 'Support Team',     dept: 'Late check-ins above threshold', time: '5h ago' },
  { action: 'Policy updated',       name: 'Remote work v3.2', dept: 'Published company-wide',     time: '1d ago'  },
];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function DarkSkeleton({ className = '' }: { className?: string }) {
  return <div className={`dark-skeleton ${className}`} />;
}

// ─── RecentActivityTimeline ───────────────────────────────────────────────────

interface Props { activities: Activity[]; loading: boolean }

export default function RecentActivityTimeline({ activities, loading }: Props) {
  const items = (activities.length > 0 ? activities : FALLBACK).slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
      className="relative flex h-[380px] flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl dark:backdrop-blur-sm"
    >
      {/* Background Decorative Element */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-blue-500/10 blur-[60px]" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between border-b border-slate-100 px-6 py-5 dark:border-white/5">
        <div>
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Recent Activity</h2>
          <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400">Live event log</p>
        </div>
      </div>

      <div className="relative z-10 flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <DarkSkeleton className="h-9 w-9 shrink-0 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <DarkSkeleton className="h-3.5 w-3/4" />
                  <DarkSkeleton className="h-3 w-1/2" />
                </div>
                <DarkSkeleton className="h-3 w-12 shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          <div className="relative">
            {/* Vertical connector line */}
            <div className="absolute bottom-4 left-[17px] top-4 w-px bg-slate-200 dark:bg-white/15" />

            <div className="flex flex-col gap-1">
              {items.map((act, idx) => {
                const cfg = getEventConfig(act.action);
                return (
                  <motion.div
                    key={`${act.action}-${idx}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.07, duration: 0.4 }}
                    className="group relative flex items-start gap-3 rounded-xl px-2 py-2 transition-all duration-150 hover:bg-slate-50 dark:hover:bg-white/[0.03]"
                  >
                    {/* Icon badge */}
                    <div
                      className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-110"
                      style={{ background: cfg.dimBg }}
                      ref={(el) => {
                        if (el) {
                          const isDark = document.documentElement.classList.contains('dark');
                          el.style.background = isDark ? cfg.dimBg : cfg.dimBg.replace('0.12', '0.06');
                        }
                      }}
                    >
                      {cfg.icon}
                      <span className={`absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-white dark:border-[#0B1121] ${cfg.dot}`} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm font-bold leading-tight text-slate-900 dark:text-white">{act.action}</p>
                      <p className="mt-0.5 truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                        {act.name}{act.dept ? ` — ${act.dept}` : ''}
                      </p>
                    </div>

                    {/* Time */}
                    <span className="shrink-0 pt-0.5 text-[11px] font-semibold text-slate-500 dark:font-medium dark:text-slate-600">
                      {act.time}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
