import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasErrors, validateRegisterForm } from '../../utils/validation';
import type { RegisterRequest } from '../../types';

type Step = 1 | 2 | 3;

const roles = ['HR Manager', 'Employee', 'Payroll Admin', 'Department Head', 'System Admin'];

function BuildingIcon() {
  return (
    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21h8M9 8h1m-1 4h1m-1 4h1m4-8h1m-1 4h1m-1 4h1M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16M4 21h16" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 7.5a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 20.25a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16v12H4z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m4 7 8 6 8-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" />
    </svg>
  );
}

function EyeIcon({ hidden }: { hidden?: boolean }) {
  return hidden ? (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m3 3 18 18M10.58 10.58a2 2 0 0 0 2.83 2.83M9.88 5.09A10.45 10.45 0 0 1 12 4.88c4.5 0 8.25 3.3 9 7.62a10.2 10.2 0 0 1-2.22 4.44M6.12 6.12A10.7 10.7 0 0 0 3 12.5c.75 4.32 4.5 7.62 9 7.62 1.18 0 2.31-.23 3.35-.65" />
    </svg>
  ) : (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12.5c.75-4.32 4.5-7.62 9-7.62s8.25 3.3 9 7.62c-.75 4.32-4.5 7.62-9 7.62s-8.25-3.3-9-7.62Z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.25 12.5a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
    </svg>
  );
}

