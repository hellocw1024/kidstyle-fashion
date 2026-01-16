import React from 'react';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { Upload, ArrowRight, Check } from 'lucide-react';
import { ZoomableImage } from './ZoomableImage';

type PreviewState = 'empty' | 'ready' | 'generating' | 'complete';

interface PreviewAreaProps {
    state: PreviewState;
    clothingImage?: string;
    modelImage?: string;
    resultImages?: string[];
}

export const PreviewArea: React.FC<PreviewAreaProps> = ({
    state,
    clothingImage,
    modelImage,
    resultImages = []
}) => {
    // Empty State
    if (state === 'empty') {
        return (
            <EmptyState
                icon="📸"
                title="上传服装图片后开始"
                description="在左侧上传服装图片，选择生成模式和参数，然后点击生成按钮"
            />
        );
    }

    // Ready State - Show Combination Preview
    if (state === 'ready' && clothingImage) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <h3 className="text-lg font-bold text-gray-800 mb-6">生成预览</h3>

                <div className="flex items-center gap-8">
                    {/* Clothing Image */}
                    <div className="text-center">
                        <ZoomableImage
                            src={clothingImage}
                            alt="服装图"
                            containerClassName="w-48 h-64 rounded-2xl shadow-lg mb-3"
                            className="w-full h-full object-cover"
                        />
                        <p className="text-sm font-semibold text-gray-600">服装图</p>
                    </div>

                    {/* Arrow */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 flex items-center justify-center">
                            <ArrowRight className="text-white" size={24} />
                        </div>
                        <span className="text-xs font-bold text-gray-400">AI生成</span>
                    </div>

                    {/* Model Image (if exists) */}
                    {modelImage && (
                        <div className="text-center">
                            <ZoomableImage
                                src={modelImage}
                                alt="模特图"
                                containerClassName="w-48 h-64 rounded-2xl shadow-lg mb-3"
                                className="w-full h-full object-cover"
                            />
                            <p className="text-sm font-semibold text-gray-600">模特图</p>
                        </div>
                    )}
                </div>

                <div className="mt-8 p-4 bg-green-50 rounded-xl max-w-md">
                    <div className="flex items-start gap-3">
                        <Check className="text-green-600 mt-0.5" size={20} />
                        <div>
                            <p className="font-bold text-green-900 mb-1">已准备就绪</p>
                            <p className="text-sm text-green-700">点击生成按钮开始创作</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Generating State
    if (state === 'generating') {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <LoadingState message="AI 正在为您生成精美的展示图..." size="lg" />
                <p className="mt-4 text-sm text-gray-500">预计需要 10-30 秒</p>
            </div>
        );
    }

    // Complete State - Show Results
    if (state === 'complete' && resultImages.length > 0) {
        return (
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-6">生成结果</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {resultImages.map((imageUrl, index) => (
                        <div key={index} className="relative">
                            <ZoomableImage
                                src={imageUrl}
                                alt={`Result ${index + 1}`}
                                containerClassName="aspect-[3/4] rounded-2xl shadow-lg"
                                className="w-full h-full object-cover"
                            />
                            {/* Note: Original Hover Overlay with buttons is tricky because ZoomableImage has its own overlay. 
                                 We might need to customize ZoomableImage or just let the zoom be the primary action. 
                                 For now, let's keep the zoom feature as requested. If we need buttons, we can add them to the modal or overlay.
                             */}
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
};
