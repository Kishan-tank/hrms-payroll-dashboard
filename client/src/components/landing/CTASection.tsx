import { Link } from 'react-router-dom';

export default function CTASection() {
  return (
    <section className="relative overflow-hidden py-24" style={{ background: '#020617' }}>
      {/* Background Grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      
      {/* Subtle glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)', filter: 'blur(60px)' }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div
          className="animate-fade-in-up relative flex flex-col items-center justify-between gap-12 overflow-hidden rounded-[32px] p-8 sm:p-12 lg:flex-row lg:p-16"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(59,130,246,0.18)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Inner ambient glow for the panel itself */}
          <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #60a5fa, transparent 70%)', filter: 'blur(40px)' }} />
          
          {/* Left Side */}
          <div className="relative z-10 flex-1 lg:max-w-xl">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-blue-400"
              style={{ border: '1px solid rgba(59,130,246,0.2)', background: 'rgba(59,130,246,0.1)' }}
            >
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-400" />
              READY TO SCALE
            </div>

            <h2 className="mb-6 text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl lg:leading-tight">
              Ready to Modernize Your Workforce?
            </h2>

            <p className="text-base leading-relaxed text-slate-400 sm:text-lg">
              Join 2,500+ organizations using HRMSPro to automate payroll, attendance, compliance, and employee operations from a single platform.
            </p>
          </div>

          {/* Right Side */}
          <div className="relative z-10 flex w-full flex-col gap-6 lg:w-auto">
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                to="/register"
                className="inline-flex w-full items-center justify-center rounded-xl px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:-translate-y-1 sm:w-auto"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  boxShadow: '0 4px 20px rgba(37,99,235,0.4)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 0 25px rgba(37,99,235,0.6)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(37,99,235,0.4)';
                }}
              >
                Start Free Trial
              </Link>
              <a
                href="#"
                className="inline-flex w-full items-center justify-center rounded-xl px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white/5 sm:w-auto"
                style={{ border: '1px solid rgba(255,255,255,0.15)' }}
              >
                Book Live Demo
              </a>
            </div>

            <div className="flex flex-col gap-3 text-sm font-medium text-slate-400 sm:grid sm:grid-cols-2">
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7"/></svg>
                No Credit Card Required
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7"/></svg>
                14-Day Free Trial
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7"/></svg>
                Setup in Under 10 Minutes
              </span>
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7"/></svg>
                Enterprise Security
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
