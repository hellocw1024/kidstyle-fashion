import React from 'react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: {
        label: string;
        onClick: () => void;
    };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            {icon && (
                <div className="mb-4 text-gray-300 text-6xl">
                    {icon}
                </div>
            )}

            <h3 className="text-xl font-bold text-gray-800 mb-2">
                {title}
            </h3>

            {description && (
                <p className="text-gray-500 mb-6 max-w-md">
                    {description}
                </p>
            )}

            {action && (
                <button
                    onClick={action.onClick}
                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                    {action.label}
                </button>
            )}
        </div>
    );
};
