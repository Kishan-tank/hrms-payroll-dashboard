import type { ButtonProps } from '../../types';

export default function Button({ children, variant = 'primary', type = 'button', isLoading = false, disabled = false, fullWidth = false, className = '', onClick }: ButtonProps) {
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 shadow-sm hover:shadow-md',
    secondary: 'bg-gray-800 text-white hover:bg-gray-900 focus:ring-gray-500 shadow-sm',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-indigo-500 bg-white',
  };
  return (
    <button type={type} disabled={disabled || isLoading} onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}>
      {isLoading && <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
      {children}
    </button>
  );
}
