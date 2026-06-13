import { useState } from 'react';
import { Link } from 'react-router-dom';
import VideoModal from './VideoModal';

/* ── Icons ─────────────────────────────────────────────── */
function PlayIcon() {
  return (
    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
function ArrowRightIcon() {
  return (
    <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}
function TrendUpIcon() {
  return (
    <svg className="h-3 w-3" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
      <path d="M23 6l-9.5 9.5-5-5L1 18M17 6h6v6" />
    </svg>
  );
}

/* ── Floating Payroll Dashboard Mockup ─────────────────── */
function PayrollDashboardMockup() {
  const depts = [
    { name: 'Engineering', amount: '₹8,42,000', pct: 85, status: 'Processed', statusColor: 'text-emerald-400 bg-emerald-400/10' },
    { name: 'Sales & Mktg', amount: '₹4,18,000', pct: 62, status: 'Processed', statusColor: 'text-emerald-400 bg-emerald-400/10' },
    { name: 'HR & Admin', amount: '₹2,24,000', pct: 40, status: 'Pending', statusColor: 'text-amber-400 bg-amber-400/10' },
    { name: 'Finance', amount: '₹1,96,000', pct: 30, status: 'Pending', statusColor: 'text-amber-400 bg-amber-400/10' },
  ];
  const attBars = [72, 85, 78, 92, 88, 95, 90];

  return (
    <div className="animate-float relative w-full max-w-[520px] select-none">
      {/* Outer glow */}
      <div
        className="pointer-events-none absolute -inset-6 rounded-3xl"
        style={{ background: 'radial-gradient(ellipse, rgba(37,99,235,0.22) 0%, rgba(124,58,237,0.10) 50%, transparent 70%)', filter: 'blur(20px)' }}
      />

      {/* ── Main card ── */}
      <div
        className="relative rounded-2xl p-5 shadow-[0_32px_80px_rgba(0,0,0,0.5)]"
        style={{
          background: 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(9,14,30,0.98) 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Payroll Summary</p>
            <p className="text-sm font-bold text-white">June 2026</p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">Live</span>
          </div>
        </div>

        {/* Total */}
        <div className="mb-4 rounded-xl p-4" style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.2) 0%, rgba(124,58,237,0.12) 100%)', border: '1px solid rgba(37,99,235,0.25)' }}>
          <p className="mb-0.5 text-xs text-blue-300/70">Total Payroll</p>
          <p className="text-2xl font-extrabold text-white">₹16,80,000</p>
          <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-400">
            <TrendUpIcon />
            <span>+12.4% vs last month</span>
          </div>
        </div>

        {/* Department rows */}
        <div className="mb-4 space-y-2.5">
          {depts.map((d) => (
            <div key={d.name} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-300 truncate">{d.name}</span>
                  <span className="ml-2 text-xs font-bold text-white shrink-0">{d.amount}</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/5">
                  <div
                    className="h-1.5 rounded-full"
                    style={{ width: `${d.pct}%`, background: 'linear-gradient(90deg, #2563eb, #7c3aed)' }}
                  />
                </div>
              </div>
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${d.statusColor}`}>
                {d.status}
              </span>
            </div>
          ))}
        </div>

        {/* Attendance mini chart */}
        <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Attendance This Week</span>
            <span className="text-xs font-bold text-white">91.4%</span>
          </div>
          <div className="flex items-end gap-1 h-10">
            {attBars.map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm"
                style={{ height: `${h}%`, background: `rgba(37,99,235,${0.3 + (h / 100) * 0.6})` }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-[9px] text-slate-600">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
          </div>
        </div>
      </div>

      {/* ── Floating toast: Payroll Processed ── */}
      <div
        className="animate-float-slow animation-delay-300 absolute -right-4 top-6 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 shadow-2xl"
        style={{ background: 'rgba(16,24,40,0.95)', border: '1px solid rgba(16,185,129,0.3)', backdropFilter: 'blur(16px)' }}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
          <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
            <path d="m5 13 4 4L19 7" />
          </svg>
        </span>
        <div>
          <p className="text-xs font-bold text-white">Payroll Processed</p>
          <p className="text-[10px] text-emerald-400">₹16.8L distributed • just now</p>
        </div>
      </div>

      {/* ── Floating Headcount card ── */}
      <div
        className="animate-float animation-delay-200 absolute -left-6 bottom-12 rounded-xl p-3 shadow-2xl"
        style={{ background: 'rgba(16,24,40,0.95)', border: '1px solid rgba(37,99,235,0.25)', backdropFilter: 'blur(16px)', minWidth: '140px' }}
      >
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Headcount</p>
        <p className="text-xl font-extrabold text-white">1,248</p>
        <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-blue-400">
          <TrendUpIcon />
          <span>+24 this month</span>
        </div>
      </div>
    </div>
  );
}

/* ── Hero KPI Strip ─────────────────────────────────────── */
const kpis = [
  {
    value: '150+',
    label: 'Enterprises Across India',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
        <path d="M3 21h18M3 7v14M21 7v14M6 21V3h12v18M9 7h6M9 11h6M9 15h6" />
      </svg>
    ),
    iconBg: 'rgba(37,99,235,0.15)',
    iconColor: '#60a5fa',
    border: 'rgba(37,99,235,0.2)',
    hoverShadow: 'rgba(37,99,235,0.2)'
  },
  {
    value: '1,248',
    label: 'Employees Active Today',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    iconBg: 'rgba(124,58,237,0.15)',
    iconColor: '#a78bfa',
    border: 'rgba(124,58,237,0.2)',
    hoverShadow: 'rgba(124,58,237,0.2)'
  },
  {
    value: '₹2.84 Cr',
    label: 'Payroll Processed',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    iconBg: 'rgba(16,185,129,0.15)',
    iconColor: '#34d399',
    border: 'rgba(16,185,129,0.2)',
    hoverShadow: 'rgba(16,185,129,0.2)'
  },
  {
    value: '99.7%',
    label: 'Payroll Accuracy',
    icon: (
      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    iconBg: 'rgba(245,158,11,0.15)',
    iconColor: '#fbbf24',
    border: 'rgba(245,158,11,0.2)',
    hoverShadow: 'rgba(245,158,11,0.2)'
  },
];

/* ── Avatar initials data ──────────────────────────────── */
const avatars = [
  { i: 'A', bg: '#2563eb' },
  { i: 'R', bg: '#7c3aed' },
  { i: 'S', bg: '#0891b2' },
  { i: 'K', bg: '#059669' },
  { i: 'P', bg: '#d97706' },
];

/* ── Main Component ─────────────────────────────────────── */
export default function HeroSection() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-6 pb-0 pt-16 lg:pt-24">
      <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-center lg:gap-16">

        {/* ── Left Column ── */}
        <div className="flex-1 text-center lg:text-left">

          {/* Badge */}
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5" style={{ background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.25)' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Week 1 Launch — Enterprise HRMS Platform
            </span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-in-up mb-5 text-4xl font-extrabold leading-[1.12] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
            The HR Platform Built
            <br />
            for{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 50%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Modern Enterprises
            </span>
          </h1>

          {/* Description */}
          <p className="animate-fade-in-up animation-delay-200 mx-auto mb-8 max-w-lg text-base leading-relaxed text-slate-400 lg:mx-0">
            Automate payroll, manage your workforce, track attendance, and stay compliant — all from one intelligent platform trusted by{' '}
            <span className="font-semibold text-slate-200">150+ enterprises</span> across India.
          </p>

          {/* CTAs */}
          <div className="animate-fade-in-up animation-delay-300 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              to="/register"
              className="group flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/30 transition-all hover:bg-blue-500 hover:shadow-blue-500/50 hover:scale-[1.02]"
            >
              Start Free Trial
              <ArrowRightIcon />
            </Link>
            <button
              type="button"
              onClick={() => setIsVideoModalOpen(true)}
              className="flex items-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(255,255,255,0.12)', color: '#cbd5e1' }}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10">
                <PlayIcon />
              </span>
              Watch Demo
            </button>
          </div>

          {/* Trust points */}
          <div className="animate-fade-in-up animation-delay-400 mt-6 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
            {['No credit card required', '14-day free trial', 'SOC 2 Certified'].map((point) => (
              <div key={point} className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                  <CheckIcon />
                </span>
                <span className="text-xs font-medium text-slate-400">{point}</span>
              </div>
            ))}
          </div>

          {/* Avatar group + social proof */}
          <div className="animate-fade-in-up animation-delay-500 mt-6 flex items-center justify-center gap-3 lg:justify-start">
            <div className="flex -space-x-2">
              {avatars.map((a, i) => (
                <div
                  key={i}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold text-white"
                  style={{ backgroundColor: a.bg, borderColor: '#020817' }}
                >
                  {a.i}
                </div>
              ))}
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full border-2 text-[10px] font-semibold text-slate-400"
                style={{ backgroundColor: 'rgba(255,255,255,0.07)', borderColor: '#020817' }}
              >
                +1k
              </div>
            </div>
            <p className="text-xs text-slate-400">
              <span className="font-bold text-white">1,200+ HR teams</span> already using HRMSPro
            </p>
          </div>
        </div>

        {/* ── Right Column: Dashboard Mockup ── */}
        <div className="animate-slide-in-right flex w-full flex-1 items-center justify-center lg:justify-end">
          <PayrollDashboardMockup />
        </div>
      </div>

      {/* ── KPI Strip ── */}
      <div className="mt-16 flex flex-wrap items-center justify-center gap-3 pb-16 lg:justify-between">
        {kpis.map((kpi, idx) => (
          <div
            key={kpi.label}
            className={`animate-fade-in-up group flex flex-1 min-w-[200px] items-center gap-3 rounded-full px-4 py-2.5 transition-all duration-300 hover:-translate-y-1 animation-delay-${idx * 100}`}
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${kpi.border}`,
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = `0 10px 30px ${kpi.hoverShadow}`;
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
              (e.currentTarget as HTMLElement).style.borderColor = 'rgba(59,130,246,0.3)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
              (e.currentTarget as HTMLElement).style.borderColor = kpi.border;
            }}
          >
            {/* Icon */}
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              style={{ backgroundColor: kpi.iconBg, color: kpi.iconColor }}
            >
              {kpi.icon}
            </span>
            <div className="flex flex-col">
              <span className="text-[13px] font-extrabold text-white">{kpi.value}</span>
              <span className="text-[10px] uppercase tracking-wider text-slate-400">{kpi.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal */}
      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
    </section>
  );
}
