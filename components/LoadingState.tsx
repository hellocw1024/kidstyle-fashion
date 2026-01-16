import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

export const LoadingState: React.FC<LoadingStateProps> = ({
    message = '加载中...',
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16'
    };

    return (
        <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className={`animate-spin text-rose-500 ${sizeClasses[size]}`} />
            {message && (
                <p className="mt-4 text-gray-600 font-medium">{message}</p>
            )}
        </div>
    );
};