export default function RegisterPage() {
  const { register, isLoading, error: apiError, clearError } = useAuth();
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

  const strength = useMemo(() => {
    let score = 0;
    if (form.password.length >= 8) score += 1;
    if (/[A-Z]/.test(form.password)) score += 1;
    if (/[0-9]/.test(form.password)) score += 1;
    if (/[^A-Za-z0-9]/.test(form.password)) score += 1;
    return score;
  }, [form.password]);

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

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    register(form);
  }, [form, register]);

  const stepData = [
    { id: 1, label: 'Account Info' },
    { id: 2, label: 'Role & Access' },
    { id: 3, label: 'Security' },
  ] as const;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_0%_0%,#ecfdf5_0%,transparent_34%),radial-gradient(circle_at_100%_0%,#dbeafe_0%,transparent_34%),linear-gradient(180deg,#eff6ff_0%,#f8fbff_100%)] px-4 py-8 sm:px-8 lg:px-12">
      <section className="grid min-h-[690px] w-full max-w-[1280px] overflow-hidden rounded-[28px] bg-white shadow-[0_32px_90px_rgba(15,23,42,0.18)] lg:grid-cols-[400px_1fr]">
        <aside className="bg-slate-950 px-12 py-12 text-white">
          <Link to="/" className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <BuildingIcon />
            </span>
            <span className="text-2xl font-bold tracking-tight">HRMSPro</span>
          </Link>

          <div className="mt-20">
            <h1 className="max-w-[260px] text-3xl font-bold leading-tight tracking-tight text-white">
              Join thousands of enterprises
            </h1>
            <p className="mt-6 max-w-[290px] text-lg leading-7 text-slate-300">
              Create your account and start managing your workforce smarter today.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {stepData.map((item, index) => {
              const complete = item.id < step;
              const current = item.id === step;
              return (
                <div key={item.id} className="relative flex items-center gap-4">
                  {index < stepData.length - 1 && (
                    <span className="absolute left-5 top-11 h-8 w-px bg-slate-700" />
                  )}
                  <span className={[
                    'z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold',
                    complete ? 'bg-green-500 text-white' : current ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300',
                  ].join(' ')}>
                    {complete ? (
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 13 4 4L19 7" />
                      </svg>
                    ) : item.id}
                  </span>
                  <span className={['text-lg font-semibold', current || complete ? 'text-white' : 'text-slate-500'].join(' ')}>
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-7 rounded-2xl border border-blue-500/40 bg-blue-600/15 px-5 py-4 text-sm leading-5 text-slate-300">
            <span className="mr-1" aria-hidden="true">lock</span>
            Your data is protected with 256-bit AES encryption and SOC 2 Type II compliance.
          </div>
        </aside>

        <form onSubmit={handleSubmit} className="flex flex-col px-8 py-12 sm:px-12 lg:px-16">
          <div className="mx-auto flex w-full max-w-[780px] flex-1 flex-col justify-center">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">Step {step} of 3</p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-950">
              {step === 1 ? 'Account Info' : step === 2 ? 'Role & Access' : 'Security'}
            </h2>

            {apiError && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {apiError}
              </div>
            )}

            {step === 1 && (
              <div className="mt-12 space-y-7">
                <label className="block">
                  <span className="text-base font-semibold text-slate-800">Full Name</span>
                  <span className="mt-2 flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-400 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                    <UserIcon />
                    <input
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Krishna Reddy"
                      className="h-full w-full bg-transparent text-lg text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </span>
                  {errors.fullName && <span className="mt-2 block text-sm text-red-500">{errors.fullName}</span>}
                </label>

                <label className="block">
                  <span className="text-base font-semibold text-slate-800">Work Email</span>
                  <span className="mt-2 flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-400 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                    <MailIcon />
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="krishna@company.com"
                      className="h-full w-full bg-transparent text-lg text-slate-950 outline-none placeholder:text-slate-400"
                    />
                  </span>
                  {errors.email && <span className="mt-2 block text-sm text-red-500">{errors.email}</span>}
                </label>

                <div className="flex flex-col gap-4 pt-8 sm:flex-row sm:items-center sm:justify-between">
                  <Link to="/login" className="text-lg font-medium text-slate-500 hover:text-blue-600">
                    Already have an account?
                  </Link>
                  <button
                    type="button"
                    onClick={continueFromAccount}
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-blue-600 px-9 text-lg font-bold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Continue
                    <span aria-hidden="true">-&gt;</span>
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-12">
                <p className="text-base font-semibold text-slate-800">Select Your Role</p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {roles.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setRole(item)}
                      className={[
                        'flex h-[68px] items-center gap-3 rounded-2xl border bg-slate-50 px-5 text-left text-lg font-semibold transition',
                        role === item ? 'border-blue-600 text-blue-600 ring-2 ring-blue-100' : 'border-slate-200 text-slate-700 hover:border-blue-300',
                      ].join(' ')}
                    >
                      <span className={[
                        'flex h-5 w-5 items-center justify-center rounded-full border-2',
                        role === item ? 'border-blue-600' : 'border-slate-300',
                      ].join(' ')}>
                        {role === item && <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />}
                      </span>
                      {item}
                    </button>
                  ))}
                </div>

                <div className="mt-10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-8 text-lg font-semibold text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
                  >
                    <span aria-hidden="true">&lt;-</span>
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-blue-600 px-9 text-lg font-bold text-white shadow-sm transition hover:bg-blue-700"
                  >
                    Continue
                    <span aria-hidden="true">-&gt;</span>
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="mt-12 space-y-7">
                <label className="block">
                  <span className="text-base font-semibold text-slate-800">Password</span>
                  <span className="mt-2 flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-400 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                    <LockIcon />
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Create a strong password"
                      className="h-full w-full bg-transparent text-lg text-slate-950 outline-none placeholder:text-slate-400"
                    />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-400 hover:text-blue-600" aria-label="Toggle password visibility">
                      <EyeIcon hidden={!showPassword} />
                    </button>
                  </span>
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {[1, 2, 3, 4].map((item) => (
                      <span key={item} className={`h-1 rounded-full ${strength >= item ? 'bg-green-500' : 'bg-slate-200'}`} />
                    ))}
                  </div>
                  {errors.password && <span className="mt-2 block text-sm text-red-500">{errors.password}</span>}
                </label>

                <label className="block">
                  <span className="text-base font-semibold text-slate-800">Confirm Password</span>
                  <span className="mt-2 flex h-[52px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-slate-400 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-100">
                    <LockIcon />
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={form.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      className="h-full w-full bg-transparent text-lg text-slate-950 outline-none placeholder:text-slate-400"
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((value) => !value)} className="text-slate-400 hover:text-blue-600" aria-label="Toggle confirm password visibility">
                      <EyeIcon hidden={!showConfirmPassword} />
                    </button>
                  </span>
                  {errors.confirmPassword && <span className="mt-2 block text-sm text-red-500">{errors.confirmPassword}</span>}
                </label>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-8 text-lg font-semibold text-slate-500 transition hover:border-blue-200 hover:text-blue-600"
                  >
                    <span aria-hidden="true">&lt;-</span>
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex h-14 items-center justify-center gap-3 rounded-2xl bg-green-500 px-9 text-lg font-bold text-white shadow-sm transition hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {isLoading ? 'Creating...' : (
                      <>
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m5 13 4 4L19 7" />
                        </svg>
                        Create Account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
