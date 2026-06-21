import { Link } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function NotFoundPage() {
  const { user } = useAuthContext();

  const homeHref =
    user?.role === 'hr-manager'
      ? '/hr-dashboard'
      : user?.role === 'employee'
      ? '/employee-dashboard'
      : '/login';

  const homeLabel =
    user ? 'Go to Dashboard' : 'Go to Login';

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden"
      style={{ background: '#020817' }}
    >
      {/* Ambient glows — identical to dashboard pages */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-[20%] -top-[15%] h-[60vw] w-[60vw] rounded-full bg-blue-600/8 blur-[140px]" />
        <div className="absolute left-[20%] top-[40%] h-[40vw] w-[40vw] rounded-full bg-indigo-600/5 blur-[100px]" />
        <div className="absolute -bottom-[10%] -left-[10%] h-[40vw] w-[40vw] rounded-full bg-blue-800/6 blur-[120px]" />
      </div>

      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 mx-4 flex w-full max-w-md flex-col items-center gap-6 rounded-[24px] border border-white/[0.08] p-10 text-center"
        style={{
          background: 'rgba(255,255,255,0.02)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
        }}
      >
        {/* 404 badge */}
        <div
          className="flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(99,102,241,0.15) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
          }}
        >
          {/* Ghost / compass icon — simple SVG, no new icon libs */}
          <svg
            width="30" height="30" viewBox="0 0 24 24"
            fill="none" stroke="currentColor"
            strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
            className="text-blue-400"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" />
          </svg>
        </div>

        {/* Heading */}
        <div className="flex flex-col gap-2">
          <span
            className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-blue-400"
          >
            Error 404
          </span>
          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-white">
            Page Not Found
          </h1>
          <p className="text-sm leading-relaxed text-slate-400">
            The page you're looking for doesn't exist or has been moved.
            Double-check the URL or head back to safety.
          </p>
        </div>

        {/* Divider */}
        <div className="w-full border-t border-white/[0.06]" />

        {/* Actions */}
        <div className="flex w-full flex-col gap-3">
          <Link
            to={homeHref}
            className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
              boxShadow: '0 4px 16px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            {homeLabel}
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full rounded-xl border border-white/10 py-2.5 text-sm font-semibold text-slate-400 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
          >
            ← Go Back
          </button>
        </div>
      </div>

      {/* Subtle branding */}
      <p className="relative z-10 mt-8 text-xs font-medium tracking-widest text-slate-600 uppercase">
        HRMSPro · Enterprise HRMS &amp; Payroll
      </p>
    </div>
  );
}
