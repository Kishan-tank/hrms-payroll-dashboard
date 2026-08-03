import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const emailSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});
type EmailFormData = z.infer<typeof emailSchema>;

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// ─── Helper Icons ────────────────────────────────────────────────────────────

function Icon({ name, className = 'h-4 w-4' }: { name: string; className?: string }) {
  const common = { className, fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2, viewBox: '0 0 24 24' };
  if (name === 'building') return <svg {...common}><path d="M8 21h8M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16" /></svg>;
  if (name === 'mail') return <svg {...common}><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m4 8 8 6 8-6" /></svg>;
  if (name === 'lock') return <svg {...common}><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" /></svg>;
  if (name === 'key') return <svg {...common}><circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6" /><path d="m15.5 7.5 3 3" /></svg>;
  if (name === 'eye') return <svg {...common}><path d="M3 12.5c.75-4.32 4.5-7.62 9-7.62s8.25 3.3 9 7.62c-.75 4.32-4.5 7.62-9 7.62s-8.25-3.3-9-7.62Z" /><path d="M14.25 12.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>;
  if (name === 'eyeOff') return <svg {...common}><path d="m3 3 18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 5.09A10.45 10.45 0 0 1 12 4.88c4.5 0 8.25 3.3 9 7.62a10.2 10.2 0 0 1-2.22 4.44M6.12 6.12A10.7 10.7 0 0 0 3 12.5c.75 4.32 4.5 7.62 9 7.62 1.18 0 2.31-.23 3.35-.65" /></svg>;
  if (name === 'arrowLeft') return <svg {...common}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
  if (name === 'shield') return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>;
  if (name === 'check') return <svg {...common}><polyline points="20 6 9 17 4 12" /></svg>;
  return <svg {...common}><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
}

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // Step state: 1 = Email, 2 = OTP, 3 = New Password
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resetToken, setResetToken] = useState('');

  // Step 1: Email Form
  const [emailLoading, setEmailLoading] = useState(false);
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    mode: 'onChange',
  });

  // Step 2: OTP Form
  const [otpValue, setOtpValue] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Step 3: Password Form
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Handler 1: Submit Email
  const onEmailSubmit = async (data: EmailFormData) => {
    if (emailLoading) return;
    setEmailLoading(true);
    try {
      const res = await authAPI.forgotPassword(data.email);
      setSubmittedEmail(data.email);
      toast.info(res.data.message || 'Verification code sent to your email.');
      setResendCooldown(30);
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send reset code');
    } finally {
      setEmailLoading(false);
    }
  };

  // Handler 2: Verify OTP
  const onOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpLoading || !otpValue.trim()) return;
    setOtpLoading(true);
    try {
      const res = await authAPI.verifyResetOtp({
        email: submittedEmail,
        otp: otpValue.trim(),
      });
      if (res.data.success && res.data.resetToken) {
        setResetToken(res.data.resetToken);
        toast.success('Code verified successfully! Please enter your new password.');
        setStep(3);
      } else {
        toast.error(res.data.message || 'Verification failed');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
    } finally {
      setOtpLoading(false);
    }
  };

  // Handler 2 (Resend): Resend Reset OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !submittedEmail) return;
    try {
      const res = await authAPI.resendResetOtp(submittedEmail);
      toast.info(res.data.message || 'New verification code sent');
      setResendCooldown(30);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    }
  };

  // Handler 3: Reset Password
  const onPasswordSubmit = async (data: ResetPasswordFormData) => {
    if (passwordLoading || !resetToken) return;
    setPasswordLoading(true);
    try {
      const res = await authAPI.resetPassword({
        resetToken,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      toast.success(res.data.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to reset password. Session may have expired.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-[#020817] font-sans text-slate-100 antialiased selection:bg-blue-500 selection:text-white">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-hidden z-0">
        <div className="absolute -left-[10%] -top-[10%] h-[45vw] w-[45vw] rounded-full bg-blue-600/10 blur-[120px]" />
        <div className="absolute left-[30%] top-[40%] h-[35vw] w-[35vw] rounded-full bg-indigo-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center p-6 sm:p-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Top Bar */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/login"
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm font-semibold text-slate-300 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08] hover:text-white"
            >
              <Icon name="arrowLeft" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to Login
            </Link>

            {/* Step Indicators */}
            <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 backdrop-blur-md">
              <span className={`h-2 w-2 rounded-full ${step >= 1 ? 'bg-blue-500' : 'bg-slate-700'}`} />
              <span className={`h-2 w-2 rounded-full ${step >= 2 ? 'bg-blue-500' : 'bg-slate-700'}`} />
              <span className={`h-2 w-2 rounded-full ${step >= 3 ? 'bg-blue-500' : 'bg-slate-700'}`} />
              <span className="ml-1 text-xs font-semibold text-slate-400">Step {step} of 3</span>
            </div>
          </div>

          {/* Glass Card */}
          <div className="rounded-[32px] border border-white/10 bg-slate-900/75 p-6 shadow-[0_0_60px_rgba(37,99,235,0.18)] backdrop-blur-xl sm:p-8">
            {/* ── STEP 1: EMAIL ENTRY ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Icon name="key" className="h-6 w-6" />
                  </div>
                  <h1 className="text-2xl font-bold text-white tracking-tight">Forgot Password?</h1>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    No problem. Enter your registered email address and we'll send you a 6-digit verification code.
                  </p>
                </div>

                <form onSubmit={handleSubmitEmail(onEmailSubmit)} className="space-y-4 pt-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Work Email Address
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Icon name="mail" className="h-4 w-4" />
                      </div>
                      <input
                        type="email"
                        {...registerEmail('email')}
                        placeholder="you@company.com"
                        className={`w-full rounded-xl border bg-slate-950/60 py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                          emailErrors.email ? 'border-red-500/50' : 'border-white/10'
                        }`}
                      />
                    </div>
                    {emailErrors.email && (
                      <p className="mt-1 text-xs text-red-400">{emailErrors.email.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-600/40 disabled:opacity-50"
                  >
                    {emailLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Sending Code...
                      </span>
                    ) : (
                      'Send Verification Code'
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* ── STEP 2: OTP VERIFICATION ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                    <Icon name="shield" className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Verify Reset Code</h2>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    We sent a 6-digit verification code to <span className="font-semibold text-blue-400">{submittedEmail}</span>.
                  </p>
                </div>

                <form onSubmit={onOtpSubmit} className="space-y-4 pt-2">
                  <div>
                    <label className="mb-1.5 block text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
                      6-Digit Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="w-full text-center tracking-[1em] font-mono text-2xl font-bold rounded-xl border border-white/10 bg-slate-950/60 py-3 text-blue-400 placeholder-slate-600 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={otpLoading || otpValue.length < 6}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition-all duration-200 hover:from-blue-500 hover:to-indigo-500 hover:shadow-blue-600/40 disabled:opacity-50"
                  >
                    {otpLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Verifying...
                      </span>
                    ) : (
                      'Verify Code'
                    )}
                  </button>
                </form>

                {/* Resend Cooldown */}
                <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-white/5">
                  <span className="text-slate-500">Didn't receive the code?</span>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendCooldown > 0}
                    className="text-blue-400 hover:underline disabled:opacity-50 disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 3: NEW PASSWORD ENTRY ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <Icon name="lock" className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Set New Password</h2>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
                    Choose a strong new password for your account.
                  </p>
                </div>

                <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4 pt-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      New Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Icon name="lock" className="h-4 w-4" />
                      </div>
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        {...registerPassword('newPassword')}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border bg-slate-950/60 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                          passwordErrors.newPassword ? 'border-red-500/50' : 'border-white/10'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white"
                      >
                        <Icon name={showNewPassword ? 'eyeOff' : 'eye'} className="h-4 w-4" />
                      </button>
                    </div>
                    {passwordErrors.newPassword && (
                      <p className="mt-1 text-xs text-red-400">{passwordErrors.newPassword.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                        <Icon name="lock" className="h-4 w-4" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        {...registerPassword('confirmPassword')}
                        placeholder="••••••••"
                        className={`w-full rounded-xl border bg-slate-950/60 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 outline-none transition duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${
                          passwordErrors.confirmPassword ? 'border-red-500/50' : 'border-white/10'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-white"
                      >
                        <Icon name={showConfirmPassword ? 'eyeOff' : 'eye'} className="h-4 w-4" />
                      </button>
                    </div>
                    {passwordErrors.confirmPassword && (
                      <p className="mt-1 text-xs text-red-400">{passwordErrors.confirmPassword.message}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/25 transition-all duration-200 hover:from-emerald-500 hover:to-teal-500 hover:shadow-emerald-600/40 disabled:opacity-50"
                  >
                    {passwordLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Saving Password...
                      </span>
                    ) : (
                      'Save & Update Password'
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}