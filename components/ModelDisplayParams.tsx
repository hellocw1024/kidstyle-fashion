
import React from 'react';
import { ModelDisplayParams as ModelDisplayParamsType, SystemConfig } from '../types';
import { ModelEntry } from '../constants';

interface ModelDisplayParamsProps {
    value?: ModelDisplayParamsType;
    onChange?: (params: ModelDisplayParamsType) => void;
    models?: ModelEntry[];
    config?: SystemConfig;
}

export function ModelDisplayParams({ value, onChange, models = [], config }: ModelDisplayParamsProps) {
    // Default values if not provided
    const currentValue = value || {
        ratio: '3:4',
        quality: '2K',
        model: '',
        scene: '',
        style: '',
        pose: ''
    };

    const currentConfig = config || {
        scenes: ['简约摄影棚（纯色背景）', '公园绿地', '奶油风室内'],
        styles: ['可爱风', '运动风', '学院风', '轻奢风', '国风', '森系'],
        poses: ['静态站立', '可爱坐姿', '奔跑跳跃', '害羞微笑'],
        emotions: ['开心微笑', '天真烂漫', '安静乖巧', '活泼好动', '害羞腼腆', '自信阳光'],
        ratios: ['1:1', '3:4', '16:9'],
        qualities: ['1K', '2K', '4K']
    } as SystemConfig;

    const handleChange = (newValue: ModelDisplayParamsType) => {
        onChange?.(newValue);
    };

    return (
        <div className="space-y-5">
            {/* 比例和图片质量选择 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">比例</label>
                    <select
                        value={currentValue.ratio}
                        onChange={(e) => handleChange({ ...currentValue, ratio: e.target.value as any })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 outline-none transition-all"
                    >
                        {currentConfig.ratios.map((ratio) => (
                            <option key={ratio} value={ratio}>
                                {ratio}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">图片质量</label>
                    <select
                        value={currentValue.quality}
                        onChange={(e) => handleChange({ ...currentValue, quality: e.target.value as any })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 outline-none transition-all"
                    >
                        {currentConfig.qualities.map((quality) => (
                            <option key={quality} value={quality}>
                                {quality}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 场景和风格选择 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">场景</label>
                    <select
                        value={currentValue.scene}
                        onChange={(e) => handleChange({ ...currentValue, scene: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 outline-none transition-all"
                    >
                        <option value="">默认</option>
                        {currentConfig.scenes.map((scene) => (
                            <option key={scene} value={scene}>
                                {scene}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">风格</label>
                    <select
                        value={currentValue.style}
                        onChange={(e) => handleChange({ ...currentValue, style: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 outline-none transition-all"
                    >
                        <option value="">默认</option>
                        {currentConfig.styles.map((style) => (
                            <option key={style} value={style}>
                                {style}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 姿势和情绪选择（可选） */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">姿势（可选）</label>
                    <select
                        value={currentValue.pose || ''}
                        onChange={(e) => handleChange({ ...currentValue, pose: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 outline-none transition-all"
                    >
                        <option value="">默认</option>
                        {currentConfig.poses.map((pose) => (
                            <option key={pose} value={pose}>
                                {pose}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">情绪（可选）</label>
                    <select
                        value={currentValue.emotion || ''}
                        onChange={(e) => handleChange({ ...currentValue, emotion: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 outline-none transition-all"
                    >
                        <option value="">默认</option>
                        {currentConfig.emotions.map((emotion) => (
                            <option key={emotion} value={emotion}>
                                {emotion}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* 构图选择（可选） */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">构图（可选）</label>
                <select
                    value={currentValue.composition || ''}
                    onChange={(e) => handleChange({ ...currentValue, composition: e.target.value })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 outline-none transition-all"
                >
                    <option value="">默认</option>
                    {currentConfig.compositions.map((comp) => (
                        <option key={comp} value={comp}>
                            {comp}
                        </option>
                    ))}
                </select>
            </div>

            {/* 🔥 高级自定义 (Advanced Customization) */}
            <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                    <span className="mr-1">✨</span> 高级自定义 (Advanced)
                </label>
                <textarea
                    value={currentValue.advancedDetail || ''}
                    onChange={(e) => handleChange({ ...currentValue, advancedDetail: e.target.value })}
                    placeholder="在此添加更多细节描述：例如模特妆容（红唇、雀斑）、发型（卷发、马尾）、配饰（帽子、围巾）或其他具体要求..."
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-700 focus:border-rose-400 outline-none transition-all min-h-[80px] resize-none"
                />
            </div>
        </div>
    );
}
