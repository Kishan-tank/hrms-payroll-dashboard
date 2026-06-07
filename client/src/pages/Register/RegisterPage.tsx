import { useState, useCallback } from 'react';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import { validateRegisterForm, hasErrors } from '../../utils/validation';
import type { RegisterRequest } from '../../types';

export default function RegisterPage() {
  const { register, isLoading, error: apiError, clearError } = useAuth();
  const [form, setForm] = useState<RegisterRequest>({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterRequest, string>>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target; clearError();
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }, [clearError]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRegisterForm(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;
    register(form);
  }, [form, register]);

  return (
    <AuthLayout title="Create your account" subtitle="Set up your HRMS profile" footerText="Already have an account?" footerLinkText="Sign in" footerLinkTo="/login">
      {apiError && <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2"><svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>{apiError}</div>}
      <form onSubmit={handleSubmit} noValidate>
        <Input name="fullName" label="Full name" type="text" placeholder="John Doe" value={form.fullName} error={errors.fullName} required onChange={handleChange}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
        <Input name="email" label="Email address" type="email" placeholder="you@company.com" value={form.email} error={errors.email} required onChange={handleChange}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>} />
        <Input name="password" label="Password" type="password" placeholder="Min. 8 characters" value={form.password} error={errors.password} required onChange={handleChange}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />
        <Input name="confirmPassword" label="Confirm password" type="password" placeholder="Re-enter your password" value={form.confirmPassword} error={errors.confirmPassword} required onChange={handleChange}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>} />
        <Button type="submit" variant="primary" fullWidth isLoading={isLoading} className="mt-2">Create account</Button>
      </form>
    </AuthLayout>
  );
}
