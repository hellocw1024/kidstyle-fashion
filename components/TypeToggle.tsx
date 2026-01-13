
import React from 'react';
import { User, Shirt } from 'lucide-react';
import { GenerationType } from '../types';

interface TypeToggleProps {
    value: GenerationType;
    onChange: (type: GenerationType) => void;
}

export const TypeToggle: React.FC<TypeToggleProps> = ({ value, onChange }) => {
    return (
        <div className="flex p-1 bg-gray-100 rounded-2xl w-full mb-6">
            <button
                onClick={() => onChange(GenerationType.MODEL)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all duration-300 font-bold text-sm ${value === GenerationType.MODEL
                        ? 'bg-white text-rose-500 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                <User size={18} />
                <span>模特展示图</span>
            </button>
            <button
                onClick={() => onChange(GenerationType.PRODUCT)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl transition-all duration-300 font-bold text-sm ${value === GenerationType.PRODUCT
                        ? 'bg-white text-blue-500 shadow-sm'
                        : 'text-gray-400 hover:text-gray-600'
                    }`}
            >
                <Shirt size={18} />
                <span>纯服装展示图</span>
            </button>
        </div>
    );
};
