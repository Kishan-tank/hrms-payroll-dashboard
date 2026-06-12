import { Link } from 'react-router-dom';
import GradientBackground from '../components/GradientBackground';

type IconName = 'building' | 'users' | 'clock' | 'dollar' | 'chart' | 'shield' | 'globe' | 'zap' | 'check' | 'arrow' | 'star' | 'lock' | 'chevron';

const features: Array<{ icon: IconName; title: string; desc: string }> = [
  { icon: 'users', title: 'Employee Management', desc: 'Centralized employee profiles, documents, and lifecycle management with real-time updates.' },
  { icon: 'clock', title: 'Attendance & Time', desc: 'Automated attendance tracking with biometric integration, geo-fencing, and shift management.' },
  { icon: 'dollar', title: 'Payroll Automation', desc: 'End-to-end payroll processing with tax calculations, compliance, and direct bank transfers.' },
  { icon: 'chart', title: 'Analytics & Reports', desc: 'Comprehensive dashboards with real-time workforce insights, trends, and exportable reports.' },
  { icon: 'shield', title: 'Compliance & Security', desc: 'Built-in labor law compliance, role-based access control, and enterprise-grade encryption.' },
  { icon: 'globe', title: 'Multi-Branch Support', desc: 'Manage multiple offices, departments, and regions from a single unified platform.' },
];

const benefits = [
  'Reduce payroll errors by 99.2%',
  'Save 40+ hours per month on HR tasks',
  'Real-time compliance monitoring',
  'Seamless integration with ERP systems',
  'Mobile-first employee self-service',
  '24/7 automated report generation',
];

const stats = [
  { label: 'Companies', value: '2,500+' },
  { label: 'Employees Managed', value: '1.2M+' },
  { label: 'Payroll Processed', value: '₹4.8B+' },
  { label: 'Uptime SLA', value: '99.99%' },
];

function Icon({ name, className = 'h-5 w-5' }: { name: IconName; className?: string }) {
  const common = { className, fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2, viewBox: '0 0 24 24' };
  if (name === 'building') return <svg {...common}><path d="M8 21h8M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16" /></svg>;
  if (name === 'users') return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>;
  if (name === 'dollar') return <svg {...common}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" /></svg>;
  if (name === 'chart') return <svg {...common}><path d="M4 19V5M9 19V9M14 19V7M19 19v-5M3 19h18" /></svg>;
  if (name === 'shield') return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>;
  if (name === 'globe') return <svg {...common}><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20" /></svg>;
  if (name === 'zap') return <svg {...common}><path d="M13 2 3 14h8l-1 8 11-14h-8z" /></svg>;
  if (name === 'check') return <svg {...common}><path d="m5 13 4 4L19 7" /></svg>;
  if (name === 'arrow') return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
  if (name === 'star') return <svg className={className} fill="currentColor" stroke="currentColor" viewBox="0 0 24 24"><path d="m12 2.5 2.9 6 6.6.95-4.75 4.65 1.1 6.55L12 17.55l-5.85 3.1 1.1-6.55L2.5 9.45l6.6-.95z" /></svg>;
  if (name === 'lock') return <svg {...common}><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" /></svg>;
  return <svg {...common}><path d="m9 18 6-6-6-6" /></svg>;
}

