import React from 'react';

interface FilterTab {
    id: string;
    label: string;
    icon: string;
    count?: number;
}

interface FilterTabsProps {
    tabs: FilterTab[];
    activeTab: string;
    onChange: (tabId: string) => void;
}

export const FilterTabs: React.FC<FilterTabsProps> = ({
    tabs,
    activeTab,
    onChange
}) => {
    return (
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex gap-3 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`
              flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap
              transition-all duration-200
              ${activeTab === tab.id
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                                : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-rose-300'
                            }
            `}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                        {tab.count !== undefined && (
                            <span className={`
                px-2 py-0.5 rounded-full text-xs font-bold
                ${activeTab === tab.id
                                    ? 'bg-white/30'
                                    : 'bg-gray-100'
                                }
              `}>
                                {tab.count}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
