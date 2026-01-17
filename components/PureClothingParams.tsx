
import React from 'react';
import { PureClothingParams as PureClothingParamsType, SystemConfig } from '../types';

interface PureClothingParamsProps {
    value?: PureClothingParamsType;
    onChange?: (params: PureClothingParamsType) => void;
    config?: SystemConfig;
}

export function PureClothingParams({ value, onChange, config }: PureClothingParamsProps) {
    // Default values if not provided
    const currentValue = value || {
        ratio: '3:4',
        quality: '2K',
        background: '',
        angle: '平铺-微褶皱自然',
        style: '',
        focus: ''
    };

    const currentConfig = config || {
        productBackgrounds: ['纯白底-电商标准', '木纹底-温馨感', '大理石-轻奢感', '地毯绒面'],
        productForms: ['平铺-微褶皱自然', '挂拍-无痕隐形', '3D建模-立体支撑'],
        productFocus: ['整体呈现', '面料质感特写', '工艺细节(领口/刺绣)'],
        styles: ['可爱风', '运动风', '学院风', '轻奢风', '国风', '森系'],
        ratios: ['1:1', '3:4', '16:9'],
        qualities: ['1K', '2K', '4K']
    } as SystemConfig;

    const handleChange = (newValue: PureClothingParamsType) => {
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

            {/* 背景材质和风格选择 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">背景材质</label>
                    <select
                        value={currentValue.background}
                        onChange={(e) => handleChange({ ...currentValue, background: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 outline-none transition-all"
                    >
                        <option value="">默认</option>
                        {currentConfig.productBackgrounds.map((bg) => (
                            <option key={bg} value={bg}>
                                {bg}
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

            {/* 呈现角度和细节聚焦 */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">呈现角度</label>
                    <select
                        value={currentValue.angle}
                        onChange={(e) => handleChange({ ...currentValue, angle: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 outline-none transition-all"
                    >
                        {currentConfig.productForms.map((angle) => (
                            <option key={angle} value={angle}>
                                {angle}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">细节聚焦（可选）</label>
                    <select
                        value={currentValue.focus || ''}
                        onChange={(e) => handleChange({ ...currentValue, focus: e.target.value })}
                        className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 outline-none transition-all"
                    >
                        <option value="">整体呈现</option>
                        {currentConfig.productFocus.map((focus) => (
                            <option key={focus} value={focus}>
                                {focus}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
