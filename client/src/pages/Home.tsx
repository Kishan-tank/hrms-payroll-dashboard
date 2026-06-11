import { Link } from 'react-router-dom';
import GradientBackground from '../components/GradientBackground';

const features = [
  { icon: 'EM', title: 'Employee Management', desc: 'Centralized employee profiles, documents, and lifecycle management with real-time updates.' },
  { icon: 'AT', title: 'Attendance & Time', desc: 'Automated attendance tracking with shift visibility and daily workforce availability.' },
  { icon: 'PR', title: 'Payroll Automation', desc: 'End-to-end payroll progress, compliance checkpoints, and review-ready batches.' },
  { icon: 'RP', title: 'Analytics & Reports', desc: 'Comprehensive dashboards with real-time workforce insights and export-ready summaries.' },
  { icon: 'SC', title: 'Compliance & Security', desc: 'Role-based access patterns and enterprise-ready data handling for HR teams.' },
  { icon: 'MB', title: 'Multi-Branch Support', desc: 'Manage multiple offices, departments, and regions from one unified platform.' },
];

const benefits = [
  'Reduce payroll errors by 99.2%',
  'Save 40+ hours per month on HR tasks',
  'Real-time attendance visibility',
  'Mobile-first employee self-service',
  'Role-ready HR and employee dashboards',
  'Reusable frontend design system',
];

const stats = [
  { label: 'Companies', value: '2,500+' },
  { label: 'Employees Managed', value: '1.2M+' },
  { label: 'Payroll Processed', value: 'Rs. 4.8B+' },
  { label: 'Uptime SLA', value: '99.99%' },
];

export default function Home() {
  return (
    <GradientBackground>
      <nav className="sticky top-0 z-50 border-b border-blue-100/70 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold text-white">H</span>
            <span className="text-lg font-bold text-slate-950">HRMSPro</span>
          </Link>
          <div className="ml-8 hidden items-center gap-6 lg:flex">
            {['Features', 'Pricing', 'Solutions', 'Enterprise'].map((item) => (
              <a key={item} href="#features" className="text-sm font-semibold text-slate-500 hover:text-blue-600">
                {item}
              </a>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/login" className="rounded-xl px-4 py-2 text-sm font-semibold text-blue-600">
              Sign In
            </Link>
            <Link to="/register" className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-16 text-center sm:px-6 lg:pt-20">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-bold text-blue-600">
          <span className="h-2 w-2 rounded-full bg-blue-600" />
          Enterprise-Grade HRMS Platform - Now with smart automation
        </div>
        <h1 className="mx-auto max-w-4xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
          Transform Your <span className="text-blue-600">HR & Payroll</span> Operations Effortlessly
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-500">
          The complete enterprise HRMS platform that modernizes payroll, attendance, leave management, and compliance while keeping daily HR work simple.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link to="/dashboard/hr" className="rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700">
            View Dashboard -&gt;
          </Link>
          <Link to="/register" className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-bold text-slate-950 hover:bg-slate-50">
            Start Free Trial
          </Link>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-slate-950">{item.value}</p>
              <p className="mt-1 text-xs font-semibold text-slate-400">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-950">Everything Your HR Team Needs</h2>
          <p className="mt-3 text-slate-500">A unified platform that scales from small teams to enterprise operations.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
              <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600">
                {feature.icon}
              </span>
              <h3 className="font-bold text-slate-950">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid items-center gap-10 rounded-3xl bg-slate-950 p-8 sm:p-12 lg:grid-cols-[1fr_360px]">
          <div>
            <h2 className="text-3xl font-bold text-white">Why 2,500+ Companies Choose HRMSPro</h2>
            <p className="mt-4 max-w-2xl leading-7 text-slate-400">
              A single workspace for people operations, payroll, reports, and employee self-service.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] text-white">OK</span>
                  {benefit}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="mb-4 text-sm font-semibold text-slate-400">Dashboard Preview</div>
            <div className="space-y-3">
              {[
                ['Employees', '256', '#2563eb'],
                ['Attendance Rate', '94.2%', '#22c55e'],
                ['May Payroll', 'Rs. 48.2L', '#8b5cf6'],
              ].map(([label, value, color]) => (
                <div key={label} className="rounded-xl bg-white p-4">
                  <p className="text-xs font-semibold text-slate-400">{label}</p>
                  <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
                  <div className="mt-3 h-1.5 rounded-full bg-slate-100">
                    <div className="h-1.5 w-3/4 rounded-full" style={{ backgroundColor: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-3xl font-bold text-slate-950">Ready to modernize your HRMS workflow?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500">
            Start with the dashboard experience and connect your real HRMS data as your backend grows.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/dashboard/hr" className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
              Open Dashboard
            </Link>
            <Link to="/login" className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-bold text-slate-950 hover:bg-slate-50">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:px-6 md:flex-row">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">H</span>
            <span className="font-bold text-slate-950">HRMSPro</span>
          </Link>
          <p className="text-center text-sm text-slate-500">(c) 2026 HRMSPro. Enterprise HRMS dashboard UI.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Security'].map((item) => (
              <a key={item} href="#" className="text-sm font-semibold text-slate-500 hover:text-slate-950">
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </GradientBackground>
  );
}
