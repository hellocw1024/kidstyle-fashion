
import React from 'react';
import { User, Shirt } from 'lucide-react';
import { DisplayType } from '../types';

interface DisplayTypeToggleProps {
    value: DisplayType;
    onChange: (type: DisplayType) => void;
    size?: 'sm' | 'md' | 'lg';
}

export function DisplayTypeToggle({ value, onChange, size = 'md' }: DisplayTypeToggleProps) {
    const sizeClasses = {
        sm: 'py-2 text-xs',
        md: 'py-3 text-sm',
        lg: 'py-4 text-base'
    };

    return (
        <div className="inline-flex items-center bg-gray-100 rounded-xl p-1">
            <button
                onClick={() => onChange('model')}
                className={`flex items-center gap-2 px-6 ${sizeClasses[size]} rounded-lg font-bold transition-all ${value === 'model'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                <User size={18} />
                <span>模特展示</span>
            </button>

            <div className="w-px h-4 bg-gray-300 mx-1"></div>

            <button
                onClick={() => onChange('pure')}
                className={`flex items-center gap-2 px-6 ${sizeClasses[size]} rounded-lg font-bold transition-all ${value === 'pure'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-700'
                    }`}
            >
                <Shirt size={18} />
                <span>纯服装</span>
            </button>
        </div>
    );
}
