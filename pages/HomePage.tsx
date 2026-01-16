import React, { useState, useMemo, useEffect } from 'react';
import { GenerationLayout } from '../components/GenerationLayout';
import { ModeSwitcher, GenerationMode } from '../components/ModeSwitcher';
import { CustomMode } from '../components/CustomMode';
import { RemakeMode } from '../components/RemakeMode';
import { TemplateMode } from '../components/TemplateMode';
import { PreviewArea } from '../components/PreviewArea';
import { PromptPreviewModal } from '../components/PromptPreviewModal';
import { DisplayType, ImageResource, AppView, User, SystemConfig, ReferenceImage, ReferenceImageType } from '../types';
import { ModelEntry, REFERENCE_IMAGE_LIBRARY } from '../constants';
import { generateClothingImage, buildPrompt } from '../services/geminiService';
import { Badge } from '../components/Badge';
import { IconZap, IconPalette, IconHeart } from '../components/icons/AppIcons';
import { FilterTabs } from '../components/FilterTabs';

// Mock 示例数据 (保留原用于展示的 Mock 数据，实际应从 App 传入或混合)
const MOCK_IMAGES: ImageResource[] = [
    // ... (omitted)
];

interface HomePageProps {
    models?: ModelEntry[];
    user?: User | null;
    config?: SystemConfig;
    setView?: (view: AppView) => void;
    onOpenRecharge?: () => void;
    remakeData?: any;
    onClearRemakeData?: () => void;
    onQuotaUpdate?: (quota: number) => void;
    onAddResource?: (resource: any) => void;
    initialMode?: string;
    onNavigate?: (view: AppView, mode?: string) => void; // 保留兼容性
    resources?: ImageResource[]; // 从 App 传入用户的资源
    referenceImages?: any[]; // 参考图库
}

