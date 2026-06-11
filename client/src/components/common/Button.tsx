import type { ButtonProps } from '../../types';

export default function Button({ children, variant = 'primary', type = 'button', isLoading = false, disabled = false, fullWidth = false, className = '', onClick }: ButtonProps) {
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300 shadow-sm hover:shadow-md',
    secondary: 'bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-300 shadow-sm',
    outline: 'border border-slate-200 text-slate-800 hover:bg-blue-50 focus:ring-blue-300 bg-white',
  };
  return (
    <button type={type} disabled={disabled || isLoading} onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}>
      {isLoading && <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
      {children}
    </button>
  );
}
