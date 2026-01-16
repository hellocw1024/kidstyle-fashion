import React, { useState, useMemo } from 'react';
import { ReferenceImage } from '../types';
import { Check, X } from 'lucide-react';

interface ReferenceImageGalleryProps {
    images: ReferenceImage[];
    selectedUrl?: string; // 🔥 Receive selected URL
    onSelect: (image: ReferenceImage) => void;
    onClose: () => void;
}

export const ReferenceImageGallery: React.FC<ReferenceImageGalleryProps> = ({
    images,
    selectedUrl,
    onSelect,
    onClose
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [selectedScene, setSelectedScene] = useState<string>('all');

    const scenes = useMemo(() => {
        const uniqueScenes = new Set(
            images.map(img => img.metadata?.scene).filter(Boolean)
        );
        return ['all', ...Array.from(uniqueScenes)];
    }, [images]);

    // Filter images
    const filteredImages = useMemo(() => {
        return images.filter(img => {
            const categoryMatch = selectedCategory === 'all' || img.category === selectedCategory;
            const sceneMatch = selectedScene === 'all' || img.metadata?.scene === selectedScene;
            return categoryMatch && sceneMatch;
        });
    }, [images, selectedCategory, selectedScene]);

    const getTypeLabel = (type: string, category?: string) => {
        if (category === 'model') return '模特展示';
        if (category === 'product') return '纯服装';

        const labels: Record<string, string> = {
            'SCENE': '场景',
            'POSE': '姿势',
            'STYLE': '风格',
            'COMPLETE': '完整',
            'COMPREHENSIVE': '综合'
        };
        return labels[type] || type;
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">📸 选择参考图</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Filters */}
                <div className="p-6 border-b border-gray-200 space-y-4">
                    {/* Category Filter (Matched with Admin & HomePage) */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            参考类型
                        </label>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedCategory('all')}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedCategory === 'all'
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                全部
                            </button>
                            <button
                                onClick={() => setSelectedCategory('model')}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedCategory === 'model'
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                模特展示图
                            </button>
                            <button
                                onClick={() => setSelectedCategory('product')}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${selectedCategory === 'product'
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                纯服装展示图
                            </button>
                        </div>
                    </div>

                    {/* Scene Filter */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                            场景筛选
                        </label>
                        <select
                            value={selectedScene}
                            onChange={(e) => setSelectedScene(e.target.value)}
                            className="w-full px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-semibold"
                        >
                            <option value="all">全部场景</option>
                            {scenes.filter(s => s !== 'all').map(scene => (
                                <option key={scene} value={scene}>{scene}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Gallery Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {filteredImages.length > 0 ? (
                            filteredImages.map(image => {
                                const isSelected = selectedUrl === image.url;
                                return (
                                    <div
                                        key={image.id}
                                        onClick={() => onSelect(image)}
                                        className={`group relative cursor-pointer rounded-xl overflow-hidden border-2 transition-all hover:shadow-lg ${isSelected
                                            ? 'border-rose-500 ring-2 ring-rose-200'
                                            : 'border-gray-200 hover:border-rose-500'
                                            }`}
                                    >
                                        {/* Image */}
                                        <div className="aspect-[3/4] bg-gray-100 relative">
                                            <img
                                                src={image.url}
                                                alt={image.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Reference';
                                                }}
                                            />
                                            {/* Selected Overlay */}
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-rose-500/10 z-10 flex items-center justify-center">
                                                    <div className="bg-rose-500 text-white p-2 rounded-full shadow-lg transform scale-100 animate-in zoom-in spin-in-180 duration-300">
                                                        <Check size={24} strokeWidth={3} />
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                            <p className="text-white font-bold text-sm mb-1">{image.name}</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded">
                                                    {getTypeLabel(image.type, image.category)}
                                                </span>
                                                {image.metadata?.scene && (
                                                    <span className="text-xs bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded">
                                                        {image.metadata.scene}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Usage Count */}
                                        {image.usageCount > 0 && (
                                            <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-bold text-gray-700">
                                                🔥 {image.usageCount}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="col-span-full py-12 text-center text-gray-400">
                                <p className="text-lg font-semibold">没有找到符合条件的参考图</p>
                                <p className="text-sm mt-2">请尝试调整筛选条件</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            共 <span className="font-bold text-rose-600">{filteredImages.length}</span> 个参考图
                        </p>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                        >
                            取消
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
