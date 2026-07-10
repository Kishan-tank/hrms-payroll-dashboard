import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { HrSummary } from '../../services/hrmsApi';

// ─── CountUp Component ────────────────────────────────────────────────────────
function CountUp({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (current) => {
    let formatted;
    if (current % 1 !== 0) {
      formatted = current.toFixed(2);
    } else {
      formatted = Math.round(current).toLocaleString();
    }
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

// ─── TypeScript interfaces ────────────────────────────────────────────────────
export interface KPIItem {
  id: string;
  label: string;
  valueNumeric: number;
  prefix?: string;
  suffix?: string;
  trend?: string;
  trendSub?: string;
  trendPositive: boolean;
  hideArrow?: boolean;
  sub: string;
  accent: string;
  gradient: string;
  sparkline?: number[];
  icon: React.ReactNode;
  route: string;
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────
function UsersIcon({ color }: { color: string }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function ClockCheckIcon({ color }: { color: string }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color }}>
      <circle cx="12" cy="12" r="9" strokeWidth={1.8} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4" />
    </svg>
  );
}
function RupeeIcon({ color }: { color: string }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M6 3h12M6 8h12M6 13h8.5a3.5 3.5 0 1 0 0-7H6v15" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="m14.5 13-8.5 8" />
    </svg>
  );
}
function BellAlertIcon({ color }: { color: string }) {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color }}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0M12 2v1" />
    </svg>
  );
}

// ─── Mini Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 80, h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * w,
    y: h - ((v - min) / range) * (h - 4) - 2,
  }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const fill = `${d} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-fill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={fill} fill={`url(#spark-fill-${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill={color} className="ring-2 ring-white dark:ring-[#0B1121]" />
    </svg>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="mb-4 h-12 w-12 rounded-2xl bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="mb-2 h-8 w-28 rounded-lg bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="mb-4 h-3 w-36 rounded-md bg-slate-100 dark:bg-white/5 animate-pulse" />
      <div className="h-10 w-full rounded-xl bg-slate-100 dark:bg-white/5 animate-pulse" />
    </div>
  );
}

// ─── KPIGrid ─────────────────────────────────────────────────────────────────
export default function KPIGrid({ summary, loading }: { summary: HrSummary | null; loading: boolean }) {
  const navigate = useNavigate();

  if (loading || !summary) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const attendanceValue = parseFloat(summary.attendanceRate);
  
  const cards: KPIItem[] = [
    {
      id: 'employees',
      label: 'Total Employees',
      valueNumeric: summary.totalEmployees,
      trendPositive: true,
      sub: 'Across all departments',
      accent: '#3b82f6',
      gradient: 'from-blue-600 to-indigo-600',
      icon: <UsersIcon color="currentColor" />,
      route: '/employees',
    },
    {
      id: 'attendance',
      label: 'Attendance Rate',
      valueNumeric: attendanceValue,
      suffix: '%',
      trendPositive: true,
      sub: 'Weekly workforce avg',
      accent: '#10b981',
      gradient: 'from-emerald-500 to-emerald-700',
      icon: <ClockCheckIcon color="currentColor" />,
      route: '/attendance',
    },
    {
      id: 'payroll',
      label: 'Payroll Status',
      valueNumeric: summary.payrollTotal ?? 4.12,
      prefix: '₹',
      suffix: 'M',
      trend: summary.payrollStatus === '100%' ? 'Cycle complete (100%)' : `Disbursement (${summary.payrollStatus})`,
      trendSub: 'Current month cycle',
      trendPositive: true,
      hideArrow: true,
      sub: 'Processed smoothly',
      accent: '#8b5cf6',
      gradient: 'from-violet-500 to-purple-600',
      icon: <RupeeIcon color="currentColor" />,
      route: '/payroll',
    },
    {
      id: 'approvals',
      label: 'Pending Approvals',
      valueNumeric: summary.pendingApprovals,
      trendPositive: false,
      hideArrow: true,
      sub: 'Needs immediate review',
      accent: '#f59e0b',
      gradient: 'from-amber-400 to-orange-500',
      icon: <BellAlertIcon color="currentColor" />,
      route: '/leave?filter=Pending',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card, idx) => (
        <motion.div
          key={card.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1, duration: 0.5, ease: 'easeOut' }}
          onClick={() => navigate(card.route)}
          className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#0B1121] dark:shadow-xl dark:hover:shadow-2xl cursor-pointer"
        >
          {/* Subtle gradient glow behind the icon */}
          <div
            className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20 dark:opacity-20 dark:group-hover:opacity-30"
            style={{ background: card.accent }}
          />

          <div className="mb-6 flex items-start justify-between">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
              style={{ background: `${card.accent}20`, color: card.accent }}
            >
              {card.icon}
            </div>
            <div className="opacity-70 transition-opacity duration-300 group-hover:opacity-100">
              {card.sparkline && card.sparkline.length > 0 && <Sparkline data={card.sparkline} color={card.accent} />}
            </div>
          </div>

          <div>
            <p className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              <CountUp value={card.valueNumeric} prefix={card.prefix} suffix={card.suffix} />
            </p>
          </div>

          <div className="mt-3 flex flex-col items-start gap-1">
            {card.trend && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                  card.trendPositive
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                }`}
              >
                {!card.hideArrow && (card.trendPositive ? '↑ ' : '↓ ')}
                {card.trend}
              </span>
            )}
            {card.trendSub && <span className="text-[10px] font-semibold text-slate-500">{card.trendSub}</span>}
          </div>
          
          <div className="mt-auto pt-4">
            <div className="border-t border-slate-100 pt-3 dark:border-white/5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{card.label}</p>
                <p className="mt-0.5 text-xs font-semibold text-slate-500 dark:text-slate-500">{card.sub}</p>
              </div>
              <span className="text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
                View details &rarr;
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
