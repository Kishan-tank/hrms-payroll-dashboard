const features = [
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Employee Management',
    desc: 'Centralized employee profiles, documents, and lifecycle management with real-time updates and automated onboarding workflows.',
    iconColor: '#60a5fa',
    iconBg: 'rgba(37,99,235,0.15)',
    glowColor: 'rgba(37,99,235,0.12)',
    borderHover: 'rgba(37,99,235,0.3)',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    title: 'Attendance & Time',
    desc: 'Automated attendance tracking with biometric integration, geo-fencing, shift scheduling, and overtime calculation.',
    iconColor: '#34d399',
    iconBg: 'rgba(16,185,129,0.15)',
    glowColor: 'rgba(16,185,129,0.10)',
    borderHover: 'rgba(16,185,129,0.3)',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
    title: 'Payroll Automation',
    desc: 'End-to-end payroll processing with tax calculations, compliance checks, salary slips, and direct bank transfers in one click.',
    iconColor: '#fbbf24',
    iconBg: 'rgba(245,158,11,0.15)',
    glowColor: 'rgba(245,158,11,0.08)',
    borderHover: 'rgba(245,158,11,0.3)',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M4 19V5M9 19V9M14 19V7M19 19v-5M3 19h18" />
      </svg>
    ),
    title: 'Analytics & Reports',
    desc: 'Comprehensive dashboards with real-time workforce insights, predictive trends, custom reports, and exportable data.',
    iconColor: '#a78bfa',
    iconBg: 'rgba(124,58,237,0.15)',
    glowColor: 'rgba(124,58,237,0.10)',
    borderHover: 'rgba(124,58,237,0.3)',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      </svg>
    ),
    title: 'Compliance & Security',
    desc: 'Built-in labor law compliance, role-based access control, audit logs, and enterprise-grade AES-256 encryption.',
    iconColor: '#f87171',
    iconBg: 'rgba(239,68,68,0.15)',
    glowColor: 'rgba(239,68,68,0.08)',
    borderHover: 'rgba(239,68,68,0.3)',
  },
  {
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" />
      </svg>
    ),
    title: 'Multi-Branch Support',
    desc: 'Manage multiple offices, departments, and regions from a single unified platform with region-specific compliance rules.',
    iconColor: '#22d3ee',
    iconBg: 'rgba(6,182,212,0.15)',
    glowColor: 'rgba(6,182,212,0.08)',
    borderHover: 'rgba(6,182,212,0.3)',
  },
];

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24"
      style={{ background: 'linear-gradient(180deg, #020817 0%, #0a0f1e 50%, #020817 100%)' }}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
          >
            Platform Features
          </div>
          <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
            Everything Your HR Team Needs
          </h2>
          <p className="mx-auto max-w-2xl text-base text-slate-400">
            A unified platform that scales with your organization — from 10 to 100,000+ employees — with enterprise-grade reliability.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <article
              key={feature.title}
              className={`animate-fade-in-up group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(37,99,235,0.12)] animation-delay-${idx * 100}`}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              {/* Icon */}
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300"
                style={{ backgroundColor: feature.iconBg, color: feature.iconColor }}
              >
                {feature.icon}
              </div>

              {/* Content */}
              <h3 className="mb-2.5 text-base font-bold text-white">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{feature.desc}</p>

              {/* Learn more */}
              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition-all duration-200 group-hover:gap-2" style={{ color: feature.iconColor, opacity: 0.7 }}>
                Learn more
                <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M5 12h14M13 5l7 7-7 7" />
                </svg>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
