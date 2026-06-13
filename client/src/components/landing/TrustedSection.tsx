

const metrics = [
  { value: '150+', label: 'Enterprises' },
  { value: '2,500+', label: 'Employees Managed' },
  { value: '99.7%', label: 'Payroll Accuracy' },
  { value: 'SOC 2', label: 'Ready' },
  { value: 'GDPR', label: 'Compliant' },
  { value: '99.99%', label: 'System Uptime' },
];

/* ── Icons ──────────────────────────────────────────────── */
function StarIcon() {
  return (
    <svg className="h-4 w-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
      <path d="m12 2.5 2.9 6 6.6.95-4.75 4.65 1.1 6.55L12 17.55l-5.85 3.1 1.1-6.55L2.5 9.45l6.6-.95z" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8V7z" />
    </svg>
  );
}

function ZapIcon() {
  return (
    <svg className="h-4 w-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function TrustedSection() {
  return (
    <section className="py-16" style={{ background: 'transparent' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Badge */}
        <div className="mb-8 text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
            TRUSTED BY HR TEAMS ACROSS INDIA
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {metrics.map((metric, idx) => (
            <div
              key={idx}
              className="animate-fade-in-up flex flex-col items-center justify-center p-6 text-center transition-all duration-300"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(59,130,246,0.12)',
                borderRadius: '20px',
                animationDelay: `${idx * 100}ms`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 25px rgba(59,130,246,0.15)';
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(59,130,246,0.3)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(59,130,246,0.12)';
              }}
            >
              <div className="mb-1 text-2xl font-bold text-white">
                {metric.value}
              </div>
              <div className="text-sm font-medium text-slate-400">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Trust Indicators */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <StarIcon /> 4.9/5 Customer Rating
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <CheckCircleIcon /> SOC 2 Ready
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <LockIcon /> GDPR Compliant
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <ZapIcon /> 99.99% Uptime
          </div>
        </div>

      </div>
    </section>
  );
}