export const HomePage: React.FC<HomePageProps> = ({
    models = [],
    initialMode,
    onAddResource,
    config,
    user,
    setView,
    onOpenRecharge,
    resources = [],
    referenceImages = []
}) => {
    // --- Generation Logic States ---
    const [mode, setMode] = useState<GenerationMode>((initialMode as GenerationMode) || 'custom');
    const [displayType, setDisplayType] = useState<DisplayType>('model');
    const [previewState, setPreviewState] = useState<'empty' | 'ready' | 'generating' | 'complete'>('empty');
    const [showPromptPreview, setShowPromptPreview] = useState(false);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [currentPrompt, setCurrentPrompt] = useState('');
    const [currentNegativePrompt, setCurrentNegativePrompt] = useState('');
    const [currentParameters, setCurrentParameters] = useState<Record<string, any>>({});
    const [selectedRemakeImage, setSelectedRemakeImage] = useState<string | null>(null);

    // --- Gallery Logic States ---
    const [activeFilter, setActiveFilter] = useState('all');

    // 🚨 终极方案：HomePage 自己加载数据
    const [localRefs, setLocalRefs] = useState<any[]>([]);

    useEffect(() => {
        const fetchRefs = async () => {
            try {
                const { supabase } = await import('../lib/supabaseClient');
                const { data } = await supabase.from('reference_images').select('*');
                if (data && data.length > 0) {
                    console.log('✅ HomePage 自主加载成功:', data.length);
                    setLocalRefs(data);
                }
            } catch (e) { console.error(e); }
        };
        fetchRefs();
    }, []);

    // 灵感画廊图片 - 优先使用本地自主加载的数据
    const allGalleryImages = useMemo(() => {
        const sourceData = localRefs.length > 0 ? localRefs : referenceImages;

        // 将参考图库转换为 ImageResource 格式
        const referenceImageResources: ImageResource[] = sourceData.map(ref => ({
            id: ref.id,
            url: ref.url,
            type: 'REFERENCE' as any,
            displayType: ref.type === 'model' ? 'model' : 'pure',
            date: ref.uploadedAt?.split('T')[0] || new Date().toISOString().split('T')[0],
            tags: ref.tags || []
        }));

        return referenceImageResources;
    }, [referenceImages, localRefs]);

    const filteredImages = useMemo(() => {
        let result = allGalleryImages;
        if (activeFilter === 'model') result = result.filter(img => img.displayType === 'model');
        if (activeFilter === 'pure') result = result.filter(img => img.displayType === 'pure');
        // 'favorites' 和 'recent' 逻辑可以根据需要实现
        return result;
    }, [activeFilter, allGalleryImages]);

    // 将 ImageResource[] 转换为 ReferenceImage[] 供 RemakeMode 使用
    const remakeReferenceImages = useMemo(() => {
        return allGalleryImages.map(img => ({
            id: img.id,
            url: img.url,
            thumbnail: img.thumbnail,
            name: img.tags?.[0] || '参考图',
            type: ReferenceImageType.COMPREHENSIVE, // 默认类型
            metadata: {
                scene: img.tags?.find(t => t.includes('场景')) || '通用',
                tags: img.tags
            },
            source: 'SYSTEM',
            createdAt: img.date,
            usageCount: 0,
            status: 'ACTIVE',
            category: img.displayType // Map displayType to category
        } as ReferenceImage));
    }, [allGalleryImages]);

    const filterTabs = [
        { id: 'all', label: '全部', icon: '🎨', count: allGalleryImages.length },
        { id: 'model', label: '模特展示', icon: '👦', count: allGalleryImages.filter(i => i.displayType === 'model').length },
        { id: 'pure', label: '纯服装', icon: '👕', count: allGalleryImages.filter(i => i.displayType === 'pure').length },
    ];

    // --- Generation Handlers ---
    const handleGenerate = (params?: any) => {
        console.log('🎨 Generation parameters:', params);
        const prompt = buildPrompt({
            ...params,
            type: displayType === 'model' ? 'MODEL' : 'PRODUCT',
            style: params?.modelDisplayParams?.style || params?.pureClothingParams?.style || 'natural',
            quality: params?.modelDisplayParams?.quality || params?.pureClothingParams?.quality || '2K',
            scene: params?.modelDisplayParams?.scene,
            gender: params?.gender,
            ageGroup: params?.ageGroup || '3-5',
            ethnicity: params?.ethnicity,
            pose: params?.modelDisplayParams?.pose,
            composition: params?.modelDisplayParams?.composition,
            productForm: params?.pureClothingParams?.angle,
            productFocus: params?.pureClothingParams?.focus,
            productBackground: params?.pureClothingParams?.background,
            referenceConfig: params?.referenceConfig
        }, config?.promptTemplates || undefined, config?.referencePromptTemplates || undefined);

        const negativePrompt = 'blurry, low quality, low resolution, pixelated, grainy, noisy, out of focus, soft focus, poor quality, bad anatomy, distorted, deformed, disfigured, extra limbs, extra fingers, mutated, malformed, missing limbs, poorly drawn, wrong clothing color, incorrect pattern, different design, altered clothing, modified outfit, changed style, different face, changed facial features, wrong person, altered appearance, inconsistent model, face swap, watermark, text, signature, logo overlay, copyright mark, username, timestamp, frame border, cropped, cut off, partial view, out of frame, bad composition, awkward angle, distorted perspective, surreal, abstract, unrealistic, fake looking, artificial, CGI, cartoon, illustration, drawing';

        const parameters = {
            mode,
            ...(params || {}),
            resolution: '1024x1536',
            steps: 40,
            sampler: 'DPM++ 2M Karras',
            cfg_scale: 7.5,
            clip_skip: 2,
        };

        setCurrentPrompt(prompt);
        setCurrentNegativePrompt(negativePrompt);
        setCurrentParameters(parameters);
        setShowPromptPreview(true);
    };

    const confirmGeneration = async () => {
        console.log('🎨 Confirmed generation');
        setShowPromptPreview(false);
        setPreviewState('generating');

        try {
            const clothingFile = currentParameters.clothingImage;
            const modelFile = currentParameters.modelImage;
            const clothingUrl = clothingFile ? URL.createObjectURL(clothingFile) : undefined;
            const modelUrl = modelFile ? URL.createObjectURL(modelFile) : undefined;

            const result = await generateClothingImage({
                style: currentParameters.modelDisplayParams?.style || currentParameters.pureClothingParams?.style,
                type: displayType === 'model' ? 'MODEL' : 'PRODUCT',
                ageGroup: currentParameters.ageGroup,
                gender: currentParameters.gender,
                ethnicity: currentParameters.ethnicity,
                scene: currentParameters.modelDisplayParams?.scene,
                quality: currentParameters.modelDisplayParams?.quality || currentParameters.pureClothingParams?.quality || '2K',
                aspectRatio: currentParameters.modelDisplayParams?.ratio || currentParameters.pureClothingParams?.ratio || '3:4',
                modelImage: modelUrl,
                baseImages: clothingUrl ? [clothingUrl] : undefined,
                customPrompt: currentPrompt,
                promptTemplates: config?.promptTemplates,
                referencePromptTemplates: config?.referencePromptTemplates,
                overridePrompt: currentPrompt,
            });

            if (result && result.url) {
                setGeneratedImage(result.url);
                if (onAddResource) {
                    const newResource = {
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                        url: result.url,
                        thumbnail: result.url,
                        type: 'GENERATE',
                        displayType: displayType, // 补充 displayType
                        date: new Date().toISOString().split('T')[0],
                        tags: ['generated', mode, currentParameters.modelDisplayParams?.style || 'standard'],
                        modelName: 'Gemini 3 Pro'
                    };
                    onAddResource(newResource);
                }
            }
            setPreviewState('complete');
        } catch (error) {
            console.error('❌ Generation failed:', error);
            setPreviewState('complete');
            alert('生成失败: ' + (error instanceof Error ? error.message : '未知错误'));
        }
    };

    // Handle model upload for RemakeMode
    const handleModelUpload = async (file: File) => {
        // For now, we just accept the file
        // In a real implementation, you might want to:
        // 1. Upload to storage
        // 2. Add to models list
        // 3. Update state
        console.log('📸 Model uploaded:', file.name);
        // The ModelSelector component will handle the file internally
    };

    const renderModeContent = () => {
        switch (mode) {
            case 'custom':
                return (
                    <CustomMode
                        displayType={displayType}
                        onDisplayTypeChange={setDisplayType}
                        onGenerate={handleGenerate}
                        models={models}
                        config={config}
                        onClothingUpload={async (file) => {
                            if (onAddResource) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                    const base64 = reader.result as string;
                                    const newResource = {
                                        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                                        url: base64,
                                        thumbnail: base64,
                                        type: 'UPLOAD',
                                        displayType: 'pure', // Default uploaded clothing to 'pure' type
                                        date: new Date().toISOString().split('T')[0],
                                        tags: ['upload', 'clothing'],
                                        modelName: 'User Upload'
                                    };
                                    onAddResource(newResource);
                                };
                                reader.readAsDataURL(file);
                            }
                        }}
                    />
                );
            case 'smart': // 保留 SmartMode 组件，虽然入口没了，但逻辑整合
                return null;
            case 'remake':
                return <RemakeMode
                    onGenerate={handleGenerate}
                    referenceImages={remakeReferenceImages}
                    initialReferenceImageUrl={selectedRemakeImage}
                    onReferenceSelect={(url) => setSelectedRemakeImage(url)}
                    models={models}
                    onModelUpload={handleModelUpload}
                />;
            case 'template':
                return <TemplateMode onGenerate={handleGenerate} />;
            default:
                return null;
        }
    };

    // --- Left Panel: Creation Studio ---
    const leftPanel = (
        <>
            <div className="mb-6">
                <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
                    <IconZap size={24} active />
                    创作中心
                </h2>
                <p className="text-xs text-gray-400 mt-1">一站式 AI 服装生成工作台</p>
            </div>
            <ModeSwitcher activeMode={mode} onChange={setMode} />
            <div className="mt-4">
                {renderModeContent()}
            </div>
        </>
    );

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // ... inside the component ...

    // --- Right Panel: Header + Content Canvas ---
    const rightPanel = (
        <div className="flex flex-col h-full relative">
            {/* Minimal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 z-10 sticky top-0">
                <div className="flex items-center gap-2">
                    <span className="text-xl font-black bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">
                        KidStyle AI
                    </span>
                    <Badge variant="secondary" size="sm">PRO</Badge>
                </div>
                <div className="flex items-center gap-4">
                    {user && (
                        <div
                            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => setView?.(AppView.USER_CENTER)}
                        >
                            <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-500 font-bold">
                                {user.phone.substring(7)}
                            </div>
                            <div className="text-right hidden md:block">
                                <p className="text-xs font-bold text-gray-700">用户 {user.phone.substring(7)}</p>
                                <p className="text-[10px] text-gray-400">配额: {user.quota}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                {/* 1. Preview Area (Conditionally Shown or always at top) */}
                {(previewState !== 'empty' || generatedImage) && (
                    <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-2 mb-4">
                            <h3 className="text-lg font-bold text-gray-800">当前任务</h3>
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">
                                {previewState === 'generating' ? '生成中...' : '已完成'}
                            </span>
                        </div>
                        <PreviewArea
                            state={previewState}
                            clothingImage={
                                currentParameters.clothingImage ? URL.createObjectURL(currentParameters.clothingImage) : undefined
                            }
                            resultImages={generatedImage ? [generatedImage] : []}
                        />
                    </div>
                )}

                {/* 2. Gallery Header & Filters */}
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <IconPalette size={20} active />
                        灵感画廊
                    </h3>
                    <FilterTabs
                        tabs={filterTabs}
                        activeTab={activeFilter}
                        onChange={setActiveFilter}
                    />
                </div>

                {/* 3. Masonry Gallery */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
                    {filteredImages.length > 0 ? (
                        filteredImages.map((image, index) => {
                            const isSelectedRef = mode === 'remake' && selectedRemakeImage === (image.url || image.thumbnail);
                            return (
                                <div
                                    key={image.id || index}
                                    className={`group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 cursor-pointer ${isSelectedRef
                                        ? 'shadow-xl ring-4 ring-rose-500 ring-offset-2'
                                        : 'shadow-sm hover:shadow-xl'
                                        }`}
                                    onClick={() => {
                                        const imageUrl = image.url || image.thumbnail || '';
                                        // Only allow deselection when clicking selected image
                                        if (isSelectedRef) {
                                            setSelectedRemakeImage(null);
                                        }
                                        // Selection only happens via 'Make Similar' button
                                    }}
                                >
                                    <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                                        <img
                                            src={image.url || image.thumbnail}
                                            alt={image.tags?.join(' ')}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            loading="lazy"
                                        />
                                        {isSelectedRef && (
                                            <div className="absolute inset-0 bg-rose-500/10 z-0 flex items-center justify-center">
                                                <div className="bg-rose-500 text-white p-3 rounded-full shadow-lg animate-in zoom-in spin-in-180 duration-300 z-20">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                        <polyline points="20 6 9 17 4 12"></polyline>
                                                    </svg>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hover Overlay */}
                                    <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 flex flex-col items-center justify-center gap-3 z-30 ${isSelectedRef ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                                        }`}>
                                        {/* Action Button - Only show when NOT selected */}
                                        {!isSelectedRef && (
                                            <button
                                                className="px-4 py-2 bg-rose-500 text-white text-xs font-bold rounded-full shadow-lg hover:bg-rose-600 transition-colors transform hover:scale-105 flex items-center gap-1.5"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const imageUrl = image.url || image.thumbnail || '';
                                                    setMode('remake');
                                                    setSelectedRemakeImage(imageUrl);
                                                }}
                                            >
                                                <IconPalette size={14} />
                                                做同款
                                            </button>
                                        )}

                                        {/* Zoom Button */}
                                        <button
                                            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors transform hover:scale-110"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setPreviewImage(image.url || image.thumbnail || '');
                                            }}
                                            title="放大查看"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-12 text-center text-gray-400">
                            暂无图片，快去生成第一张吧！
                        </div>
                    )}
                </div>
            </div>

            {/* Image Preview Modal */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setPreviewImage(null)}
                >
                    <button
                        className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"
                        onClick={() => setPreviewImage(null)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                    <img
                        src={previewImage}
                        alt="Preview"
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                    />
                </div>
            )}
        </div>
    );

    return (
        <>
            <GenerationLayout leftPanel={leftPanel} rightPanel={rightPanel} />
            {showPromptPreview && (
                <PromptPreviewModal
                    prompt={currentPrompt}
                    negativePrompt={currentNegativePrompt}
                    parameters={currentParameters}
                    onConfirm={confirmGeneration}
                    onCancel={() => setShowPromptPreview(false)}
                />
            )}
        </>
    );
};
