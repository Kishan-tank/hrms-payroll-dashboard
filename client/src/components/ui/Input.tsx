import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label: string;
}

export default function Input({
  className = '',
  error,
  id,
  label,
  name,
  required = false,
  ...props
}: InputProps) {
  const inputId = id ?? name;

  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700" htmlFor={inputId}>
        {label}
        {required ? <span className="ml-1 text-red-500">*</span> : null}
      </label>
      <input
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-error` : undefined}
        className={[
          'min-h-11 w-full rounded-md border bg-white px-3 py-2 text-sm text-slate-950 shadow-sm transition',
          'placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-300',
          className,
        ].join(' ')}
        id={inputId}
        name={name}
        required={required}
        {...props}
      />
      {error ? (
        <p className="text-sm text-red-600" id={`${inputId}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
