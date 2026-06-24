import { motion } from 'framer-motion';
import type { HrSummary } from '../../services/hrmsApi';

// ─── TypeScript Interfaces ────────────────────────────────────────────────────

export interface InsightItem {
  id: string;
  category: 'ATTENDANCE' | 'LEAVE' | 'PAYROLL' | 'APPROVALS';
  title: string;
  body: string;
  confidence: number;
  accent: string;
  accentDim: string;
  icon?: React.ReactNode;
  action: string;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function TrendUpIcon({ c }: { c: string }) {
  return <svg className="h-3.5 w-3.5" fill="none" stroke={c} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M22 7l-8.5 8.5-5-5L2 17" /></svg>;
}
function AlertIcon({ c }: { c: string }) {
  return <svg className="h-3.5 w-3.5" fill="none" stroke={c} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" /></svg>;
}
function RupeeIcon({ c }: { c: string }) {
  return <svg className="h-3.5 w-3.5" fill="none" stroke={c} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 3h12M6 8h12M6 13h8.5a3.5 3.5 0 1 0 0-7H6v15" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m14.5 13-8.5 8" /></svg>;
}
function BellIcon({ c }: { c: string }) {
  return <svg className="h-3.5 w-3.5" fill="none" stroke={c} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
}
function ArrowRightIcon() {
  return <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 18l6-6-6-6" /></svg>;
}

function getCategoryIcon(category: string, accent: string) {
  if (category === 'ATTENDANCE') return <TrendUpIcon c={accent} />;
  if (category === 'LEAVE') return <AlertIcon c={accent} />;
  if (category === 'PAYROLL') return <RupeeIcon c={accent} />;
  return <BellIcon c={accent} />;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const INSIGHTS: InsightItem[] = [
  {
    id: 'att',
    category: 'ATTENDANCE',
    title: 'Attendance climbing 2.4%',
    body: 'On-site attendance trending up for 3rd consecutive week. Engineering leading at 99.1%.',
    confidence: 94,
    accent: '#3b82f6',
    accentDim: 'rgba(59,130,246,0.10)',
    action: 'View breakdown',
  },
  {
    id: 'leave',
    category: 'LEAVE',
    title: 'Leave spike predicted',
    body: 'Model forecasts +31% leave requests next week due to regional holiday cluster.',
    confidence: 87,
    accent: '#22c55e',
    accentDim: 'rgba(34,197,94,0.10)',
    action: 'Review calendar',
  },
  {
    id: 'payroll',
    category: 'PAYROLL',
    title: 'Payroll anomaly flagged',
    body: '3 overtime entries in Sales exceed policy thresholds. ₹42,000 at risk of non-compliance.',
    confidence: 91,
    accent: '#8b5cf6',
    accentDim: 'rgba(139,92,246,0.10)',
    action: 'Audit entries',
  },
  {
    id: 'approvals',
    category: 'APPROVALS',
    title: '12 approvals pending > 48h',
    body: 'Reminder sent to 4 managers. Avg approval time improved to 9.2h this month.',
    confidence: 99,
    accent: '#f59e0b',
    accentDim: 'rgba(245,158,11,0.10)',
    action: 'Approve now',
  },
];

// ─── Confidence Bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-white/5">
        <div
          className="h-full rounded-full animate-bar-grow"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-bold" style={{ color }}>{value}%</span>
    </div>
  );
}

// ─── AIInsightsPanel ─────────────────────────────────────────────────────────

export default function AIInsightsPanel({ summary }: { summary?: HrSummary | null }) {
  const insightsList = summary?.insights ?? INSIGHTS;

  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      className="flex h-full flex-col rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          {/* AI icon */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-500">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Insights</h2>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Live workforce signals</p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-live" />
          Live
        </span>
      </div>

      {/* Insight cards */}
      <div className="flex flex-col gap-2.5">
        {insightsList.map((ins, idx) => (
          <motion.div
            key={ins.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.07, duration: 0.4 }}
            className="group cursor-default rounded-2xl border p-3.5 transition-all duration-200"
            style={{ borderColor: `${ins.accent}18` }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = `${ins.accent}40`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.borderColor = `${ins.accent}18`;
            }}
            ref={(el) => {
              if (el) {
                const isDark = document.documentElement.classList.contains('dark');
                el.style.background = isDark ? ins.accentDim : ins.accentDim.replace('0.10', '0.04');
              }
            }}
          >
            {/* Category tag + confidence */}
            <div className="mb-2 flex items-center justify-between">
              <span
                className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                style={{ background: `${ins.accent}18`, color: ins.accent }}
              >
                {getCategoryIcon(ins.category, ins.accent)}
                {ins.category}
              </span>
              <ConfidenceBar value={ins.confidence} color={ins.accent} />
            </div>

            <p className="text-sm font-bold leading-snug text-slate-900 dark:text-white">{ins.title}</p>
            <p className="mt-1 text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-400">{ins.body}</p>

            {/* Action link */}
            <button
              type="button"
              className="mt-2.5 flex items-center gap-1 text-[11px] font-bold transition-opacity duration-150 hover:opacity-80"
              style={{ color: ins.accent }}
            >
              {ins.action}
              <ArrowRightIcon />
            </button>
          </motion.div>
        ))}
      </div>

      {/* View all */}
      <button
        type="button"
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-white"
      >
        View all Insights
        <ArrowRightIcon />
      </button>
    </motion.div>
  );
}
