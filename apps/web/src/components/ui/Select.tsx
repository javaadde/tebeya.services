import React from 'react';
import { cn } from '../../utils/cn';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5"
          >
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full px-3.5 py-2 text-sm bg-white border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all',
            error
              ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-200'
              : 'border-[#dad0c3] focus:border-[#598A31] focus:ring-[#598A31]/20',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
