import { Link } from 'react-router-dom';

/* ── Icons ──────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-blue-400" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} viewBox="0 0 24 24">
      <path d="m5 13 4 4L19 7" />
    </svg>
  );
}

function StarterIcon() {
  return (
    <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function ProIcon() {
  return (
    <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function EnterpriseIcon() {
  return (
    <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

/* ── Data ───────────────────────────────────────────────── */
const plans = [
  {
    name: 'Starter',
    tagline: 'For growing SMEs',
    price: '₹49',
    period: '/ employee / month',
    target: 'Up to 100 employees',
    features: [
      'Payroll processing & payslips',
      'Leave & attendance management',
      'Employee self-service portal',
      'Form 16 & 24Q generation',
      'Email & chat support',
      'Basic analytics dashboard',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/register',
    recommended: false,
    icon: <StarterIcon />,
  },
  {
    name: 'Professional',
    tagline: 'Most popular for mid-market companies',
    price: '₹89',
    period: '/ employee / month',
    target: '100–1,000 employees',
    features: [
      'Everything in Starter',
      'Advanced payroll engine',
      'Multi-location management',
      'Performance management',
      'Custom HR policy engine',
      'Priority support (SLA 4h)',
      'People analytics & reports',
      '160+ integrations',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/register',
    recommended: true,
    icon: <ProIcon />,
  },
  {
    name: 'Enterprise',
    tagline: 'For large organizations',
    price: 'Custom',
    period: 'Pricing',
    target: '1,000+ employees',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom implementation',
      'SSO & SAML integration',
      'On-premise deployment option',
      'SLA 99.99% uptime guarantee',
      'Advanced security & audit',
      'White-glove migration',
    ],
    cta: 'Contact Sales',
    ctaLink: '/register',
    recommended: false,
    icon: <EnterpriseIcon />,
  },
];

/* ── Main Component ─────────────────────────────────────── */
export default function PricingSection() {
  return (
    <section id="pricing" className="relative overflow-hidden py-24" style={{ background: '#020617' }}>
      {/* Background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[1000px] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 60%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* ── Section header ── */}
        <div className="mb-20 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Transparent Pricing
          </div>

          <h2 className="mb-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.6rem]">
            Simple, Predictable{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 60%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Pricing
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-400">
            No hidden fees. No long-term lock-in. Scale up or down as your team grows. All plans include a 14-day free trial.
          </p>
        </div>

        {/* ── Pricing Cards ── */}
        <div className="grid items-center gap-8 lg:grid-cols-3">
          {plans.map((plan) => {
            const isRec = plan.recommended;
            return (
              <div
                key={plan.name}
                className={`animate-fade-in-up relative flex flex-col rounded-3xl p-8 transition-all duration-300 ${
                  isRec ? 'lg:scale-105 z-10' : 'z-0 hover:-translate-y-1'
                }`}
                style={{
                  background: isRec
                    ? 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(15,23,42,0.9) 100%)'
                    : 'rgba(255,255,255,0.02)',
                  border: isRec
                    ? '1px solid rgba(37,99,235,0.5)'
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isRec ? '0 0 40px rgba(37,99,235,0.2), 0 20px 40px rgba(0,0,0,0.5)' : '0 10px 30px rgba(0,0,0,0.2)',
                  backdropFilter: 'blur(12px)',
                }}
              >
                {/* Most Popular Badge */}
                {isRec && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span
                      className="rounded-full px-4 py-1.5 text-xs font-extrabold tracking-wide text-white shadow-lg"
                      style={{
                        background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
                        boxShadow: '0 0 15px rgba(37,99,235,0.4)',
                      }}
                    >
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold text-white">{plan.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {plan.tagline}
                    </p>
                  </div>
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      background: isRec ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.05)',
                      border: isRec ? '1px solid rgba(37,99,235,0.2)' : '1px solid rgba(255,255,255,0.05)',
                    }}
                  >
                    {plan.icon}
                  </div>
                </div>

                {/* Price block */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-400">
                    {plan.period}
                  </div>
                </div>
                
                <div className="mb-8 text-xs font-medium text-slate-500">
                  {plan.target}
                </div>

                {/* CTA Button */}
                <Link
                  to={plan.ctaLink}
                  className="mb-8 flex w-full items-center justify-center rounded-xl py-3.5 text-sm font-bold transition-all duration-300"
                  style={{
                    background: isRec ? 'linear-gradient(90deg, #2563eb, #1d4ed8)' : 'rgba(255,255,255,0.05)',
                    color: '#ffffff',
                    border: isRec ? 'none' : '1px solid rgba(255,255,255,0.1)',
                    boxShadow: isRec ? '0 4px 15px rgba(37,99,235,0.3)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isRec) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                    if (isRec) (e.currentTarget as HTMLElement).style.boxShadow = '0 0 25px rgba(37,99,235,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isRec) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                    if (isRec) (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 15px rgba(37,99,235,0.3)';
                  }}
                >
                  {plan.cta}
                </Link>

                {/* Divider */}
                <div className="mb-6 h-px w-full" style={{ background: 'rgba(255,255,255,0.08)' }} />

                {/* Features List */}
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckIcon />
                      <span className="text-sm text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
