import React from 'react';

export type GenerationMode = 'custom' | 'smart' | 'remake' | 'template';

interface ModeSwitcherProps {
    activeMode: GenerationMode;
    onChange: (mode: GenerationMode) => void;
}

export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({
    activeMode,
    onChange
}) => {
    const modes = [
        { id: 'custom' as GenerationMode, icon: '✨', label: '自定义创作' },
        { id: 'remake' as GenerationMode, icon: '🎨', label: '做同款' },
        { id: 'template' as GenerationMode, icon: '📸', label: '模板生图' },
    ];

    return (
        <div className="space-y-3 mb-8">
            <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    选择模式
                </h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
                {modes.map(mode => (
                    <button
                        key={mode.id}
                        onClick={() => onChange(mode.id)}
                        className={`
                relative w-full flex flex-col items-center gap-2 px-3 py-4 rounded-xl font-bold text-xs
                transition-all duration-300 border
                ${activeMode === mode.id
                                ? 'border-rose-200 bg-rose-50 text-rose-600 shadow-sm'
                                : 'border-transparent bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }
              `}
                    >
                        <span className={`flex items-center justify-center w-10 h-10 rounded-lg text-xl ${activeMode === mode.id ? 'bg-rose-500 text-white' : 'bg-gray-100 text-gray-500'
                            } transition-colors`}>
                            {mode.icon}
                        </span>
                        <span className="text-center leading-tight">{mode.label}</span>

                        {activeMode === mode.id && (
                            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
