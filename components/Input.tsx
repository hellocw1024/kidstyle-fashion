import React, { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    helpText?: string;
    icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
    label,
    error,
    helpText,
    icon,
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

            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {icon}
                    </div>
                )}

                <input
                    className={`
            w-full px-4 py-3 
            ${icon ? 'pl-10' : ''} 
            bg-white border-2 rounded-xl 
            text-sm font-semibold text-gray-700
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-transparent
            ${error ? 'border-red-500' : 'border-gray-200 hover:border-gray-300'}
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${className}
          `}
                    {...props}
                />
            </div>

            {error && (
                <p className="mt-1.5 text-sm text-red-600 font-medium">{error}</p>
            )}

            {helpText && !error && (
                <p className="mt-1.5 text-sm text-gray-500">{helpText}</p>
            )}
        </div>
    );
};
