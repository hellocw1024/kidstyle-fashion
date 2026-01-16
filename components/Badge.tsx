import React from 'react';

type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    icon?: React.ReactNode;
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
    children,
    variant = 'default',
    icon,
    className = ''
}) => {
    const variantClasses = {
        default: 'bg-gray-100 text-gray-700',
        primary: 'bg-rose-500 text-white',
        success: 'bg-green-100 text-green-700',
        warning: 'bg-yellow-100 text-yellow-700',
        error: 'bg-red-100 text-red-700'
    };

    return (
        <span
            className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-lg
        text-xs font-bold
        ${variantClasses[variant]}
        ${className}
      `}
        >
            {icon && <span>{icon}</span>}
            {children}
        </span>
    );
};
