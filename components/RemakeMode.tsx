import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { Button } from './Button';
import { ReferenceImageGallery } from './ReferenceImageGallery';
import { IconPalette, IconImage } from './icons/AppIcons';
import { ModelSelector } from './ModelSelector';
import { ModelLibrarySelector } from './ModelLibrarySelector';
import { ReferenceImage, Model } from '../types';

interface RemakeModeProps {
    onGenerate: () => void;
    referenceImages?: ReferenceImage[];
    initialReferenceImageUrl?: string | null;
    onReferenceSelect?: (url: string) => void;
    models?: Model[];
    onModelUpload?: (file: File) => Promise<void>;
}

export const RemakeMode: React.FC<RemakeModeProps> = ({
    onGenerate,
    referenceImages = [],
    initialReferenceImageUrl,
    onReferenceSelect,
    models = [],
    onModelUpload
}) => {
    const [step, setStep] = useState(1);
    const [remakeType, setRemakeType] = useState<'scene' | 'pose' | 'complete'>('complete');
    const [referenceImage, setReferenceImage] = useState<File | null>(null);
    const [selectedReferenceUrl, setSelectedReferenceUrl] = useState<string>(initialReferenceImageUrl || '');
    const [clothingImage, setClothingImage] = useState<File | null>(null);
    const [showGallery, setShowGallery] = useState(false);

    // Model Selection State (default to 'library' instead of 'ai' for RemakeMode)
    const [modelSource, setModelSource] = useState<'library' | 'upload' | 'ai'>('library');
    const [selectedModelId, setSelectedModelId] = useState<string>('');
    const [modelLibraryModal, setModelLibraryModal] = useState(false);
    const [modelImage, setModelImage] = useState<File | null>(null);

    // Determine category of selected reference image
    const selectedImageCategory = React.useMemo(() => {
        if (!selectedReferenceUrl) return undefined;
        const img = referenceImages.find(i => i.url === selectedReferenceUrl);
        return img?.category;
    }, [selectedReferenceUrl, referenceImages]);

    // 监听传入的初始参考图，保持同步（包括清空状态）
    React.useEffect(() => {
        setSelectedReferenceUrl(initialReferenceImageUrl || '');
        if (initialReferenceImageUrl) {
            setReferenceImage(null);
            setStep(prev => prev < 2 ? 2 : prev); // 自动跳到第二步 如果还在第一步
        }
    }, [initialReferenceImageUrl]);

    const remakeOptions = [
        {
            id: 'scene' as const,
            icon: '🏠',
            title: '背景复刻',
            description: '只复制参考图的场景、光线、氛围，模特姿态由AI自动生成'
        },
        {
            id: 'pose' as const,
            icon: '🧍',
            title: '姿态复刻',
            description: '只复制参考图的姿势、表情、动作，场景背景由AI自动生成'
        },
        {
            id: 'complete' as const,
            icon: '✨',
            title: '完全复刻',
            description: '完全复制参考图的所有元素，包括背景、姿态、构图、光线'
        }
    ];

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setReferenceImage(file);
            setStep(2);
        }
    };

    const isReady = (referenceImage || selectedReferenceUrl) && clothingImage;

    return (
        <div className="space-y-6">
            {/* Step 1: Select Reference Image */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 1 ? 'bg-rose-500 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                        1
                    </span>
                    <h3 className="text-sm font-bold text-gray-700">选择参考图</h3>
                </div>

                <div className="space-y-3 pl-8">
                    <div className="flex gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            icon={<IconImage size={16} active={true} />}
                            onClick={() => setShowGallery(true)}
                        >
                            从图库选择
                        </Button>
                        <label className="inline-block cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <span className="inline-flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-semibold rounded-xl bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
                                本地上传
                            </span>
                        </label>
                    </div>

                    {(referenceImage || selectedReferenceUrl) && (
                        <div className="p-2 bg-green-50 rounded-lg text-sm text-green-700 font-medium">
                            ✓ 已选择: {referenceImage?.name || '图库中的参考图'}
                        </div>
                    )}
                </div>
            </div>

            {/* Reference Image Gallery Modal */}
            {showGallery && (
                <ReferenceImageGallery
                    images={referenceImages}
                    selectedUrl={selectedReferenceUrl} // 🔥 Pass currently selected URL
                    onSelect={(image) => {
                        // Toggle selection: if clicking the same image, deselect it
                        if (selectedReferenceUrl === image.url) {
                            setSelectedReferenceUrl('');
                            onReferenceSelect?.(''); // Notify parent to clear selection
                            setShowGallery(false);
                        } else {
                            setSelectedReferenceUrl(image.url);
                            onReferenceSelect?.(image.url); // Notify parent
                            setReferenceImage(null); // Clear file if selecting from gallery
                            setShowGallery(false);
                            setStep(2);
                        }
                    }}
                    onClose={() => setShowGallery(false)}
                />
            )}

            <hr className="border-gray-200" />

            {/* Step 2: Upload New Clothing */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 2 ? 'bg-rose-500 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                        2
                    </span>
                    <h3 className="text-sm font-bold text-gray-700">上传新服装</h3>
                </div>

                <div className="pl-8">
                    <FileUploader
                        onUpload={(file) => {
                            setClothingImage(file);
                            setStep(3);
                        }}
                    />
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Step 2.5: Select Model (only if reference is model type) */}
            {selectedImageCategory === 'model' && (
                <>
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 3 ? 'bg-rose-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                2.5
                            </span>
                            <h3 className="text-sm font-bold text-gray-700">选择模特</h3>
                        </div>

                        <div className="pl-8 space-y-4">
                            {/* Button Group for Model Selection */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setModelSource('library');
                                        setModelLibraryModal(true);
                                    }}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:border-rose-400 hover:bg-rose-50 transition-all"
                                >
                                    <span className="text-lg">👥</span>
                                    从官方模特库选择
                                </button>

                                <button
                                    onClick={() => setModelSource('upload')}
                                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${modelSource === 'upload'
                                        ? 'bg-rose-500 text-white border-2 border-rose-500'
                                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-rose-400 hover:bg-rose-50'
                                        }`}
                                >
                                    <span className="text-lg">📤</span>
                                    上传自定义图片
                                </button>
                            </div>

                            {/* Upload UI when modelSource is 'upload' */}
                            {modelSource === 'upload' && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                    <FileUploader
                                        label="上传模特图片"
                                        onFileSelect={(file) => {
                                            setModelImage(file);
                                            if (onModelUpload) onModelUpload(file);
                                        }}
                                        selectedFile={modelImage}
                                        accept="image/*"
                                        height={200}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-200" />
                </>
            )}

            {/* Step 3: Select Remake Type */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${step >= 3 ? 'bg-rose-500 text-white' : 'bg-gray-300 text-gray-600'
                        }`}>
                        3
                    </span>
                    <h3 className="text-sm font-bold text-gray-700">选择复刻方式</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-8">
                    {remakeOptions.map(option => (
                        <label
                            key={option.id}
                            className={`
                group relative block p-4 rounded-xl cursor-pointer border-2 transition-all
                ${remakeType === option.id
                                    ? 'border-rose-500 bg-rose-50'
                                    : 'border-gray-200 bg-white hover:border-rose-300'
                                }
              `}
                        >
                            <input
                                type="radio"
                                name="remakeType"
                                value={option.id}
                                checked={remakeType === option.id}
                                onChange={() => setRemakeType(option.id)}
                                className="sr-only"
                            />
                            <div className="flex flex-col items-center gap-2 text-center">
                                <span className="text-3xl">{option.icon}</span>
                                <h4 className="font-bold text-gray-900 text-sm">{option.title}</h4>
                                {/* 悬停时显示的详细说明 */}
                                <p className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-4 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-lg max-w-3xl">
                                    {option.description}
                                </p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Generate Button */}
            <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<IconPalette active={!!isReady} />}
                onClick={onGenerate}
                disabled={!isReady}
            >
                🎨 生成同款
                <span className="text-xs opacity-90">（消耗 1 配额）</span>
            </Button>

            {/* Model Library Modal */}
            {modelLibraryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b border-gray-200">
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
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
