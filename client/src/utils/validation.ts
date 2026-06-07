import type { FieldValidation } from '../types';

export const validationRules: FieldValidation = {
  fullName: { required: true, minLength: 2, message: 'Full name must be at least 2 characters' },
  email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' },
  password: { required: true, minLength: 8, message: 'Password must be at least 8 characters' },
  confirmPassword: { required: true, message: 'Please confirm your password' },
};

export interface ValidationErrors { [key: string]: string }

export function validateField(name: string, value: string, customRules?: FieldValidation): string {
  const rule = (customRules || validationRules)[name];
  if (!rule) return '';
  const trimmed = value.trim();
  if (rule.required && !trimmed) return `${name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1')} is required`;
  if (rule.minLength && trimmed.length < rule.minLength) return rule.message;
  if (rule.pattern && !rule.pattern.test(trimmed)) return rule.message;
  return '';
}

export function validateForm(values: Record<string, string>, customRules?: FieldValidation): ValidationErrors {
  const errors: ValidationErrors = {};
  Object.keys(values).forEach((key) => { const e = validateField(key, values[key], customRules); if (e) errors[key] = e; });
  return errors;
}

export function validateRegisterForm(values: { fullName: string; email: string; password: string; confirmPassword: string }): ValidationErrors {
  const errors = validateForm(values);
  if (values.password && values.confirmPassword && values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
}

export function hasErrors(errors: ValidationErrors): boolean { return Object.keys(errors).length > 0; }