export default function Home() {
  return (
    <GradientBackground>
      <nav className="sticky top-0 z-50 border-b border-blue-600/[0.08] bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Icon name="building" />
            </span>
            <span className="text-lg font-bold text-slate-950">HRMSPro</span>
          </Link>
          <div className="ml-8 hidden items-center gap-6 lg:flex">
            {['Features', 'Pricing', 'Solutions', 'Enterprise'].map((item) => (
              <a key={item} href={item === 'Features' ? '#features' : '#'} className="text-sm font-medium text-slate-500 transition-colors hover:text-blue-600">
                {item}
              </a>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-medium text-blue-600 transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:opacity-90">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-20 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-600/[0.08] px-4 py-1.5 text-xs font-semibold text-blue-600">
          <Icon name="zap" className="h-3 w-3" />
          Enterprise-Grade HRMS Platform - Now with AI Automation
        </div>
        <h1 className="mx-auto mb-6 max-w-4xl text-5xl font-bold leading-tight text-slate-950">
          Transform Your <span className="text-blue-600">HR & Payroll</span><br />Operations Effortlessly
        </h1>
        <p className="mx-auto mb-10 max-w-2xl text-lg text-slate-500">
          The complete enterprise HRMS platform that automates payroll, attendance, leave management, and compliance - saving time and eliminating errors.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 font-semibold text-white shadow-[0_8px_24px_rgba(37,99,235,0.35)] transition hover:opacity-90">
            View Dashboard <Icon name="arrow" className="h-[18px] w-[18px]" />
          </Link>
          <Link to="/register" className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3.5 font-semibold text-slate-950 transition hover:bg-slate-50">
            Start Free Trial <Icon name="chevron" className="h-[18px] w-[18px]" />
          </Link>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(({ label, value }) => (
            <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="text-2xl font-bold text-slate-950">{value}</div>
              <div className="mt-1 text-xs text-slate-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold text-slate-950">Everything Your HR Team Needs</h2>
          <p className="text-base text-slate-500">A unified platform that scales with your organization from 10 to 100,000+ employees.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon, title, desc }) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600/[0.08] text-blue-600">
                <Icon name={icon} className="h-[22px] w-[22px]" />
              </div>
              <h3 className="mb-2 font-semibold text-slate-950">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-500">{desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="flex flex-col gap-12 rounded-3xl bg-slate-950 p-12 lg:flex-row lg:items-center">
          <div className="flex-1">
            <h2 className="mb-4 text-3xl font-bold text-white">Why 2,500+ Companies Choose HRMSPro</h2>
            <p className="mb-8 text-base text-slate-400">Join the world's fastest-growing enterprise HR platform trusted by Fortune 500 companies.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2">
                  <span className="text-green-500"><Icon name="check" className="h-4 w-4" /></span>
                  <span className="text-sm text-slate-200">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full shrink-0 lg:w-72">
            <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex text-amber-500">
                  {[1, 2, 3, 4, 5].map((item) => <Icon key={item} name="star" className="h-4 w-4" />)}
                </span>
                <span className="text-sm text-slate-400">5.0/5.0</span>
              </div>
              <p className="mb-4 text-sm italic text-slate-200">
                "HRMSPro reduced our payroll processing time by 80% and virtually eliminated errors. It's the best investment we've made."
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">S</div>
                <div>
                  <div className="text-sm font-semibold text-white">Sarah Mitchell</div>
                  <div className="text-xs text-slate-400">VP of HR, TechCorp Global</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16 text-center">
        <div className="rounded-3xl border border-blue-600/[0.12] bg-blue-600/[0.04] p-16">
          <h2 className="mb-4 text-3xl font-bold text-slate-950">Ready to Transform Your HR Operations?</h2>
          <p className="mx-auto mb-8 max-w-xl text-base text-slate-500">Start your 30-day free trial today. No credit card required. Full access to all features.</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/register" className="rounded-xl bg-blue-600 px-8 py-3.5 font-semibold text-white transition hover:opacity-90">
              Start Free Trial
            </Link>
            <a href="#" className="rounded-xl border border-slate-200 bg-white px-8 py-3.5 font-semibold text-slate-950">
              Schedule Demo
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-6 py-10 lg:flex-row">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Icon name="building" className="h-4 w-4" />
            </span>
            <span className="font-bold text-slate-950">HRMSPro</span>
          </Link>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            {['Privacy Policy', 'Terms of Service', 'Security', 'Contact'].map((item) => (
              <a key={item} href="#" className="transition-colors hover:text-blue-600">{item}</a>
            ))}
          </div>
          <div className="flex items-center gap-1 text-sm text-slate-400">
            <Icon name="lock" className="h-3 w-3" /> © 2026 HRMSPro. All rights reserved.
          </div>
        </div>
      </footer>
    </GradientBackground>
  );
}
