import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import GradientBackground from '../../components/GradientBackground';
import { useAuthContext } from '../../context/AuthContext';
import { validateField } from '../../utils/validation';
import type { LoginRequest } from '../../types';

function Icon({ name, className = 'h-4 w-4' }: { name: 'building' | 'mail' | 'lock' | 'eye' | 'eyeOff' | 'arrow' | 'shield'; className?: string }) {
  const common = { className, fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2, viewBox: '0 0 24 24' };
  if (name === 'building') return <svg {...common}><path d="M8 21h8M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16" /></svg>;
  if (name === 'mail') return <svg {...common}><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m4 8 8 6 8-6" /></svg>;
  if (name === 'lock') return <svg {...common}><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" /></svg>;
  if (name === 'eye') return <svg {...common}><path d="M3 12.5c.75-4.32 4.5-7.62 9-7.62s8.25 3.3 9 7.62c-.75 4.32-4.5 7.62-9 7.62s-8.25-3.3-9-7.62Z" /><path d="M14.25 12.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>;
  if (name === 'eyeOff') return <svg {...common}><path d="m3 3 18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 5.09A10.45 10.45 0 0 1 12 4.88c4.5 0 8.25 3.3 9 7.62a10.2 10.2 0 0 1-2.22 4.44M6.12 6.12A10.7 10.7 0 0 0 3 12.5c.75 4.32 4.5 7.62 9 7.62 1.18 0 2.31-.23 3.35-.65" /></svg>;
  if (name === 'shield') return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>;
  return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
}

export default function LoginPage() {
  const { login, loginAs, isLoading, error: apiError, clearError } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    clearError();
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, [clearError]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Partial<LoginRequest> = {};
    const emailError = validateField('email', form.email);
    const passwordError = validateField('password', form.password);
    if (emailError) nextErrors.email = emailError;
    if (passwordError) nextErrors.password = passwordError;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    void login(form);
  }, [form, login]);

  return (
    <GradientBackground className="flex">
      <aside className="hidden flex-1 items-center justify-center bg-slate-950 p-12 text-white lg:flex">
        <div className="max-w-md">
          <Link to="/" className="mb-10 flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600">
              <Icon name="building" className="h-6 w-6" />
            </span>
            <span>
              <span className="block text-xl font-bold">HRMSPro</span>
              <span className="block text-xs text-slate-400">Enterprise HR Suite</span>
            </span>
          </Link>

          <h1 className="text-4xl font-bold leading-tight">
            Manage your workforce <span className="text-blue-600">smarter</span>
          </h1>
          <p className="mt-4 text-base leading-7 text-slate-400">
            The complete HRMS solution for modern enterprises. Streamline HR, automate payroll, and empower your team.
          </p>

          <div className="mt-10 space-y-4">
            {['Enterprise-grade security & compliance', 'Automated payroll with zero errors', 'Real-time attendance & leave tracking'].map((item, index) => (
              <div key={item} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600/20 text-blue-500">
                  <Icon name={index === 0 ? 'shield' : 'arrow'} />
                </span>
                <span className="text-sm text-slate-200">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-sm italic text-slate-300">"Reduced our HR workload by 60% in the first month. Absolutely game-changing."</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">R</span>
              Rahul Sharma - HR Director, InfraTech
            </div>
          </div>
        </div>
      </aside>

      <section className="flex flex-1 items-center justify-center p-8">
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-950">Welcome back</h2>
            <p className="mt-1 text-sm text-slate-500">Sign in to your HRMSPro account</p>
          </div>

          {apiError && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{apiError}</div>}

          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</span>
              <span className="relative block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="mail" /></span>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@company.com" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-4 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
              </span>
              {errors.email && <span className="mt-1 block text-xs text-red-500">{errors.email}</span>}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-slate-700">Password</span>
              <span className="relative block">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Icon name="lock" /></span>
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Enter your password" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-sm text-slate-950 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} />
                </button>
              </span>
              {errors.password && <span className="mt-1 block text-xs text-red-500">{errors.password}</span>}
            </label>

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={remember} onChange={(event) => setRemember(event.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-blue-600" />
                <span className="text-sm text-slate-500">Remember me</span>
              </label>
              <button type="button" className="text-sm font-medium text-blue-600">Forgot password?</button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(37,99,235,0.3)] transition hover:bg-blue-700 disabled:opacity-70"
            >
              {isLoading ? 'Signing in...' : 'Sign In as HR Manager'}
            </button>

            {/* Quick-access demo buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => loginAs('hr')}
                className="flex-1 rounded-xl border border-blue-200 bg-blue-50 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
              >
                Demo: HR Manager
              </button>
              <button
                type="button"
                onClick={() => loginAs('employee')}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Demo: Employee
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Don't have an account? <Link to="/register" className="font-semibold text-blue-600">Sign up free</Link>
          </p>
        </form>
      </section>
    </GradientBackground>
  );
}
