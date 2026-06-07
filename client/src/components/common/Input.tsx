import { useState } from 'react';
import type { InputProps } from '../../types';

export default function Input({ name, label, type = 'text', placeholder, value, error, required = false, disabled = false, icon, onChange, onBlur }: InputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="mb-5">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div className={`relative rounded-lg border transition-all duration-200 ${focused ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-300'} ${error ? 'border-red-400 ring-2 ring-red-400/20' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : 'bg-white'}`}>
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">{icon}</span>}
        <input id={name} name={name} type={type} placeholder={placeholder} value={value} required={required} disabled={disabled}
          onChange={onChange} onBlur={(e) => { setFocused(false); onBlur?.(e); }} onFocus={() => setFocused(true)}
          className={`w-full rounded-lg py-2.5 text-gray-900 placeholder:text-gray-400 focus:outline-none text-sm ${icon ? 'pl-10 pr-3' : 'px-3'}`} />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
        {error}
      </p>}
    </div>
  );
}
