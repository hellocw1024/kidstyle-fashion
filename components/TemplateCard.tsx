import React from 'react';
import { GenerationTemplate, GenerationType } from '../types';
import { Trash2, Check } from 'lucide-react';

interface TemplateCardProps {
    template: GenerationTemplate;
    onApply: () => void;
    onDelete: () => void;
    isSelected?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onApply, onDelete, isSelected }) => {
    return (
        <div
            className={`template-card group relative bg-white rounded-2xl p-4 border-2 transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1 ${isSelected ? 'border-rose-500 shadow-md' : 'border-gray-100 hover:border-rose-300'
                }`}
            onClick={onApply}
        >
            {/* 缩略图区域 - 暂时使用渐变背景 */}
            <div className="aspect-video bg-gradient-to-br from-rose-100 to-pink-100 rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                <div className="text-4xl">
                    {template.config.type === GenerationType.MODEL ? '👤' : '👕'}
                </div>
            </div>

            {/* 模板信息 */}
            <div className="space-y-2">
                <h4 className="text-sm font-black text-gray-800 truncate">{template.name}</h4>

                {template.description && (
                    <p className="text-xs text-gray-400 line-clamp-2">{template.description}</p>
                )}

                {/* 标签 */}
                <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">
                        {template.config.type === GenerationType.MODEL ? '真人模特' : '纯服装'}
                    </span>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-full">
                        {template.config.style}
                    </span>
                    {template.useCount > 0 && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 text-[10px] font-bold rounded-full">
                            🔥 {template.useCount}次
                        </span>
                    )}
                </div>
            </div>

            {/* 删除按钮 */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="absolute top-2 right-2 w-7 h-7 bg-white border-2 border-gray-200 text-gray-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:border-rose-500 hover:text-rose-500 hover:bg-rose-50"
                title="删除模板"
            >
                <Trash2 size={14} />
            </button>

            {/* 选中标记 */}
            {isSelected && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Check size={14} />
                </div>
            )}
        </div>
    );
};

export default TemplateCard;
