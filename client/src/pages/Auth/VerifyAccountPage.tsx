import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '../../services/api';

export default function VerifyAccountPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const initialEmail = searchParams.get('email') || '';
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  // Cooldown countdown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!otp.trim() || otp.trim().length < 6) {
      setError('Please enter the 6-digit verification code');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await authAPI.verifyAccount({
        email: email.trim(),
        otp: otp.trim(),
      });

      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Email verified successfully!');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Verification failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email.trim() || cooldown > 0) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await authAPI.resendAccountVerification({ email: email.trim() });
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'A new verification code has been sent to your email.');
        setCooldown(30);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to resend code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#020817] font-sans selection:bg-blue-500/30 selection:text-blue-200">
      {/* Background glow */}
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

      <div className="relative z-10 flex flex-1 items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Top Bar */}
          <div className="mb-4 flex items-center justify-between">
            <Link
              to="/login"
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm font-semibold text-slate-300 backdrop-blur-md hover:bg-white/[0.08] hover:text-white transition-all"
            >
              ← Back to Sign In
            </Link>
          </div>

          {/* Verification Card */}
          <div className="rounded-[32px] border border-white/10 bg-slate-900/75 p-6 shadow-[0_0_60px_rgba(37,99,235,0.18)] backdrop-blur-xl sm:p-8">
            <div className="mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">Verify Your Account</h2>
              <p className="mt-1.5 text-xs text-slate-400 font-medium">
                Enter your registered email address and the 6-digit verification code sent to your inbox.
              </p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3.5 text-xs font-semibold text-red-400 text-center"
              >
                {error}
              </motion.div>
            )}

            {successMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3.5 text-xs font-semibold text-emerald-400 text-center"
              >
                {successMsg}
              </motion.div>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">6-Digit Verification Code</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full tracking-[8px] text-center font-mono text-2xl font-bold text-blue-400 rounded-2xl border border-white/10 bg-slate-950 py-3.5 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !otp || otp.length < 6}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.02] disabled:opacity-50"
              >
                {loading ? 'Verifying Account...' : 'Verify Account →'}
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  disabled={cooldown > 0 || loading || !email}
                  onClick={handleResend}
                  className="font-bold text-blue-400 hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                </button>

                <Link to="/login" className="text-slate-400 hover:text-white font-medium">
                  Proceed to Sign In
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
