/* ── Mini Bar Chart ─────────────────────────────────────── */
function MiniBarChart({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-[3px] h-14">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-500"
          style={{
            height: `${(v / max) * 100}%`,
            background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
            opacity: 0.55 + (i / data.length) * 0.45,
          }}
        />
      ))}
    </div>
  );
}

/* ── Mini Line Chart (SVG) ──────────────────────────────── */
function MiniLineChart({ data, color }: { data: number[]; color: string }) {
  const W = 280;
  const H = 56;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * (H - 6) - 3,
  }));
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaD = `${lineD} L ${W},${H} L 0,${H} Z`;
  const gradId = `area-${color.replace('#', '')}`;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 56 }} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#${gradId})`} />
      <path d={lineD} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Endpoint dot */}
      <circle
        cx={pts[pts.length - 1].x}
        cy={pts[pts.length - 1].y}
        r="3.5"
        fill={color}
        stroke="rgba(2,6,23,0.8)"
        strokeWidth="2"
      />
    </svg>
  );
}

/* ── Analytics Card Data ────────────────────────────────── */
const analyticsData = [
  {
    title: 'Payroll Cost Trend',
    subtitle: 'Monthly expenditure in ₹ Lakhs',
    value: '₹241.8L',
    change: '+8.4%',
    changeLabel: 'vs last month',
    positive: true,
    data: [72, 78, 75, 85, 82, 92, 90, 96, 94, 100, 98, 102],
    color: '#2563eb',
    accentBg: 'rgba(37,99,235,0.08)',
    borderGlow: 'rgba(37,99,235,0.25)',
    hoverBorder: 'rgba(37,99,235,0.45)',
    chartType: 'bar' as const,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    title: 'Attendance Rate',
    subtitle: 'Daily average across all branches',
    value: '91.4%',
    change: '+3.2%',
    changeLabel: 'vs last week',
    positive: true,
    data: [80, 85, 82, 90, 88, 92, 89, 94, 91, 95, 93, 96],
    color: '#22c55e',
    accentBg: 'rgba(34,197,94,0.08)',
    borderGlow: 'rgba(34,197,94,0.25)',
    hoverBorder: 'rgba(34,197,94,0.45)',
    chartType: 'line' as const,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
      </svg>
    ),
  },
  {
    title: 'Employee Growth',
    subtitle: 'Headcount change over 12 months',
    value: '+124',
    change: '+11.3%',
    changeLabel: 'annual growth rate',
    positive: true,
    data: [50, 55, 60, 62, 68, 72, 78, 82, 88, 90, 96, 100],
    color: '#7c3aed',
    accentBg: 'rgba(124,58,237,0.08)',
    borderGlow: 'rgba(124,58,237,0.25)',
    hoverBorder: 'rgba(124,58,237,0.45)',
    chartType: 'bar' as const,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M20 8v6M23 11h-6" />
      </svg>
    ),
  },
  {
    title: 'Leave Utilization',
    subtitle: 'Leave taken vs available balance',
    value: '38.6%',
    change: '-2.1%',
    changeLabel: 'vs last quarter',
    positive: false,
    data: [45, 42, 48, 40, 44, 38, 36, 39, 37, 35, 38, 40],
    color: '#f59e0b',
    accentBg: 'rgba(245,158,11,0.08)',
    borderGlow: 'rgba(245,158,11,0.25)',
    hoverBorder: 'rgba(245,158,11,0.45)',
    chartType: 'line' as const,
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" x2="16" y1="2" y2="6" />
        <line x1="8" x2="8" y1="2" y2="6" />
        <line x1="3" x2="21" y1="10" y2="10" />
      </svg>
    ),
  },
] as const;

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* ── Main Component ─────────────────────────────────────── */
export default function AnalyticsSection() {
  return (
    <section
      id="enterprise"
      className="relative overflow-hidden py-24"
      style={{ background: '#020617' }}
    >
      {/* Background grid */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(37,99,235,0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(37,99,235,0.04) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Purple/blue radial glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.10) 0%, rgba(37,99,235,0.06) 40%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-6">

        {/* ── Section header ── */}
        <div className="mb-16 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-violet-400"
            style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
            Enterprise Analytics
          </div>

          <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl lg:text-[2.5rem]">
            Enterprise Workforce{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 60%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Analytics
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-400">
            Gain real-time visibility into payroll, workforce performance, attendance trends, and organizational growth from a single intelligent dashboard.
          </p>
        </div>

        {/* ── Analytics cards grid ── */}
        <div className="grid gap-6 sm:grid-cols-2">
          {analyticsData.map((card, idx) => (
            <div
              key={card.title}
              className={`animate-fade-in-up group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1.5 animation-delay-${idx * 100}`}
              style={{
                background: `linear-gradient(135deg, #0f172a 0%, ${card.accentBg} 100%)`,
                border: `1px solid ${card.borderGlow}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${card.hoverBorder}`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 30px ${card.borderGlow}, 0 20px 40px rgba(0,0,0,0.4)`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${card.borderGlow}`;
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              {/* Subtle inner glow top-right */}
              <div
                className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-20"
                style={{ background: `radial-gradient(circle, ${card.color}, transparent 70%)`, filter: 'blur(20px)' }}
              />

              {/* Top row: icon + title + badge */}
              <div className="relative mb-5 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: card.accentBg, color: card.color, border: `1px solid ${card.borderGlow}` }}
                  >
                    {card.icon}
                  </span>
                  <div>
                    <div className="text-sm font-bold text-white">{card.title}</div>
                    <div className="mt-0.5 text-xs text-slate-500">{card.subtitle}</div>
                  </div>
                </div>
                <span
                  className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
                  style={{
                    background: card.positive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                    color: card.positive ? '#4ade80' : '#f87171',
                  }}
                >
                  {card.change}
                </span>
              </div>

              {/* Value row */}
              <div className="relative mb-5">
                <div
                  className="text-4xl font-extrabold leading-none"
                  style={{ color: card.color }}
                >
                  {card.value}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">{card.changeLabel}</div>
              </div>

              {/* Divider */}
              <div className="mb-4 h-px" style={{ background: `linear-gradient(90deg, ${card.color}30, transparent)` }} />

              {/* Chart */}
              <div className="relative">
                {card.chartType === 'bar' ? (
                  <MiniBarChart data={[...card.data]} color={card.color} />
                ) : (
                  <MiniLineChart data={[...card.data]} color={card.color} />
                )}
              </div>

              {/* Month labels */}
              <div className="mt-2 flex justify-between text-[9px] text-slate-600">
                {MONTHS.map((m, i) => (
                  <span key={i}>{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Bottom insight strip ── */}
        <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            {
              metric: '40+ hrs',
              label: 'Saved per HR manager per month',
              icon: '⚡',
              color: '#60a5fa',
            },
            {
              metric: '99.8%',
              label: 'Payroll accuracy rate',
              icon: '✓',
              color: '#4ade80',
            },
            {
              metric: '3.5×',
              label: 'Faster compliance reporting',
              icon: '📊',
              color: '#a78bfa',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl p-5 transition-all duration-200 hover:-translate-y-1"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <span className="text-2xl">{stat.icon}</span>
              <div>
                <p className="text-xl font-extrabold" style={{ color: stat.color }}>{stat.metric}</p>
                <p className="text-xs text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
