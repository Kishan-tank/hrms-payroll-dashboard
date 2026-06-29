import { motion } from 'framer-motion';
import { useAIInsights } from '../../hooks/useAIInsights';
import type { AIInsight } from '../../hooks/useAIInsights';
import type { HrSummary } from '../../services/hrmsApi';

// ─── Sentiment → Color Mapping ────────────────────────────────────────────────

const SENTIMENT_COLORS: Record<AIInsight['sentiment'], { accent: string; accentDim: string }> = {
  positive: { accent: '#22c55e', accentDim: 'rgba(34,197,94,0.10)' },
  warning:  { accent: '#f59e0b', accentDim: 'rgba(245,158,11,0.10)' },
  critical: { accent: '#ef4444', accentDim: 'rgba(239,68,68,0.10)' },
  neutral:  { accent: '#3b82f6', accentDim: 'rgba(59,130,246,0.10)' },
};

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

// ─── Confidence Bar ───────────────────────────────────────────────────────────

function ConfidenceBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-white/5">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: color }}
        />
      </div>
      <span className="text-[11px] font-bold" style={{ color }}>{value}%</span>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-white/5 p-3.5">
      <div className="space-y-2">
        <div className="h-3 w-24 animate-pulse rounded-full bg-slate-200 dark:bg-white/5" />
        <div className="h-4 w-3/4 animate-pulse rounded-full bg-slate-200 dark:bg-white/5" />
        <div className="h-8 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-white/5" />
      </div>
    </div>
  );
}

// ─── Relative Time ────────────────────────────────────────────────────────────

function relativeTime(date: Date): string {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 1) return 'Just now';
  if (mins === 1) return '1m ago';
  return `${mins}m ago`;
}

// ─── AIInsightsPanel ─────────────────────────────────────────────────────────

export default function AIInsightsPanel({ summary }: { summary?: HrSummary | null }) {
  const { insights, loading, streaming, error, generate, lastGeneratedAt } =
    useAIInsights(summary ?? null);

  const isActive = loading || streaming;

  // ── Header badge ──
  const badge = (() => {
    if (isActive) {
      return (
        <span className="flex items-center gap-1.5 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          Analysing...
        </span>
      );
    }
    if (lastGeneratedAt) {
      return (
        <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Updated {relativeTime(lastGeneratedAt)}
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Live
      </span>
    );
  })();

  // ── Content area ──
  const content = (() => {
    // Loading or streaming — show 4 skeletons
    if (isActive && insights.length === 0) {
      return (
        <>
          <div className="flex flex-col gap-2.5">
            {[0, 1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
            Analysing workforce data...
          </p>
        </>
      );
    }

    // Error state
    if (error && insights.length === 0) {
      return (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 dark:border-white/5 px-4 py-8 text-center">
          <i className="ti ti-wifi-off text-2xl text-slate-400" />
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Could not load insights
            </p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500 break-all">
              {error}
            </p>
          </div>
          <button
            type="button"
            onClick={generate}
            className="mt-1 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-white"
          >
            Retry
            <ArrowRightIcon />
          </button>
        </div>
      );
    }

    // Loaded state
    if (insights.length > 0) {
      return (
        <div className="flex flex-col gap-2.5">
          {insights.map((ins, idx) => {
            const { accent, accentDim } = SENTIMENT_COLORS[ins.sentiment];
            return (
              <motion.div
                key={ins.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + idx * 0.07, duration: 0.4 }}
                className="group cursor-default rounded-2xl border p-3.5 transition-all duration-200"
                style={{ borderColor: `${accent}18` }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}40`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = `${accent}18`;
                }}
                ref={(el) => {
                  if (el) {
                    const isDark = document.documentElement.classList.contains('dark');
                    el.style.background = isDark ? accentDim : accentDim.replace('0.10', '0.04');
                  }
                }}
              >
                {/* Category tag + confidence */}
                <div className="mb-2 flex items-center justify-between">
                  <span
                    className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
                    style={{ background: `${accent}18`, color: accent }}
                  >
                    {getCategoryIcon(ins.category, accent)}
                    {ins.category}
                  </span>
                  <ConfidenceBar value={ins.confidence} color={accent} />
                </div>

                <p className="text-sm font-bold leading-snug text-slate-900 dark:text-white">{ins.title}</p>
                <p className="mt-1 text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-400">{ins.body}</p>

                <button
                  type="button"
                  className="mt-2.5 flex items-center gap-1 text-[11px] font-bold transition-opacity duration-150 hover:opacity-80"
                  style={{ color: accent }}
                >
                  {ins.action}
                  <ArrowRightIcon />
                </button>
              </motion.div>
            );
          })}
        </div>
      );
    }

    // Empty state — briefly shown before auto-generate fires
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/5 px-4 py-8 text-center">
        <i className="ti ti-loader-2 animate-spin text-2xl text-slate-400" />
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
          Generating workforce insights...
        </p>
      </div>
    );
  })();

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

        {/* Badge + Refresh button */}
        <div className="flex items-center gap-2">
          {badge}
          <button
            type="button"
            onClick={generate}
            disabled={isActive}
            title="Regenerate insights"
            className={`rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40 dark:hover:bg-white/10 dark:hover:text-slate-300 ${isActive ? 'animate-spin' : ''}`}
          >
            <i className="ti ti-refresh text-[15px]" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        {content}
      </div>

      {/* Footer button */}
      <button
        type="button"
        onClick={generate}
        disabled={isActive}
        className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 dark:border-white/10 dark:bg-white/[0.03] dark:text-slate-400 dark:hover:border-white/20 dark:hover:bg-white/[0.06] dark:hover:text-white"
      >
        {lastGeneratedAt ? 'Regenerate insights' : 'Generate insights'}
        <ArrowRightIcon />
      </button>
    </motion.div>
  );
}
