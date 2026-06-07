import { useState, useCallback } from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { validateField } from '../../utils/validation';
import type { LoginRequest } from '../../types';

export default function LoginPage() {
  const { login, isLoading, error: apiError, clearError } = useAuth();
  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginRequest, boolean>>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; clearError();
    setForm((prev) => ({ ...prev, [name]: value }));
    if (touched[name as keyof LoginRequest]) {
      const err = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: err || undefined }));
    }
  }, [touched, clearError]);

  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: err || undefined }));
  }, []);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Partial<LoginRequest> = {};
    const emailErr = validateField('email', form.email);
    const passErr = validateField('password', form.password);
    if (emailErr) newErrors.email = emailErr;
    if (passErr) newErrors.password = passErr;
    setErrors(newErrors); setTouched({ email: true, password: true });
    if (Object.keys(newErrors).length > 0) return;
    login(form);
  }, [form, login]);

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your HRMS account" footerText="Don't have an account?" footerLinkText="Create one" footerLinkTo="/register">
      {apiError && <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2"><svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>{apiError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <Input name="email" label="Email address" type="email" placeholder="you@company.com" value={form.email} error={errors.email} required onChange={handleChange} onBlur={handleBlur}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
        <Input name="password" label="Password" type="password" placeholder="Enter your password" value={form.password} error={errors.password} required onChange={handleChange} onBlur={handleBlur}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
        <div className="flex items-center justify-between mb-6">
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" /><span className="text-sm text-gray-600">Remember me</span></label>
          <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">Forgot password?</button>
        </div>
        <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>Sign in</Button>
      </form>
    </AuthLayout>
  );
}
