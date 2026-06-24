

const metrics = [
  { value: 'SOC 2', label: 'Ready Controls' },
  { value: 'GDPR', label: 'Compliant Flows' },
  { value: 'RBAC', label: 'Role-Level Access' },
  { value: 'AES-256', label: 'Encryption Model' },
  { value: '99.99%', label: 'Uptime Target' },
  { value: 'Audit', label: 'Event Trails' },
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
    <section className="py-20" style={{ background: 'transparent' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* Header */}
        <div className="mb-10 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            Security & Compliance
          </div>
          <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
            Enterprise Trust Built In
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-400">
            Protect workforce data with secure access controls, encrypted workflows, audit trails, and compliance-ready operations.
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
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
            <StarIcon /> Audit-ready controls
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
