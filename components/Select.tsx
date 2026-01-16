import React, { SelectHTMLAttributes } from 'react';

interface SelectOption {
    value: string;
    label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label?: string;
    options: SelectOption[];
    error?: string;
    placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
    label,
    options,
    error,
    placeholder,
    className = '',
    ...props
}) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {label}
                </label>
            )}

            <select
                className={`
          w-full px-4 py-3
          bg-white border-2 rounded-xl
          text-sm font-semibold text-gray-700
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent
          ${error ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'}
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${className}
        `}
                {...props}
            >
                {placeholder && (
                    <option value="" disabled>
                        {placeholder}
                    </option>
                )}
                {options.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>

            {error && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>
            )}
        </div>
    );
};
