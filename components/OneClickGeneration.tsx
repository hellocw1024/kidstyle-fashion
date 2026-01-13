
import React, { useState } from 'react';
import { Sparkles, Shirt, User, ChevronRight, Upload, Loader2, Play } from 'lucide-react';
import { buildGenerationParams, GenerationConfig } from '../lib/buildGenerationParams';
import { ModelSelectionPanel } from './ModelSelectionPanel';

import { ModelEntry } from '../constants';

interface OneClickGenerationProps {
    onGenerate: (configs: GenerationConfig[]) => void;
    isGenerating?: boolean;
    models: ModelEntry[]; // 🔥 Accept dynamic models
}

export function OneClickGeneration({ onGenerate, isGenerating = false, models }: OneClickGenerationProps) {
    // 状态管理
    const [clothingGender, setClothingGender] = useState<'boys' | 'girls' | 'unisex'>('boys');
    const [displayType, setDisplayType] = useState<'model' | 'pure'>('model');
    const [modelSelection, setModelSelection] = useState<'auto' | 'manual'>('auto');
    const [selectedModels, setSelectedModels] = useState<string[]>([]);
    const [clothingImage, setClothingImage] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);
    const [showModelPanel, setShowModelPanel] = useState(false);

    // 处理文件上传
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setClothingImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFilePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // 处理一键生成
    const handleGenerate = async () => {
        if (!clothingImage) return;

        // 1. 构建生成参数
        const params = buildGenerationParams({
            clothingGender,
            displayType,
            modelSelection,
            selectedModels,
            clothingImage,
            models // 🔥 Pass models
        });

        // 2. 回调父组件处理生成
        onGenerate(params);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-300 hover:shadow-md">
            <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--primary)] to-pink-500 flex items-center justify-center text-white">
                    <Sparkles size={16} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-800">一键智能生图</h2>
                    <p className="text-xs text-gray-500">上传服装，AI 自动生成多种风格展示图</p>
                </div>
            </div>

            <div className="space-y-6">
                {/* 1. 服装性别选择 */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs mr-2 text-gray-600">1</span>
                        服装适用性别
                    </label>
                    <div className="flex gap-3">
                        {[
                            { id: 'boys', label: '男童装' },
                            { id: 'girls', label: '女童装' },
                            { id: 'unisex', label: '通用/中性' }
                        ].map(type => (
                            <button
                                key={type.id}
                                className={`
                  flex-1 py-3 px-4 rounded-xl border text-sm font-medium transition-all duration-200
                  ${clothingGender === type.id
                                        ? 'border-[var(--primary)] bg-red-50 text-[var(--primary)] shadow-sm'
                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'}
                `}
                                onClick={() => setClothingGender(type.id as any)}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. 展示类型选择 */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs mr-2 text-gray-600">2</span>
                        展示类型
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => setDisplayType('model')}
                            className={`
                flex items-center justify-center gap-2 py-4 rounded-xl border transition-all text-sm font-medium
                ${displayType === 'model'
                                    ? 'border-[var(--primary)] bg-red-50 text-[var(--primary)] shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'}
              `}
                        >
                            <User size={18} />
                            模特上身展示
                        </button>
                        <button
                            onClick={() => setDisplayType('pure')}
                            className={`
                flex items-center justify-center gap-2 py-4 rounded-xl border transition-all text-sm font-medium
                ${displayType === 'pure'
                                    ? 'border-[var(--primary)] bg-red-50 text-[var(--primary)] shadow-sm'
                                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600'}
              `}
                        >
                            <Shirt size={18} />
                            纯服装展示
                        </button>
                    </div>
                </div>

                {/* 3. 模特选择方式（条件显示） */}
                {displayType === 'model' && (
                    <div className="space-y-3 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                        <label className="text-sm font-semibold text-gray-700 block">模特选择方式</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`
                    w-4 h-4 rounded-full border flex items-center justify-center
                    ${modelSelection === 'auto' ? 'border-[var(--primary)]' : 'border-gray-300 group-hover:border-gray-400'}
                 `}>
                                    {modelSelection === 'auto' && <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                                </div>
                                <input
                                    type="radio"
                                    className="hidden"
                                    checked={modelSelection === 'auto'}
                                    onChange={() => setModelSelection('auto')}
                                />
                                <span className="text-sm text-gray-700">系统智能推荐（多样化）</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className={`
                    w-4 h-4 rounded-full border flex items-center justify-center
                    ${modelSelection === 'manual' ? 'border-[var(--primary)]' : 'border-gray-300 group-hover:border-gray-400'}
                 `}>
                                    {modelSelection === 'manual' && <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />}
                                </div>
                                <input
                                    type="radio"
                                    className="hidden"
                                    checked={modelSelection === 'manual'}
                                    onChange={() => setModelSelection('manual')}
                                />
                                <span className="text-sm text-gray-700">手动指定模特</span>
                            </label>
                        </div>

                        {/* 自选模特按钮 */}
                        {modelSelection === 'manual' && (
                            <button
                                className="w-full mt-2 py-2.5 px-4 bg-white border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-[var(--primary)] hover:text-[var(--primary)] transition-colors flex items-center justify-center gap-2"
                                onClick={() => setShowModelPanel(true)}
                            >
                                {selectedModels.length > 0 ? (
                                    <>
                                        <span className="w-5 h-5 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-xs">
                                            {selectedModels.length}
                                        </span>
                                        <span>已选择 {selectedModels.length} 个模特 (点击修改)</span>
                                    </>
                                ) : (
                                    <>
                                        <User size={16} />
                                        <span>点击选择模特...</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* 4. 上传服装图片 */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 flex items-center">
                        <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-xs mr-2 text-gray-600">3</span>
                        上传服装图片
                    </label>

                    <div className="relative group">
                        <div className={`
                border-2 border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px]
                ${filePreview
                                ? 'border-[var(--primary)] bg-gray-50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
              `}>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />

                            {filePreview ? (
                                <div className="relative w-full h-full flex flex-col items-center">
                                    <img
                                        src={filePreview}
                                        alt="Preview"
                                        className="h-32 object-contain rounded-lg shadow-sm mb-2"
                                    />
                                    <p className="text-xs text-gray-500">点击更换图片</p>
                                </div>
                            ) : (
                                <>
                                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-sm transition-all">
                                        <Upload size={20} className="text-gray-400 group-hover:text-[var(--primary)]" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">点击上传服装图片</p>
                                    <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG 格式</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 5. 一键生成按钮 */}
                <button
                    className={`
            w-full py-4 rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all transform
            ${!clothingImage || isGenerating
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-[var(--primary)] to-pink-500 text-white hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'}
          `}
                    onClick={handleGenerate}
                    disabled={!clothingImage || isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 size={24} className="animate-spin" />
                            <span>智能生成中...</span>
                        </>
                    ) : (
                        <>
                            <Sparkles size={24} />
                            <span>一键智能生成</span>
                        </>
                    )}
                </button>
            </div>

            {/* 模特选择面板（模态框） */}
            {showModelPanel && (
                <ModelSelectionPanel
                    gender={clothingGender}
                    selectedModels={selectedModels}
                    models={models} // 🔥 Pass models
                    onConfirm={(models) => {
                        setSelectedModels(models);
                        setShowModelPanel(false);
                    }}
                    onCancel={() => setShowModelPanel(false)}
                />
            )}
        </div>
    );
}
