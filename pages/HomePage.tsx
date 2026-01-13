
import React, { useState } from 'react';
import { Sparkles, Heart, Download } from 'lucide-react';
import { ImageResource } from '../types';
import { RemakePanel, RemakeConfig } from '../components/RemakePanel';

// Mock 示例数据（Phase 1 测试用）
const MOCK_IMAGES: ImageResource[] = [
    {
        id: 'demo-1',
        url: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=600&fit=crop',
        type: 'GENERATE',
        date: '2024-01-14',
        tags: ['户外', '自然风']
    },
    {
        id: 'demo-2',
        url: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400&h=600&fit=crop',
        type: 'GENERATE',
        date: '2024-01-14',
        tags: ['室内', '时尚']
    },
    {
        id: 'demo-3',
        url: 'https://images.unsplash.com/photo-1544376664-80b17f09d399?w=400&h=600&fit=crop',
        type: 'GENERATE',
        date: '2024-01-14',
        tags: ['摄影棚', '简约']
    },
    {
        id: 'demo-4',
        url: 'https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=400&h=600&fit=crop',
        type: 'GENERATE',
        date: '2024-01-14',
        tags: ['户外', '活泼']
    },
];

export const HomePage: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<ImageResource | null>(null);

    const handleRemake = (config: RemakeConfig) => {
        console.log('做同款配置:', config);
        // TODO: Phase 2 - 调用 AI 分析和生成逻辑
        alert(`做同款功能开发中！\n已选择复刻选项：\n- 场景: ${config.options.scene}\n- 姿态: ${config.options.pose}\n- 完全: ${config.options.complete}`);
        setSelectedImage(null);
    };

    return (
        <div className="h-full w-full flex flex-col p-6 overflow-y-auto">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-800">灵感探索</h1>
                <div className="w-64">
                    <input
                        type="text"
                        placeholder="搜索灵感..."
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-rose-400 bg-white"
                    />
                </div>
            </div>

            {/* 图片瀑布流 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {MOCK_IMAGES.map((image) => (
                    <div
                        key={image.id}
                        className="relative group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                    >
                        {/* 图片 */}
                        <div className="aspect-[3/4] relative">
                            <img
                                src={image.url}
                                alt={`示例 ${image.id}`}
                                className="w-full h-full object-cover"
                            />

                            {/* 悬停遮罩层 */}
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4">
                                {/* 主要操作：做同款 */}
                                <button
                                    onClick={() => setSelectedImage(image)}
                                    className="w-full px-4 py-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={18} />
                                    <span>做同款</span>
                                </button>

                                {/* 次要操作 */}
                                <div className="flex gap-2 w-full">
                                    <button className="flex-1 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all flex items-center justify-center gap-2">
                                        <Heart size={16} />
                                        <span className="text-sm">收藏</span>
                                    </button>
                                    <button className="flex-1 px-3 py-2 bg-white/20 text-white rounded-lg hover:bg-white/30 transition-all flex items-center justify-center gap-2">
                                        <Download size={16} />
                                        <span className="text-sm">下载</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 图片信息 */}
                        <div className="p-3">
                            <div className="flex gap-1 flex-wrap">
                                {image.tags?.map((tag, idx) => (
                                    <span
                                        key={idx}
                                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 做同款面板 */}
            {selectedImage && (
                <RemakePanel
                    referenceImage={selectedImage}
                    onClose={() => setSelectedImage(null)}
                    onGenerate={handleRemake}
                />
            )}
        </div>
    );
};
