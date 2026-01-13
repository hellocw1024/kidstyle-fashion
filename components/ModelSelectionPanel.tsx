
import React, { useState, useMemo } from 'react';
import { Check, X } from 'lucide-react';
import { ModelEntry } from '../constants';

interface ModelSelectionPanelProps {
    gender: 'boys' | 'girls' | 'unisex';
    selectedModels: string[];
    models: ModelEntry[]; // 🔥 Accept models list
    onConfirm: (models: string[]) => void;
    onCancel: () => void;
}

export function ModelSelectionPanel({
    gender,
    selectedModels: initialSelected,
    models,
    onConfirm,
    onCancel
}: ModelSelectionPanelProps) {
    const [selected, setSelected] = useState<string[]>(initialSelected);

    // 根据性别过滤模特
    const availableModels = useMemo(() => {
        if (gender === 'boys') {
            return models.filter(m => m.gender === '男' || m.gender === 'boy');
        } else if (gender === 'girls') {
            return models.filter(m => m.gender === '女' || m.gender === 'girl');
        } else {
            return models; // 通用款，显示所有
        }
    }, [gender, models]);

    // 切换选择
    const toggleModel = (modelId: string) => {
        setSelected(prev =>
            prev.includes(modelId)
                ? prev.filter(id => id !== modelId)
                : [...prev, modelId]
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-[90vw] max-w-4xl h-[80vh] flex flex-col rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800">选择模特</h3>
                        <p className="text-sm text-gray-500 mt-1">请选择您想要生成的模特（支持多选）</p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* 模特网格 */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/30">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {availableModels.map(model => {
                            const isSelected = selected.includes(model.id);
                            return (
                                <div
                                    key={model.id}
                                    className={`
                    group relative rounded-xl cursor-pointer transition-all duration-200 border-2
                    ${isSelected
                                            ? 'border-[var(--primary)] shadow-md transform -translate-y-1'
                                            : 'border-transparent hover:border-gray-200 hover:shadow-sm bg-white'}
                  `}
                                    onClick={() => toggleModel(model.id)}
                                >
                                    <div className="aspect-[3/4] overflow-hidden rounded-t-lg relative">
                                        <img
                                            src={model.url}
                                            alt={model.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {/* 遮罩层，提升文字可读性 */}
                                        <div className={`absolute inset-0 bg-black/10 transition-opacity ${isSelected ? 'opacity-20' : 'opacity-0 group-hover:opacity-10'}`} />
                                    </div>

                                    <div className="p-3 bg-white rounded-b-lg">
                                        <div className="font-medium text-gray-800 truncate text-sm">{model.name}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{model.ageGroup} · {model.ethnicity}</div>
                                    </div>

                                    {/* 选中标记 */}
                                    <div className={`
                    absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center 
                    transition-all duration-200 shadow-sm
                    ${isSelected
                                            ? 'bg-[var(--primary)] text-white scale-100'
                                            : 'bg-white/80 text-transparent scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100'}
                  `}>
                                        <Check size={14} strokeWidth={3} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* 底部操作 */}
                <div className="p-6 border-t border-gray-100 flex justify-between items-center bg-white">
                    <span className="text-sm font-medium text-gray-600">
                        已选择 <span className="text-[var(--primary)] font-bold text-lg mx-1">{selected.length}</span> 个模特
                    </span>
                    <div className="flex gap-3">
                        <button
                            className="px-6 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 font-medium transition-colors"
                            onClick={onCancel}
                        >
                            取消
                        </button>
                        <button
                            className={`
                px-6 py-2.5 rounded-lg text-white font-medium shadow-md transition-all
                ${selected.length > 0
                                    ? 'bg-gradient-to-r from-[var(--primary)] to-pink-500 hover:shadow-lg hover:-translate-y-0.5'
                                    : 'bg-gray-300 cursor-not-allowed shadow-none'}
              `}
                            onClick={() => onConfirm(selected)}
                            disabled={selected.length === 0}
                        >
                            确认选择
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
