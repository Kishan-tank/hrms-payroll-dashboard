import type { ChangeEvent, InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

type FieldType = 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea';

interface SelectOption {
  label: string;
  value: string;
}

interface FormFieldProps {
  id: string;
  label: string;
  name: string;
  value: string;
  type?: FieldType;
  placeholder?: string;
  options?: SelectOption[];
  error?: string;
  required?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

export default function FormField({
  id,
  label,
  name,
  value,
  type = 'text',
  placeholder,
  options = [],
  error,
  required = false,
  onChange,
}: FormFieldProps) {
  const baseClasses =
    'mt-2 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100';

  const sharedProps:
    | InputHTMLAttributes<HTMLInputElement>
    | SelectHTMLAttributes<HTMLSelectElement>
    | TextareaHTMLAttributes<HTMLTextAreaElement> = {
    id,
    name,
    value,
    required,
    onChange,
  };

  return (
    <div>
      {/* Form label */}
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
      </label>

      {/* Field control */}
      {type === 'select' ? (
        <select {...(sharedProps as SelectHTMLAttributes<HTMLSelectElement>)} className={baseClasses}>
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea
          {...(sharedProps as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className={`${baseClasses} min-h-28 resize-y`}
          placeholder={placeholder}
        />
      ) : (
        <input
          {...(sharedProps as InputHTMLAttributes<HTMLInputElement>)}
          className={baseClasses}
          type={type}
          placeholder={placeholder}
        />
      )}

      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
