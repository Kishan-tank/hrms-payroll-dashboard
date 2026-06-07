import type { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  fullWidth?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function Button({
  children,
  className = '',
  disabled = false,
  fullWidth = false,
  isLoading = false,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      'bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 focus-visible:ring-indigo-500',
    secondary:
      'bg-slate-900 text-white shadow-sm hover:bg-slate-800 focus-visible:ring-slate-500',
    outline:
      'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus-visible:ring-indigo-500',
  };

  return (
    <button
      className={[
        'inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold transition',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        fullWidth ? 'w-full' : '',
        className,
      ].join(' ')}
      disabled={disabled || isLoading}
      type={type}
      {...props}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
        />
      ) : null}
      {children}
    </button>
  );
}
