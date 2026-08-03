import { useState, useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthContext } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function Icon({ name, className = 'h-4 w-4' }: { name: 'building' | 'mail' | 'lock' | 'eye' | 'eyeOff' | 'arrow' | 'shield' | 'check' | 'users' | 'chart' | 'arrowRight' | 'arrowLeft' | 'calendar' | 'rupee' | 'clock' | 'crown' | 'user'; className?: string }) {
  const common = { className, fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2, viewBox: '0 0 24 24' };
  if (name === 'building') return <svg {...common}><path d="M8 21h8M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16" /></svg>;
  if (name === 'mail') return <svg {...common}><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m4 8 8 6 8-6" /></svg>;
  if (name === 'lock') return <svg {...common}><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" /></svg>;
  if (name === 'eye') return <svg {...common}><path d="M3 12.5c.75-4.32 4.5-7.62 9-7.62s8.25 3.3 9 7.62c-.75 4.32-4.5 7.62-9 7.62s-8.25-3.3-9-7.62Z" /><path d="M14.25 12.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>;
  if (name === 'eyeOff') return <svg {...common}><path d="m3 3 18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 5.09A10.45 10.45 0 0 1 12 4.88c4.5 0 8.25 3.3 9 7.62a10.2 10.2 0 0 1-2.22 4.44M6.12 6.12A10.7 10.7 0 0 0 3 12.5c.75 4.32 4.5 7.62 9 7.62 1.18 0 2.31-.23 3.35-.65" /></svg>;
  if (name === 'shield') return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>;
  if (name === 'crown') return <svg {...common}><path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14" /></svg>;
  if (name === 'user') return <svg {...common}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
  if (name === 'check') return <svg {...common}><polyline points="20 6 9 17 4 12" /></svg>;
  if (name === 'users') return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  if (name === 'chart') return <svg {...common}><path d="M3 3v18h18M18 9l-5 5-3-3-5 5" /></svg>;
  if (name === 'arrowRight') return <svg {...common}><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
  if (name === 'arrowLeft') return <svg {...common}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
  if (name === 'calendar') return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
  if (name === 'rupee') return <svg {...common}><path d="M6 3h12M6 8h12M6 13h8.5a3.5 3.5 0 1 0 0-7H6v15" /><path d="m14.5 13-8.5 8" /></svg>;
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
  return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, completeLoginSession, isLoading, error: apiError, clearError } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [role, setRole] = useState<'admin' | 'hr-manager' | 'employee'>('admin');

  // OTP 2FA State
  const [requiresOtp, setRequiresOtp] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { register, handleSubmit: hookFormSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { email: '', password: '' },
  });

  // Countdown timer for 30s resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const onSubmit = useCallback(async (data: LoginFormData) => {
    clearError();
    setOtpError(null);
    try {
      const res = await login(data, role);
      if (res && res.requiresOtp && res.tempToken) {
        setTempToken(res.tempToken);
        setRequiresOtp(true);
        setResendCooldown(30);
      }
    } catch (err: any) {
      if (err?.response?.data?.isUnverified) {
        const userEmail = err?.response?.data?.email || data.email;
        navigate(`/verify-account?email=${encodeURIComponent(userEmail)}`);
      }
    }
  }, [role, login, clearError, navigate]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempToken || !otpValue.trim()) {
      setOtpError('Please enter the 6-digit verification code');
      return;
    }

    setOtpLoading(true);
    setOtpError(null);

    try {
      const res = await authAPI.verifyOtp({ tempToken, otp: otpValue.trim() });
      if (res.data.success && res.data.token && res.data.user) {
        completeLoginSession(res.data.token, res.data.user);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Verification failed. Please try again.';
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!tempToken || resendCooldown > 0) return;
    setOtpError(null);
    setOtpLoading(true);
    try {
      const res = await authAPI.resendOtp({ tempToken });
      if (res.data.success) {
        setResendCooldown(30);
        setOtpError(null);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to resend code';
      setOtpError(msg);
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020817] font-sans selection:bg-blue-500/30 selection:text-blue-200">

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
        <div className="absolute top-[-20%] left-[-10%] h-[70vw] w-[70vw] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] h-[70vw] w-[70vw] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      {/* ── LEFT PANEL (ENTERPRISE BRANDING) ── */}
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 hidden flex-1 flex-col justify-between overflow-hidden border-r border-white/5 bg-transparent p-12 lg:flex xl:p-16"
      >
        <div className="relative max-w-lg">
          <div className="mb-14 flex flex-col items-start gap-2">
            <Link to="/" className="inline-flex items-center gap-3 transition-opacity hover:opacity-80">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] border border-white/10">
                <Icon name="building" className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold text-white tracking-tight">
                HRMS<span className="text-blue-500">Pro</span>
              </span>
            </Link>
            <div className="flex items-center gap-1.5 rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium text-slate-300">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
              Enterprise HR Suite <span className="px-0.5 text-slate-500">•</span> v1.0 Edition
            </div>
          </div>

          <h1 className="mb-6 text-[2.75rem] font-extrabold leading-[1.1] text-white tracking-tight">
            Manage your workforce <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              smarter
            </span>
          </h1>
          <p className="mb-10 text-lg text-slate-400 leading-relaxed font-medium">
            Admin-managed access with 2FA email verification for secure workforce & payroll administration.
          </p>

          <div className="space-y-6">
            {[
              { icon: 'shield', text: 'Enterprise-grade 2FA & RBAC protection' },
              { icon: 'check', text: 'Automated notification emails for all admin actions' },
              { icon: 'chart', text: 'Real-time attendance & payroll management' }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex items-center gap-4"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.1)]">
                  <Icon name={item.icon as any} className="h-5 w-5" />
                </div>
                <span className="text-base font-semibold text-slate-200">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="relative border-t border-white/5 pt-6 text-xs text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} HRMSPro Inc. All rights reserved.
        </div>
      </motion.aside>

      {/* ── RIGHT PANEL (LOGIN & OTP FORM) ── */}
      <section className="relative z-10 flex flex-1 items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Top Bar above card */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/"
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm font-semibold text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08] hover:text-white"
            >
              <Icon name="arrowLeft" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to Home
            </Link>

            <div className="hidden sm:flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-300">System Online <span className="text-slate-500 font-normal ml-1">99.99% Uptime</span></span>
            </div>
          </div>

          {/* Dark Glass Login / OTP Card */}
          <div className="rounded-[32px] border border-white/10 bg-slate-900/75 p-6 shadow-[0_0_60px_rgba(37,99,235,0.18)] backdrop-blur-xl sm:p-8">

            {requiresOtp ? (
              /* ── 2FA OTP SCREEN ── */
              <div className="space-y-5">
                <div className="mb-4 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Icon name="shield" className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">2-Factor Authentication</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Enter the 6-digit verification code sent to your email address.
                  </p>
                </div>

                {otpError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400 text-center">
                    {otpError}
                  </div>
                )}

                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                      placeholder="123456"
                      className="w-full tracking-[8px] text-center font-mono text-2xl font-bold text-blue-400 rounded-2xl border border-white/10 bg-slate-950 py-3.5 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading || otpValue.length < 6}
                    className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50"
                  >
                    {otpLoading ? 'Verifying Code...' : 'Verify Code & Sign In →'}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <button
                      type="button"
                      disabled={resendCooldown > 0 || otpLoading}
                      onClick={handleResendOtp}
                      className="font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                    </button>

                    <button
                      type="button"
                      onClick={() => { setRequiresOtp(false); setTempToken(null); setOtpValue(''); }}
                      className="text-slate-400 hover:text-white font-medium"
                    >
                      ← Back to login
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* ── STANDARD LOGIN SCREEN ── */
              <>
                <div className="mb-6 text-center sm:text-left">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Welcome back</h2>
                  <p className="mt-1.5 text-sm text-slate-400 font-medium">Sign in to your HRMSPro account</p>
                </div>

                {/* Role Selector Toggle */}
                <div className="mb-5 flex relative rounded-2xl bg-slate-950/50 p-1 border border-white/5 shadow-inner">
                  {['admin', 'hr-manager', 'employee'].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r as 'admin' | 'hr-manager' | 'employee')}
                      className={`relative z-10 flex-1 rounded-xl py-2 text-xs font-bold transition-colors duration-300 ${role === r ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-1.5">
                        {r === 'admin' && <Icon name="crown" className="h-3.5 w-3.5 text-amber-400" />}
                        {r === 'hr-manager' && <Icon name="shield" className="h-3.5 w-3.5 text-blue-400" />}
                        {r === 'employee' && <Icon name="user" className="h-3.5 w-3.5 text-emerald-400" />}
                        <span>{r === 'admin' ? 'Admin' : r === 'hr-manager' ? 'HR Manager' : 'Employee'}</span>
                      </span>
                      {role === r && (
                        <motion.div
                          layoutId="roleTab"
                          className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-white/10"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </button>
                  ))}
                </div>

                {apiError && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400 flex items-start gap-3 backdrop-blur-md">
                    <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    {apiError}
                  </motion.div>
                )}

                <form onSubmit={hookFormSubmit(onSubmit)} noValidate className="space-y-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-300">Email Address</span>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400"><Icon name="mail" /></span>
                      <input
                        {...register('email')}
                        type="email"
                        placeholder="you@company.com"
                        className={`w-full rounded-2xl border bg-slate-950 py-3 pl-11 pr-4 text-sm font-medium text-white transition-all outline-none placeholder:text-slate-600 focus:bg-slate-900 focus:ring-4 hover:border-white/20 ${errors.email ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'}`}
                      />
                    </div>
                    {errors.email && <span className="mt-1.5 block text-xs font-semibold text-red-500">{errors.email.message}</span>}
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-semibold text-slate-300">Password</span>
                    <div className="relative group">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400"><Icon name="lock" /></span>
                      <input
                        {...register('password')}
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        className={`w-full rounded-2xl border bg-slate-950 py-3 pl-11 pr-11 text-sm font-medium text-white transition-all outline-none placeholder:text-slate-600 focus:bg-slate-900 focus:ring-4 hover:border-white/20 ${errors.password ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : 'border-white/10 focus:border-blue-500/50 focus:ring-blue-500/20'}`}
                      />
                      <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                        <Icon name={showPassword ? 'eyeOff' : 'eye'} />
                      </button>
                    </div>
                    {errors.password && <span className="mt-1.5 block text-xs font-semibold text-red-500">{errors.password.message}</span>}
                  </label>

                  <div className="flex items-center justify-between pt-2">
                    <label className="flex cursor-pointer items-center gap-3">
                      <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="h-4 w-4 rounded border-white/10 bg-slate-900 text-blue-500 focus:ring-blue-500/30 focus:ring-offset-slate-900" />
                      <span className="text-sm font-medium text-slate-400 select-none">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors">
                      Forgot password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] disabled:pointer-events-none disabled:opacity-70"
                  >
                    {isLoading ? 'Signing in...' : `Continue as ${role === 'admin' ? 'Admin' : role === 'hr-manager' ? 'HR Manager' : 'Employee'} →`}
                  </button>

                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {[
                      { i: 'shield', t: '2FA Enabled' },
                      { i: 'check', t: 'RBAC Security' },
                      { i: 'building', t: 'Enterprise Ready' }
                    ].map(badge => (
                      <span key={badge.t} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-300">
                        <Icon name={badge.i as any} className="h-3 w-3 text-emerald-400" />
                        {badge.t}
                      </span>
                    ))}
                  </div>
                </form>
              </>
            )}

          </div>
        </motion.div>
      </section>
    </div>
  );
}
