import { useCallback, useMemo, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../../context/AuthContext';
import { hasErrors, validateRegisterForm } from '../../utils/validation';
import type { RegisterRequest } from '../../types';

type Step = 1 | 2 | 3;

function Icon({ name, className = 'h-4 w-4' }: { name: 'building' | 'mail' | 'lock' | 'eye' | 'eyeOff' | 'arrow' | 'shield' | 'check' | 'users' | 'chart' | 'arrowRight' | 'arrowLeft' | 'calendar' | 'rupee' | 'clock' | 'briefcase' | 'user' | 'badge'; className?: string }) {
  const common = { className, fill: 'none', stroke: 'currentColor', strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeWidth: 2, viewBox: '0 0 24 24' };
  if (name === 'building') return <svg {...common}><path d="M8 21h8M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16" /></svg>;
  if (name === 'mail') return <svg {...common}><rect x="4" y="6" width="16" height="12" rx="2" /><path d="m4 8 8 6 8-6" /></svg>;
  if (name === 'lock') return <svg {...common}><path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" /></svg>;
  if (name === 'eye') return <svg {...common}><path d="M3 12.5c.75-4.32 4.5-7.62 9-7.62s8.25 3.3 9 7.62c-.75 4.32-4.5 7.62-9 7.62s-8.25-3.3-9-7.62Z" /><path d="M14.25 12.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>;
  if (name === 'eyeOff') return <svg {...common}><path d="m3 3 18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 5.09A10.45 10.45 0 0 1 12 4.88c4.5 0 8.25 3.3 9 7.62a10.2 10.2 0 0 1-2.22 4.44M6.12 6.12A10.7 10.7 0 0 0 3 12.5c.75 4.32 4.5 7.62 9 7.62 1.18 0 2.31-.23 3.35-.65" /></svg>;
  if (name === 'shield') return <svg {...common}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" /></svg>;
  if (name === 'check') return <svg {...common}><polyline points="20 6 9 17 4 12" /></svg>;
  if (name === 'users') return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
  if (name === 'user') return <svg {...common}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" /></svg>;
  if (name === 'briefcase') return <svg {...common}><rect width="20" height="14" x="2" y="7" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>;
  if (name === 'arrowRight') return <svg {...common}><path d="M5 12h14M12 5l7 7-7 7" /></svg>;
  if (name === 'arrowLeft') return <svg {...common}><path d="M19 12H5M12 19l-7-7 7-7" /></svg>;
  if (name === 'clock') return <svg {...common}><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
  if (name === 'calendar') return <svg {...common}><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
  if (name === 'rupee') return <svg {...common}><path d="M6 3h12M6 8h12M6 13h8.5a3.5 3.5 0 1 0 0-7H6v15" /><path d="m14.5 13-8.5 8" /></svg>;
  if (name === 'badge') return <svg {...common}><path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" /><path d="m9 12 2 2 4-4" /></svg>;
  return <svg {...common}><path d="M5 12h14M13 5l7 7-7 7" /></svg>;
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading, error: apiError, clearError } = useAuthContext();
  const [step, setStep] = useState<Step>(1);
  const [role, setRole] = useState('HR Manager');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [form, setForm] = useState<RegisterRequest>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterRequest, string>>>({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (isSuccess) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              navigate(role === 'HR Manager' ? '/hr-dashboard' : '/employee-dashboard');
            }, 500); // slight delay at 100% before navigating
            return 100;
          }
          return prev + 5;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isSuccess, navigate, role]);

  // Frontend password strength logic
  const strength = useMemo(() => {
    let score = 0;
    if (form.password.length >= 8) score += 1;
    if (/[A-Z]/.test(form.password)) score += 1;
    if (/[0-9]/.test(form.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 1;
    return score;
  }, [form.password]);

  const has8Chars = form.password.length >= 8;
  const hasUpper = /[A-Z]/.test(form.password);
  const hasNumber = /[0-9]/.test(form.password);
  const hasSpecial = /[^A-Za-z0-9]/.test(form.password);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    clearError();
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, [clearError]);

  const continueFromAccount = useCallback(() => {
    const nextErrors: Partial<Record<keyof RegisterRequest, string>> = {};
    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required';
    if (!form.email.trim()) nextErrors.email = 'Work email is required';
    setErrors(nextErrors);
    if (!hasErrors(nextErrors)) setStep(2);
  }, [form.email, form.fullName]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    
    // Attempt registration
    try {
      await register({ ...form, role });
      setIsSuccess(true);
    } catch (err) {
      setIsSuccess(false);
    }
  }, [form, register]);

  const stepData = [
    { id: 1 as Step, label: 'Account' },
    { id: 2 as Step, label: 'Role' },
    { id: 3 as Step, label: 'Security' },
  ] as const;

  // Animation variants for form items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.1 } 
    },
    exit: { opacity: 0, x: -10 }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
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

      {/* ── LEFT PANEL ── */}
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
            Enterprise Workforce <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
              Management Reimagined
            </span>
          </h1>
          <p className="mb-10 text-lg text-slate-400 leading-relaxed font-medium">
            Create your account and unlock secure role-based access for HR managers and employees.
          </p>

          {/* RBAC Trust Badges */}
          <div className="flex flex-wrap items-center gap-3">
            {[
              { icon: 'check', text: 'SOC 2 Ready' },
              { icon: 'shield', text: 'AES-256 Encryption' },
              { icon: 'badge', text: 'RBAC Enabled' }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                className="flex items-center gap-2 rounded-full border border-blue-500/20 bg-white/5 px-3 py-1.5 shadow-[0_0_10px_rgba(37,99,235,0.05)] backdrop-blur-md"
              >
                <Icon name={item.icon as any} className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Dashboard Widgets */}
        <div className="absolute right-[-20%] top-[20%] flex flex-col gap-4 opacity-40 xl:right-[10%] xl:opacity-100 pointer-events-none">
          <motion.div 
            initial={{ x: 50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1, y: [-4, 4, -4] }} 
            transition={{ x: { delay: 0.5 }, opacity: { delay: 0.5 }, y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 0.5 } }} 
            className="w-64 translate-x-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)] pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400"><Icon name="users" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-400">Today's Attendance</div>
                  <div className="text-[10px] font-bold text-emerald-400">Live today</div>
                </div>
                <div className="mt-0.5 text-xl font-bold text-white">94.2%</div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-[94.2%] rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1, y: [-4, 4, -4] }} 
            transition={{ x: { delay: 0.6 }, opacity: { delay: 0.6 }, y: { repeat: Infinity, duration: 8, ease: "easeInOut", delay: 0.6 } }} 
            className="w-64 -translate-x-2 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_25px_rgba(59,130,246,0.15)] pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-blue-400"><Icon name="rupee" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-400">Payroll Processed</div>
                  <div className="text-[10px] font-bold text-blue-400">This month</div>
                </div>
                <div className="mt-0.5 flex items-center gap-2">
                  <div className="text-xl font-bold text-white">₹2.84 Cr</div>
                  <div className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">↑ 12%</div>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-[75%] rounded-full bg-gradient-to-r from-blue-600 to-indigo-500"></div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ x: 50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1, y: [-4, 4, -4] }} 
            transition={{ x: { delay: 0.7 }, opacity: { delay: 0.7 }, y: { repeat: Infinity, duration: 7, ease: "easeInOut", delay: 0.7 } }} 
            className="w-64 translate-x-2 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md transition-all duration-300 hover:shadow-[0_0_25px_rgba(245,158,11,0.15)] pointer-events-auto"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-400"><Icon name="calendar" /></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-slate-400">Pending Leaves</div>
                  <div className="text-[10px] font-bold text-amber-400">Needs review</div>
                </div>
                <div className="mt-0.5 text-xl font-bold text-white">18</div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full w-[40%] rounded-full bg-gradient-to-r from-amber-500 to-orange-500"></div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Testimonial Card */}
          <motion.div 
            initial={{ x: 50, opacity: 0 }} 
            animate={{ x: 0, opacity: 1, y: [-2, 2, -2] }} 
            transition={{ x: { delay: 0.8 }, opacity: { delay: 0.8 }, y: { repeat: Infinity, duration: 9, ease: "easeInOut", delay: 0.8 } }} 
            className="w-64 translate-x-1 mt-4 rounded-2xl border border-white/10 bg-slate-900/60 p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)] backdrop-blur-md pointer-events-auto"
          >
            <div className="flex gap-1 text-amber-400 mb-2 text-xs">★★★★★</div>
            <p className="text-xs font-medium text-slate-300 mb-3 italic">"HRMSPro reduced payroll processing time by 60%."</p>
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-400 border border-blue-500/30">SJ</div>
              <div>
                <div className="text-[10px] font-bold text-white tracking-wide">Sarah Johnson</div>
                <div className="text-[8px] text-slate-500 uppercase tracking-wider">HR Director</div>
              </div>
            </div>
          </motion.div>

        </div>

      </motion.aside>

      {/* ── RIGHT PANEL (REGISTER CARD) ── */}
      <section className="relative z-10 flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative w-full max-w-[560px]"
        >
          {/* Subtle Glow Behind Register Card */}
          <div className="absolute inset-0 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>

          {/* Top Bar above card */}
          <div className="mb-4 flex items-center justify-between">
            {/* Premium Back to Home Button */}
            <Link 
              to="/" 
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-sm font-semibold text-slate-300 shadow-[0_0_15px_rgba(0,0,0,0.1)] backdrop-blur-md transition-all duration-300 hover:bg-white/[0.08] hover:text-white"
            >
              <Icon name="arrowLeft" className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
              Back to Home
            </Link>

            {/* Floating Workspace Secure Badge */}
            <div className="hidden sm:flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900/60 px-3 py-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-slate-300">Workspace Secure</span>
              </div>
            </div>
          </div>

          {/* Dark Glass Register Card */}
          <div className="relative rounded-[32px] border border-white/10 bg-slate-900/75 p-6 shadow-[0_0_80px_rgba(37,99,235,0.18)] backdrop-blur-xl sm:p-8">
            
            {/* Horizontal Stepper inside card */}
            <div className="mb-6 flex items-center justify-between">
              {stepData.map((item, index) => {
                const complete = item.id < step;
                const current = item.id === step;
                return (
                  <div key={item.id} className="flex flex-1 items-center">
                    <motion.div layout className="flex flex-col items-center gap-2 sm:flex-row">
                      <motion.span 
                        initial={false}
                        animate={{
                          scale: current ? [1, 1.1, 1] : complete ? [1, 1.1, 1] : 1,
                          boxShadow: current ? '0 0 15px rgba(37,99,235,0.4)' : complete ? '0 0 15px rgba(34,197,94,0.4)' : 'none'
                        }}
                        transition={{ 
                          scale: { repeat: current ? Infinity : 0, duration: 2, ease: "easeInOut" },
                          boxShadow: { duration: 0.3 }
                        }}
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 border ${
                        complete ? 'border-emerald-500/40 bg-green-500 text-white' : 
                        current ? 'border-blue-500/50 bg-blue-600 text-white ring-2 ring-blue-600/20' : 
                        'border-white/10 bg-slate-800 text-slate-500'
                      }`}>
                        {complete ? <Icon name="check" className="h-4 w-4" /> : item.id}
                      </motion.span>
                      <span className={`text-xs font-bold tracking-wide transition-colors duration-500 ${current || complete ? 'text-white' : 'text-slate-500'}`}>
                        {item.label}
                      </span>
                    </motion.div>
                    {index < stepData.length - 1 && (
                      <div className="mx-1.5 sm:mx-2 h-px flex-1 bg-white/5 relative overflow-hidden">
                        <motion.div 
                          className="absolute inset-0 bg-green-500/50 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                          initial={{ x: '-100%' }}
                          animate={{ x: complete ? '0%' : '-100%' }}
                          transition={{ duration: 0.6, ease: "easeInOut" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div 
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[300px] flex-col items-center justify-center text-center"
                >
                  <div className="relative mb-6">
                    <div className="absolute inset-0 animate-ping rounded-full bg-green-500/20"></div>
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 text-green-400 shadow-[0_0_40px_rgba(34,197,94,0.3)]">
                      <Icon name="check" className="h-10 w-10" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Workspace Created</h2>
                  <p className="mt-2 text-sm font-medium text-slate-400">Welcome to HRMSPro</p>
                  
                  <div className="mt-8 w-full max-w-xs space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{progress < 25 ? 'Creating secure workspace...' : progress < 50 ? 'Configuring RBAC permissions...' : progress < 75 ? 'Preparing dashboard...' : progress < 100 ? 'Launching employee portal...' : 'Redirecting to Dashboard in 3 seconds...'}</span>
                      <span className="text-emerald-400">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800 shadow-inner">
                      <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-green-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] transition-all duration-200" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form 
                  key={`step-${step}`}
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {apiError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-medium text-red-400 flex items-start gap-3 backdrop-blur-md">
                      <svg className="h-5 w-5 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      {apiError}
                    </motion.div>
                  )}

                  {/* ── STEP 1 ── */}
                  {step === 1 && (
                    <>
                      <motion.label variants={itemVariants} className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-300">Full Name</span>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400"><Icon name="user" /></span>
                          <input
                            name="fullName"
                            value={form.fullName}
                            onChange={handleChange}
                            placeholder="John Doe"
                            className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3 pl-11 pr-4 text-sm font-medium text-white transition-all outline-none placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/20 hover:border-white/20"
                          />
                        </div>
                        {errors.fullName && <span className="mt-2 block text-xs font-semibold text-red-400">{errors.fullName}</span>}
                      </motion.label>

                      <motion.label variants={itemVariants} className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-300">Work Email</span>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400"><Icon name="mail" /></span>
                          <input
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="name@company.com"
                            className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3 pl-11 pr-4 text-sm font-medium text-white transition-all outline-none placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/20 hover:border-white/20"
                          />
                        </div>
                        {errors.email && <span className="mt-2 block text-xs font-semibold text-red-400">{errors.email}</span>}
                      </motion.label>

                      <motion.div variants={itemVariants} className="mt-6 flex flex-col items-center justify-end gap-4 pt-4 sm:flex-row">
                        <button
                          type="button"
                          onClick={continueFromAccount}
                          className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-8 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] sm:w-auto"
                        >
                          Continue <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      </motion.div>
                    </>
                  )}

                  {/* ── STEP 2 ── */}
                  {step === 2 && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <motion.button
                          variants={itemVariants}
                          type="button"
                          onClick={() => setRole('HR Manager')}
                          className={`group relative flex flex-col items-start rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                            role === 'HR Manager' 
                              ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_30px_rgba(37,99,235,0.2)] ring-1 ring-blue-500/50' 
                              : 'border-white/10 bg-slate-950/50 hover:border-blue-500/50 hover:bg-slate-900 hover:shadow-[0_0_30px_rgba(37,99,235,0.2)]'
                          }`}
                        >
                          {role === 'HR Manager' && <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />}
                          <h3 className={`text-lg font-bold mb-2 ${role === 'HR Manager' ? 'text-white' : 'text-slate-300'}`}>HR Manager</h3>
                          <p className="text-xs font-medium leading-relaxed text-slate-500 mb-4">Manage workforce operations and approvals.</p>
                          
                          <div className="grid grid-cols-2 gap-2 w-full mt-auto">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 rounded-md px-2 py-1"><span className="text-[14px]">👥</span> Employees</span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 rounded-md px-2 py-1"><span className="text-[14px]">💰</span> Payroll</span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 rounded-md px-2 py-1"><span className="text-[14px]">📊</span> Reports</span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 rounded-md px-2 py-1"><span className="text-[14px]">✅</span> Approvals</span>
                          </div>

                          <div className={`absolute right-4 top-4 h-5 w-5 rounded-full border-2 transition-colors ${role === 'HR Manager' ? 'border-blue-500 bg-blue-500/20' : 'border-slate-700 group-hover:border-slate-500'}`}>
                            {role === 'HR Manager' && <motion.div layoutId="roleCheck" className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-blue-500" />}
                          </div>
                        </motion.button>

                        <motion.button
                          variants={itemVariants}
                          type="button"
                          onClick={() => setRole('Employee')}
                          className={`group relative flex flex-col items-start rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 overflow-hidden ${
                            role === 'Employee' 
                              ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_30px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500/50' 
                              : 'border-white/10 bg-slate-950/50 hover:border-indigo-500/50 hover:bg-slate-900 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]'
                          }`}
                        >
                          {role === 'Employee' && <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />}
                          <h3 className={`text-lg font-bold mb-2 ${role === 'Employee' ? 'text-white' : 'text-slate-300'}`}>Employee</h3>
                          <p className="text-xs font-medium leading-relaxed text-slate-500 mb-4">Self-service employee workspace.</p>
                          
                          <div className="grid grid-cols-2 gap-2 w-full mt-auto">
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 rounded-md px-2 py-1"><span className="text-[14px]">🕒</span> Attendance</span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 rounded-md px-2 py-1"><span className="text-[14px]">🏖</span> Leave</span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 rounded-md px-2 py-1"><span className="text-[14px]">📄</span> Payslips</span>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 bg-white/5 rounded-md px-2 py-1"><span className="text-[14px]">👤</span> Profile</span>
                          </div>

                          <div className={`absolute right-4 top-4 h-5 w-5 rounded-full border-2 transition-colors ${role === 'Employee' ? 'border-indigo-500 bg-indigo-500/20' : 'border-slate-700 group-hover:border-slate-500'}`}>
                            {role === 'Employee' && <motion.div layoutId="roleCheck" className="absolute inset-0 m-auto h-2.5 w-2.5 rounded-full bg-indigo-500" />}
                          </div>
                        </motion.button>
                      </div>

                      <motion.div variants={itemVariants} className="mt-6 flex items-center justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 px-6 text-sm font-bold text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                        >
                          <Icon name="arrowLeft" className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back
                        </button>
                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="group relative flex items-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-8 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)]"
                        >
                          Continue <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </button>
                      </motion.div>
                    </>
                  )}

                  {/* ── STEP 3 ── */}
                  {step === 3 && (
                    <>
                      <motion.label variants={itemVariants} className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-300">Password</span>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400"><Icon name="lock" /></span>
                          <input
                            name="password"
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={handleChange}
                            placeholder="Create a strong password"
                            className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3 pl-11 pr-11 text-sm font-medium text-white transition-all outline-none placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/20 hover:border-white/20"
                          />
                          <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                            <Icon name={showPassword ? 'eyeOff' : 'eye'} />
                          </button>
                        </div>
                        
                        {/* Password Strength Meter */}
                        <div className="mt-4 rounded-xl border border-white/5 bg-slate-950/50 p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-400">Password Strength</span>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${strength < 2 ? 'text-red-500' : strength < 4 ? 'text-amber-500' : 'text-emerald-500'}`}>
                              {strength < 2 ? 'Weak' : strength < 4 ? 'Medium' : 'Strong'}
                            </span>
                          </div>
                          <div className="flex w-full gap-1.5 mb-4">
                            {[1, 2, 3, 4].map((item) => (
                              <div key={item} className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                                <motion.div 
                                  initial={false}
                                  animate={{ width: strength >= item ? '100%' : '0%' }}
                                  transition={{ duration: 0.3 }}
                                  className={`h-full rounded-full ${
                                    strength < 2 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 
                                    strength < 4 ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 
                                    'bg-gradient-to-r from-emerald-400 to-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]'
                                  }`} 
                                />
                              </div>
                            ))}
                          </div>
                          
                          {/* Live Checklist */}
                          <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-medium">
                            <span className={`flex items-center gap-2 transition-colors duration-300 ${has8Chars ? 'text-emerald-400' : 'text-red-400/80'}`}>
                              <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${has8Chars ? 'border-emerald-500/30 bg-emerald-500/20' : 'border-red-500/30 bg-red-500/10'}`}>
                                <Icon name="check" className="h-2.5 w-2.5" />
                              </span>
                              8+ Characters
                            </span>
                            <span className={`flex items-center gap-2 transition-colors duration-300 ${hasUpper ? 'text-emerald-400' : 'text-red-400/80'}`}>
                              <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${hasUpper ? 'border-emerald-500/30 bg-emerald-500/20' : 'border-red-500/30 bg-red-500/10'}`}>
                                <Icon name="check" className="h-2.5 w-2.5" />
                              </span>
                              Uppercase Letter
                            </span>
                            <span className={`flex items-center gap-2 transition-colors duration-300 ${hasNumber ? 'text-emerald-400' : 'text-red-400/80'}`}>
                              <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${hasNumber ? 'border-emerald-500/30 bg-emerald-500/20' : 'border-red-500/30 bg-red-500/10'}`}>
                                <Icon name="check" className="h-2.5 w-2.5" />
                              </span>
                              Number
                            </span>
                            <span className={`flex items-center gap-2 transition-colors duration-300 ${hasSpecial ? 'text-emerald-400' : 'text-red-400/80'}`}>
                              <span className={`flex h-4 w-4 items-center justify-center rounded-full border ${hasSpecial ? 'border-emerald-500/30 bg-emerald-500/20' : 'border-red-500/30 bg-red-500/10'}`}>
                                <Icon name="check" className="h-2.5 w-2.5" />
                              </span>
                              Special Character
                            </span>
                          </div>
                        </div>

                        {errors.password && <span className="mt-3 block text-xs font-semibold text-red-400">{errors.password}</span>}
                      </motion.label>

                      <motion.label variants={itemVariants} className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-300">Confirm Password</span>
                        <div className="relative group">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 transition-colors group-focus-within:text-blue-400"><Icon name="lock" /></span>
                          <input
                            name="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={form.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your password"
                            className="w-full rounded-2xl border border-white/10 bg-slate-950 py-3 pl-11 pr-11 text-sm font-medium text-white transition-all outline-none placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-slate-900 focus:ring-4 focus:ring-blue-500/20 hover:border-white/20"
                          />
                          <button type="button" onClick={() => setShowConfirmPassword(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                            <Icon name={showConfirmPassword ? 'eyeOff' : 'eye'} />
                          </button>
                        </div>
                        {errors.confirmPassword && <span className="mt-3 block text-xs font-semibold text-red-400">{errors.confirmPassword}</span>}
                      </motion.label>

                      <motion.div variants={itemVariants} className="mt-6 flex items-center justify-between pt-4">
                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="group flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 px-6 text-sm font-bold text-slate-300 transition-all duration-300 hover:bg-white/10 hover:text-white hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                        >
                          <Icon name="arrowLeft" className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Back
                        </button>
                        <button
                          type="submit"
                          disabled={isLoading}
                          className="group relative flex items-center gap-2 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600 to-indigo-600 py-3 px-8 text-sm font-bold text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(37,99,235,0.5)] disabled:pointer-events-none disabled:opacity-70"
                        >
                          {isLoading ? 'Creating...' : <>Create Secure Account <Icon name="arrowRight" className="h-4 w-4 transition-transform group-hover:translate-x-1" /></>}
                        </button>
                      </motion.div>
                    </>
                  )}
                  
                  {/* Global Form Footer (SignIn Link) */}
                  <motion.div variants={itemVariants} className="mt-4 border-t border-white/5 pt-5 text-center">
                    <p className="text-sm font-medium text-slate-400">
                      Already have an account?{' '}
                      <Link to="/login" className="font-bold text-blue-400 hover:text-blue-300 transition-colors">
                        Sign in instead &rarr;
                      </Link>
                    </p>
                  </motion.div>
                </motion.form>
              )}
            </AnimatePresence>

          </div>
        </motion.div>
      </section>
    </div>
  );
}
