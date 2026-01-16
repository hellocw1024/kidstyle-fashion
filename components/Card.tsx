import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    className = '',
    hover = false,
    onClick
}) => {
    const hoverClass = hover ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
    const clickableClass = onClick ? 'cursor-pointer' : '';

    return (
        <div
            className={`
        bg-white rounded-2xl shadow-sm border border-gray-100
        transition-all duration-300
        ${hoverClass}
        ${clickableClass}
        ${className}
      `}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
