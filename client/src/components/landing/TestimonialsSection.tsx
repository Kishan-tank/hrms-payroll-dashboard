import { useState, useEffect, useRef } from 'react';

/* ── Data ───────────────────────────────────────────────── */
const impactMetrics = [
  { value: '40%', label: 'Average reduction in HR admin time' },
  { value: '99.7%', label: 'Payroll accuracy rate' },
  { value: '4.9/5', label: 'Customer satisfaction score' },
  { value: '< 2 hrs', label: 'Average onboarding time' },
];

const testimonials = [
  {
    id: 1,
    name: 'Kavitha Rajan',
    role: 'CHRO',
    company: 'Infovance Technologies',
    city: 'Bangalore',
    initial: 'K',
    color: '#2563eb', // blue
    quote: '"HRMSPro completely transformed how we handle payroll for our 800+ person team. What used to take 3 days now takes 2 hours. Payroll accuracy improved dramatically and our finance team finally has peace of mind."',
    badge: '3 days → 2 hours',
  },
  {
    id: 2,
    name: 'Amit Desai',
    role: 'HR Director',
    company: 'NovaStar Retail',
    city: 'Mumbai',
    initial: 'A',
    color: '#7c3aed', // violet
    quote: '"Recruitment and onboarding workflows became 60% faster after adopting HRMSPro. We can now focus on finding the right talent rather than drowning in paperwork and manual data entry."',
    badge: '60% faster hiring',
  },
  {
    id: 3,
    name: 'Preethi Subramaniam',
    role: 'VP People Operations',
    company: 'Meridian Logistics',
    city: 'Chennai',
    initial: 'P',
    color: '#059669', // emerald
    quote: '"Attendance analytics helped us reduce absenteeism by 34% across multiple locations. The real-time visibility into workforce deployment has been a game changer for our operations managers."',
    badge: '34% less absenteeism',
  },
  {
    id: 4,
    name: 'Rajesh Nambiar',
    role: 'Director HR',
    company: 'Clearview EdTech',
    city: 'Delhi',
    initial: 'R',
    color: '#d97706', // amber
    quote: '"The employee self-service portal reduced HR helpdesk tickets by 70%. Employees now have instant access to their payslips, leave balances, and tax documents from their mobile phones."',
    badge: '70% fewer tickets',
  },
];

function StarIcon() {
  return (
    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="m12 2.5 2.9 6 6.6.95-4.75 4.65 1.1 6.55L12 17.55l-5.85 3.1 1.1-6.55L2.5 9.45l6.6-.95z" />
    </svg>
  );
}

/* ── Main Component ─────────────────────────────────────── */
export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeTestimonial = testimonials[activeIndex];

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 6000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, activeIndex]);

  return (
    <section className="relative overflow-hidden py-16" style={{ background: '#020617' }}>
      {/* Background glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full"
        style={{
          background: 'radial-gradient(ellipse, rgba(37,99,235,0.08) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* ── Section header ── */}
        <div className="mb-10 text-center">
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400"
            style={{ background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)' }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
            Customer Stories
          </div>

          <h2 className="mb-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl lg:text-[2.6rem]">
            Trusted by HR Teams{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, #60a5fa 0%, #a78bfa 60%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Across India
            </span>
          </h2>

          <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-400">
            Thousands of HR professionals use HRMSPro to automate payroll, streamline workforce management, improve compliance, and deliver exceptional employee experiences.
          </p>
        </div>

        {/* ── ROW 1: IMPACT METRICS ── */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {impactMetrics.map((metric, idx) => (
            <div
              key={idx}
              className="group flex flex-col items-center justify-center rounded-2xl px-4 py-5 text-center transition-all duration-300 hover:-translate-y-1.5"
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(37,99,235,0.3)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 0 20px rgba(37,99,235,0.15), 0 8px 30px rgba(0,0,0,0.4)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                (e.currentTarget as HTMLElement).style.border = '1px solid rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.2)';
              }}
            >
              <div className="mb-1 text-3xl font-extrabold text-white transition-colors duration-300 group-hover:text-blue-400">
                {metric.value}
              </div>
              <div className="text-xs font-medium text-slate-400 group-hover:text-slate-300">
                {metric.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── ROW 2: FEATURED TESTIMONIAL SLIDER ── */}
        <div
          className="overflow-hidden rounded-3xl"
          style={{
            background: 'rgba(15,23,42,0.6)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            backdropFilter: 'blur(12px)',
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="flex flex-col lg:flex-row">
            
            {/* Left Side: Active Testimonial */}
            <div className="relative flex-1 p-5 sm:p-8 lg:p-10">
              <div
                className="absolute inset-0 opacity-20 transition-colors duration-700"
                style={{
                  background: `radial-gradient(circle at top left, ${activeTestimonial.color}, transparent 60%)`,
                }}
              />
              
              <div
                key={activeTestimonial.id}
                className="relative z-10 animate-fade-in-up"
                style={{ animationDuration: '0.4s' }}
              >
                <div className="mb-6 flex text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <StarIcon key={s} />
                  ))}
                </div>

                <h3 className="mb-8 text-xl font-medium leading-relaxed text-white sm:text-2xl lg:leading-snug">
                  {activeTestimonial.quote}
                </h3>

                <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold"
                  style={{
                    background: `${activeTestimonial.color}20`,
                    color: activeTestimonial.color,
                    border: `1px solid ${activeTestimonial.color}40`,
                  }}
                >
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: activeTestimonial.color }} />
                  {activeTestimonial.badge}
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white shadow-lg"
                    style={{ backgroundColor: activeTestimonial.color }}
                  >
                    {activeTestimonial.initial}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">{activeTestimonial.name}</div>
                    <div className="text-sm text-slate-400">
                      {activeTestimonial.role}, {activeTestimonial.company}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{activeTestimonial.city}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Customer List */}
            <div
              className="w-full border-t lg:w-80 lg:border-l lg:border-t-0"
              style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.2)' }}
            >
              <div className="p-5">
                <h4 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                  Featured Customers
                </h4>
                <div className="flex flex-col gap-2">
                  {testimonials.map((t, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                      <button
                        key={t.id}
                        onClick={() => setActiveIndex(idx)}
                        className={`flex items-center gap-3 rounded-xl p-3 text-left transition-all duration-300 ${
                          isActive ? 'bg-white/10 shadow-md' : 'hover:bg-white/5'
                        }`}
                        style={{
                          border: isActive ? `1px solid ${t.color}50` : '1px solid transparent',
                        }}
                      >
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white transition-transform duration-300"
                          style={{
                            backgroundColor: isActive ? t.color : '#334155',
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                          }}
                        >
                          {t.initial}
                        </div>
                        <div className="overflow-hidden">
                          <div className={`truncate text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>
                            {t.name}
                          </div>
                          <div className="truncate text-xs text-slate-500">{t.company}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── SLIDER CONTROLS ── */}
        <div className="mt-8 flex items-center justify-center gap-6">
          <button
            onClick={prevSlide}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-white text-slate-400"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Previous testimonial"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="flex gap-2">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveIndex(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  activeIndex === idx ? 'w-6 bg-blue-500' : 'w-2 bg-slate-600 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={nextSlide}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10 hover:text-white text-slate-400"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            aria-label="Next testimonial"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

      </div>
    </section>
  );
}
