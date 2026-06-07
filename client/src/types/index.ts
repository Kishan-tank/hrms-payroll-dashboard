import type React from 'react';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  role: 'admin' | 'manager' | 'employee';
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  pattern?: RegExp;
  message: string;
}

export interface FieldValidation {
  [key: string]: ValidationRule;
}

export interface InputProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  value: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

export interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
}
