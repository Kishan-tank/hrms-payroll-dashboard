import { useState } from 'react';
import type { InputProps } from '../../types';

export default function Input({ name, label, type = 'text', placeholder, value, error, required = false, disabled = false, icon, onChange, onBlur }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-5">
      <label htmlFor={name} className="mb-1.5 block text-sm font-semibold text-slate-900">
        {label}{required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <div className={`relative rounded-xl border transition-all duration-200 ${focused ? 'border-blue-600 ring-2 ring-blue-300' : 'border-slate-200'} ${error ? 'border-red-400 ring-2 ring-red-200' : ''} ${disabled ? 'cursor-not-allowed bg-slate-100 opacity-60' : 'bg-[#f8faff]'}`}>
        {icon && <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{icon}</span>}
        <input id={name} name={name} type={type} placeholder={placeholder} value={value} required={required} disabled={disabled}
          onChange={onChange} onBlur={(e) => { setFocused(false); onBlur?.(e); }} onFocus={() => setFocused(true)}
          className={`w-full rounded-xl bg-transparent py-3 text-sm text-slate-950 placeholder:text-slate-400 focus:outline-none ${icon ? 'pl-10 pr-4' : 'px-4'}`} />
      </div>
      {error && <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600">
        <svg className="h-3.5 w-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        {error}
      </p>}
    </div>
  );
}
