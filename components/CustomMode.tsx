import React, { useState } from 'react';
// Force refresh

import { ModelSelector } from './ModelSelector';
import { PureClothingParams } from './PureClothingParams';
import { ModelDisplayParams } from './ModelDisplayParams';
import { DisplayTypeToggle } from './DisplayTypeToggle';
import { FileUploader } from './FileUploader';
import { Card } from './Card';
import { Button } from './Button';
import { IconSparkles } from './icons/AppIcons';
import { ModelEntry } from '../constants';
import { SystemConfig, DisplayType } from '../types';
import { ModelLibrarySelector } from './ModelLibrarySelector';

interface CustomModeProps {
    onGenerate: (params: any) => void;
    models: ModelEntry[];
    displayType: DisplayType;
    onDisplayTypeChange: (type: DisplayType) => void;
    config?: SystemConfig;
    onClothingUpload?: (file: File) => Promise<void>;
}

export const CustomMode: React.FC<CustomModeProps> = ({
    onGenerate,
    models,
    displayType,
    onDisplayTypeChange,
    config,
    onClothingUpload
}) => {
    const [modelSource, setModelSource] = useState<'ai' | 'upload' | 'library'>('ai');
    const [clothingImage, setClothingImage] = useState<File | null>(null);
    const [modelImage, setModelImage] = useState<File | null>(null);
    const [selectedModelId, setSelectedModelId] = useState<string>('');

    // AI 模特筛选
    const [filterGender, setFilterGender] = useState<string>('girl'); // 默认选中女性
    const [filterAgeGroup, setFilterAgeGroup] = useState<string>('3-5'); // 默认 3-5 岁
    const [filterEthnicity, setFilterEthnicity] = useState<string>('asian'); // 默认亚洲

    // 模特展示参数
    const [modelDisplayParams, setModelDisplayParams] = useState({
        pose: '',
        scene: '',
        composition: '',
        style: '',
        quality: 'standard', // 降低默认质量以提高速度
        ratio: '3:4'
    });

    // 纯服装展示参数
    const [pureClothingParams, setPureClothingParams] = useState({
        style: '',
        background: '',
        angle: 'front',
        focus: '',
        quality: 'standard',
        ratio: '1:1'
    });

    const [modelLibraryModal, setModelLibraryModal] = useState(false);

    const handleGenerate = () => {
        // Find the selected model object if in library mode
        const selectedModel = modelSource === 'library' && selectedModelId
            ? models.find(m => m.id === selectedModelId)
            : null;

        // If library mode, use the model's URL as modelImage (passed as string/file to upstream)
        // Note: The parent component expects modelImage to be File | undefined usually, but geminiService handles string URLs too.
        // However, GenerationPage.tsx converts modelImage (File) to URL. We might need to handle this carefully.
        // Actually, GenerationPage.tsx line 135: const modelUrl = modelFile ? URL.createObjectURL(modelFile) : undefined;
        // It expects a File object. Constructing a dummy File or passing the URL via a different param might be needed.
        // BUT, looking at CustomMode props, onGenerate takes `any`.
        // Let's pass the URL directly in a way GenerationPage can handle, or relies on GenerationPage to handle string vs File.

        // Let's check pure logic:
        // For AI mode: use filters.
        // For Upload/Library: do NOT use filters.

        onGenerate({
            type: 'custom',
            source: modelSource,
            clothingImage,
            // For library, we pass the URL. For upload, we pass the File. 
            // We need to ensure GenerationPage handles this mixed type or we resolve it here.
            // Current GenerationPage expects 'modelImage' to be used for preview and generation.
            modelImage: modelSource === 'library' ? selectedModel?.url : modelImage,
            modelId: modelSource === 'library' ? selectedModelId : undefined,

            // 🔥 CRITICAL FIX: Only pass gender/age/ethnicity if we are asking AI to generate a person from scratch (AI mode).
            // If we provide a reference image (Upload or Library), we leave these EMPTY so the AI strictly follows the image.
            gender: modelSource === 'ai' ? filterGender : undefined,
            ageGroup: modelSource === 'ai' ? filterAgeGroup : undefined,
            ethnicity: modelSource === 'ai' ? filterEthnicity : undefined,

            modelDisplayParams,
            pureClothingParams
        });
    };

    const isReady = clothingImage && (
        displayType === 'pure' ||
        (modelSource === 'ai') ||
        (modelSource === 'upload' && modelImage) ||
        (modelSource === 'library' && selectedModelId)
    );

    return (
        <div className="space-y-8 pb-20">
            {/* Display Type Toggle */}
            {/* Display Type Toggle */}
            <DisplayTypeToggle
                value={displayType}
                onChange={onDisplayTypeChange}
            />

            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* 1. Upload Clothing (Always First) */}
                <Card title="1. 上传服装图" className="border-rose-100 shadow-sm">
                    <div className="p-4">
                        <FileUploader
                            label="点击上传服装图"
                            onUpload={(file) => {
                                setClothingImage(file);
                                if (onClothingUpload) onClothingUpload(file);
                            }}
                            accept="image/*"
                            validationType="clothing"
                        />
                    </div>
                </Card>

                {/* 2. Model Selection (Only if displayType is model) */}
                {displayType === 'model' && (
                    <Card title="2. 选择模特" className="border-rose-100 shadow-sm">
                        <div className="p-4 space-y-4">
                            <ModelSelector
                                modelSource={modelSource}
                                onModelSourceChange={setModelSource}
                                onOpenModal={() => setModelLibraryModal(true)}
                                // Pass down filters to sync if needed, or rely on internal state
                                gender={filterGender}
                                ageGroup={filterAgeGroup}
                                ethnicity={filterEthnicity}
                                onGenderChange={setFilterGender}
                                onAgeGroupChange={setFilterAgeGroup}
                                onEthnicityChange={setFilterEthnicity}
                                config={config}
                                models={models}
                                selectedModelId={selectedModelId}
                                onModelUpload={setModelImage}
                            />

                            {/* Dynamic Content based on source */}
                            {modelSource === 'upload' && (
                                <div className="animate-in fade-in zoom-in-95 duration-300">
                                    <FileUploader
                                        label="上传自定义模特图"
                                        onUpload={setModelImage}
                                        accept="image/*"
                                        validationType="model"
                                    />
                                </div>
                            )}

                            {modelSource === 'ai' && (
                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300 bg-rose-50/50 p-4 rounded-xl border border-rose-100/50">
                                    <h4 className="text-sm font-bold text-gray-700 mb-2">AI 模特特征配置</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">性别</label>
                                            <select
                                                className="w-full text-sm rounded-lg border-gray-200 focus:border-rose-500 focus:ring-rose-500 bg-white"
                                                value={filterGender}
                                                onChange={(e) => setFilterGender(e.target.value)}
                                            >
                                                <option value="girl">👧 女童</option>
                                                <option value="boy">👦 男童</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">年龄段</label>
                                            <select
                                                className="w-full text-sm rounded-lg border-gray-200 focus:border-rose-500 focus:ring-rose-500 bg-white"
                                                value={filterAgeGroup}
                                                onChange={(e) => setFilterAgeGroup(e.target.value)}
                                            >
                                                <option value="infant">👶 婴幼儿 (0-2岁)</option>
                                                <option value="3-5">🧒 幼童 (3-5岁)</option>
                                                <option value="6-8">🎒 此童 (6-8岁)</option>
                                                <option value="9-12">🧢 大童 (9-12岁)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500">肤色/族裔</label>
                                            <select
                                                className="w-full text-sm rounded-lg border-gray-200 focus:border-rose-500 focus:ring-rose-500 bg-white"
                                                value={filterEthnicity}
                                                onChange={(e) => setFilterEthnicity(e.target.value)}
                                            >
                                                <option value="asian">亚洲 (Asian)</option>
                                                <option value="caucasian">高加索 (Caucasian)</option>
                                                <option value="black">非裔 (Black)</option>
                                                <option value="hispanic">拉丁裔 (Hispanic)</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {modelSource === 'library' && (
                                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                                    {selectedModelId ? (
                                        <div className="relative group rounded-xl overflow-hidden border border-rose-200 shadow-sm aspect-[3/4] w-1/3">
                                            <img
                                                src={models.find(m => m.id === selectedModelId)?.url}
                                                alt="Selected Model"
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={() => setModelLibraryModal(true)}
                                                    className="px-3 py-1 bg-white hover:bg-rose-50 text-rose-600 text-xs font-bold rounded-full transition-colors"
                                                >
                                                    更换模特
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setModelLibraryModal(true)}
                                            className="border-2 border-dashed border-rose-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-rose-50/50 hover:border-rose-300 transition-all text-rose-400 group h-[120px]"
                                        >
                                            <span className="p-2 bg-rose-100 rounded-full group-hover:scale-110 transition-transform">🔍</span>
                                            <span className="text-sm font-bold">点击打开模特库选择</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                )}

                {/* 3. Parameters */}
                <Card title="3. 效果配置" className="border-rose-100 shadow-sm">
                    <div className="p-4">
                        {displayType === 'model' ? (
                            <ModelDisplayParams
                                value={modelDisplayParams}
                                onChange={(val) => setModelDisplayParams(val)}
                                models={models}
                                config={config}
                            />
                        ) : (
                            <PureClothingParams
                                value={pureClothingParams}
                                onChange={(val) => setPureClothingParams(val)}
                                config={config}
                            />
                        )}
                    </div>
                </Card>

                {/* Generate Button */}
                <div className="pt-4 pb-8">
                    <Button
                        size="lg" // Make it larger
                        fullWidth
                        onClick={handleGenerate}
                        disabled={!isReady}
                        className={`
                            h-14 text-lg font-black shadow-xl shadow-rose-200
                            ${isReady
                                ? 'bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 translate-y-0'
                                : 'bg-gray-200 cursor-not-allowed text-gray-400 translate-y-0 shadow-none'
                            }
                        `}
                        icon={<IconSparkles active={isReady} className={isReady ? "text-white animate-pulse" : "text-gray-400"} />}
                    >
                        {isReady ? '立即生成 (消耗 2 点)' : '请先上传服装图'}
                    </Button>
                </div>
            </div>

            {/* Model Library Modal */}
            {modelLibraryModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-gray-800">选择模特</h3>
                                <p className="text-sm text-gray-400">从官方模特库中选择合适的模特</p>
                            </div>
                            <button
                                onClick={() => setModelLibraryModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors font-bold text-gray-400"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="flex-1 overflow-hidden p-0 relative bg-gray-50/50">
                            <div className="h-full overflow-y-auto p-6">
                                <ModelLibrarySelector
                                    models={models}
                                    selectedModel={selectedModelId}
                                    onSelect={(modelId) => {
                                        setSelectedModelId(modelId);
                                        setModelLibraryModal(false);
                                    }}
                                    className="h-full"
                                // Optional: Pass pre-filled filters if we want sync
                                // filterGender={filterGender !== 'all' ? filterGender : undefined}
                                // filterAgeGroup={filterAgeGroup !== 'all' ? filterAgeGroup : undefined}
                                // filterEthnicity={filterEthnicity !== 'all' ? filterEthnicity : undefined}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
