import React from 'react';
import { ModelEntry } from '../constants';
import { FileUploader } from './FileUploader';
import { SystemConfig } from '../types';

interface ModelSelectorProps {
    modelSource: 'library' | 'upload' | 'ai';
    onModelSourceChange: (source: 'library' | 'upload' | 'ai') => void;
    onModelSelect?: (model: any) => void;
    models?: ModelEntry[];
    selectedModelId?: string;
    onSelectModel?: (modelId: string) => void;
    gender?: string;
    ageGroup?: string;
    ethnicity?: string;
    onGenderChange?: (gender: string) => void;
    onAgeGroupChange?: (ageGroup: string) => void;
    onEthnicityChange?: (ethnicity: string) => void;
    onModelUpload?: (file: File) => void;
    config?: SystemConfig;
    onOpenModal?: () => void;
    hideAiOption?: boolean; // 🔥 New prop to hide AI option
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
    modelSource,
    onModelSourceChange,
    models = [],
    selectedModelId,
    onSelectModel,
    gender = '',
    ageGroup = '',
    ethnicity = '',
    onGenderChange,
    onAgeGroupChange,
    onEthnicityChange,
    onModelUpload,
    config,
    onOpenModal,
    hideAiOption = false // 🔥 Default to false
}) => {
    return (
        <div className="space-y-4">
            {/* 模特来源选择 - 下拉框样式 */}
            <div className="relative">
                <select
                    value={modelSource}
                    onChange={(e) => {
                        const newSource = e.target.value as 'library' | 'upload' | 'ai';
                        onModelSourceChange(newSource);
                        if (newSource === 'library' && onOpenModal) {
                            onOpenModal();
                        }
                    }}
                    className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 focus:ring-1 focus:ring-rose-200 outline-none transition-all appearance-none"
                >
                    {!hideAiOption && <option value="ai">✨ AI 自动生成 (推荐)</option>}
                    <option value="library">👥 从官方模特库选择</option>
                    <option value="upload">📤 上传自定义图片</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 font-bold text-xs">
                    ▼
                </div>
            </div>

            {/* AI 自动生成的参数配置将在 CustomMode 中直接渲染，这里只处理非 AI 模式的特殊内容 */}
            {/* 但为了保持与原设计一致，这里保留一个插槽或者什么都不做，因为 CustomMode 已经把 AI 参数提到外面了 */}
            {/* 实际上 CustomMode 已经在 ModelSelector 外部处理了 AI 参数的渲染 */}

            {/* 仅处理 Library 和 Upload 的特殊展示 */}
            {modelSource === 'library' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* 只是一个占位，实际内容在 CustomMode 中通过 selectedModelId 渲染 */}
                </div>
            )}

            {modelSource === 'upload' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    {/* 上传组件 */}
                    {/* 注意：CustomMode 也可能已经在外面渲染了 FileUploader，这里如果没传入 children 可能会有重复 */}
                    {/* 根据 step 1255 的代码，CustomMode 将 FileUploader 放在了 outside，传给了 onModelUpload */}
                    {/* 所以这里应该不需要渲染太多内容，或者只是作为一个纯粹的选择器 */}
                </div>
            )}
        </div>
    );
};
