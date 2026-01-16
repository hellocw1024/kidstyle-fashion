import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { DisplayTypeToggle } from './DisplayTypeToggle';
import { Button } from './Button';
import { Zap } from 'lucide-react';
import { DisplayType } from '../types';

interface SmartModeProps {
    displayType: DisplayType;
    onDisplayTypeChange: (type: DisplayType) => void;
    onGenerate: (params?: any) => void;
}

export const SmartMode: React.FC<SmartModeProps> = ({
    displayType,
    onDisplayTypeChange,
    onGenerate
}) => {
    const [clothingImage, setClothingImage] = useState<File | null>(null);
    const imageCount = displayType === 'model' ? 9 : 6;

    return (
        <div className="space-y-6">
            {/* Clothing Upload */}
            <FileUploader
                label="📤 上传服装"
                validationType="clothing"
                enableAIValidation={true}
                onUpload={(file) => {
                    console.log('Clothing uploaded:', file);
                    setClothingImage(file);
                }}
            />

            {/* Display Type Toggle */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    🎨 生成类型
                </h3>
                <DisplayTypeToggle
                    value={displayType}
                    onChange={onDisplayTypeChange}
                />
            </div>

            {/* Simple Model Selection (only for model type) */}
            {displayType === 'model' && (
                <div className="p-4 bg-blue-50 rounded-xl">
                    <h4 className="font-bold text-blue-900 mb-2">👤 模特方式</h4>
                    <p className="text-sm text-blue-700 mb-3">
                        AI 将根据服装智能推荐合适的模特
                    </p>
                    <div className="flex gap-2">
                        <button className="flex-1 px-3 py-2 bg-white rounded-lg text-sm font-semibold">
                            智能推荐
                        </button>
                    </div>
                </div>
            )}

            {/* AI Info Card */}
            <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100">
                <div className="flex items-start gap-4">
                    <div className="text-4xl">🤖</div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-2">AI 将自动分析你的服装</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            为您生成 <span className="font-bold text-rose-600">{imageCount} 张</span> 包含不同场景的多样化{displayType === 'model' ? '模特' : '服装'}照片
                        </p>
                        <ul className="text-sm text-gray-600 space-y-1">
                            <li>✓ 包含多种场景配置</li>
                            <li>✓ 多样化的风格调性</li>
                            <li>✓ {displayType === 'model' ? '不同构图和姿势' : '不同角度和呈现'}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <hr className="border-gray-200" />

            {/* Generate Button */}
            <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<Zap />}
                disabled={!clothingImage}
                onClick={() => onGenerate({ displayType, clothingImage, mode: 'smart' })}
            >
                ⚡ 一键智能生成
                <span className="text-xs opacity-90">（消耗 {imageCount} 配额）</span>
            </Button>
        </div>
    );
};
