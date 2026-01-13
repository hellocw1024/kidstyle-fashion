import React, { useState, useEffect } from 'react';
import { X, Home, User as PersonIcon, Sparkles, Upload } from 'lucide-react';
import { ImageResource } from '../types';

interface RemakePanelProps {
    referenceImage: ImageResource;
    onClose: () => void;
    onGenerate: (config: RemakeConfig) => void;
}

export interface RemakeConfig {
    referenceImage: ImageResource;
    clothingImage: File;
    options: RemakeOptions;
}

interface RemakeOptions {
    scene: boolean;      // 场景复刻
    pose: boolean;       // 姿态复刻
    complete: boolean;   // 完全复刻
}

export function RemakePanel({ referenceImage, onClose, onGenerate }: RemakePanelProps) {
    const [options, setOptions] = useState<RemakeOptions>({
        scene: false,
        pose: false,
        complete: false
    });
    const [clothingImage, setClothingImage] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null);

    // 完全复刻自动选中其他选项
    useEffect(() => {
        if (options.complete) {
            setOptions({
                scene: true,
                pose: true,
                complete: true
            });
        }
    }, [options.complete]);

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

    // 处理生成
    const handleGenerate = () => {
        if (!clothingImage) return;

        onGenerate({
            referenceImage,
            clothingImage,
            options
        });
    };

    const isGenerateDisabled = !clothingImage || (!options.scene && !options.pose && !options.complete);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <div className="relative bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
                {/* 标题栏 */}
                <div className="flex items-center gap-4 p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-[2rem] z-10">
                    <img
                        src={referenceImage.url}
                        alt="参考图"
                        className="w-20 h-20 object-cover rounded-xl border-2 border-gray-100"
                    />
                    <div className="flex-1">
                        <h3 className="text-xl font-black text-gray-800">做同款</h3>
                        <p className="text-sm text-gray-400 mt-1">选择复刻选项，生成相似效果的图片</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X size={24} className="text-gray-400" />
                    </button>
                </div>

                {/* 复刻选项 */}
                <div className="p-6 space-y-4">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">复刻选项（可多选）</p>

                    {/* 场景复刻 */}
                    <label className={`
            flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
            ${options.scene && !options.complete ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/30'}
            ${options.complete ? 'opacity-60' : ''}
          `}>
                        <input
                            type="checkbox"
                            checked={options.scene}
                            onChange={(e) => setOptions({ ...options, scene: e.target.checked })}
                            disabled={options.complete}
                            className="mt-1 w-5 h-5 accent-rose-500 cursor-pointer"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Home size={18} className="text-rose-500" />
                                <span className="font-bold text-gray-800">场景复刻</span>
                            </div>
                            <p className="text-sm text-gray-500">室内/户外/背景</p>
                        </div>
                    </label>

                    {/* 模特姿态表情复刻 */}
                    <label className={`
            flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
            ${options.pose && !options.complete ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/30'}
            ${options.complete ? 'opacity-60' : ''}
          `}>
                        <input
                            type="checkbox"
                            checked={options.pose}
                            onChange={(e) => setOptions({ ...options, pose: e.target.checked })}
                            disabled={options.complete}
                            className="mt-1 w-5 h-5 accent-rose-500 cursor-pointer"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <PersonIcon size={18} className="text-rose-500" />
                                <span className="font-bold text-gray-800">模特姿态表情复刻</span>
                            </div>
                            <p className="text-sm text-gray-500">身体姿态与面部表情</p>
                        </div>
                    </label>

                    {/* 完全复刻 */}
                    <label className={`
            flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all
            ${options.complete ? 'border-rose-500 bg-rose-50' : 'border-gray-200 hover:border-rose-300 hover:bg-rose-50/30'}
          `}>
                        <input
                            type="checkbox"
                            checked={options.complete}
                            onChange={(e) => setOptions({ ...options, complete: e.target.checked })}
                            className="mt-1 w-5 h-5 accent-rose-500 cursor-pointer"
                        />
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <Sparkles size={18} className="text-rose-500" />
                                <span className="font-bold text-gray-800">完全复刻</span>
                            </div>
                            <p className="text-sm text-gray-500">所有方面（包含上述所有选项）</p>
                        </div>
                    </label>
                </div>

                {/* 上传服装图片 */}
                <div className="px-6 pb-6">
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-wider mb-3">上传你的服装图片</p>
                    <div className="relative group">
                        <div className={`
              border-2 border-dashed rounded-xl p-6 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer min-h-[160px]
              ${filePreview ? 'border-rose-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
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
                                        <Upload size={20} className="text-gray-400 group-hover:text-rose-500" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-700">点击上传服装图片</p>
                                    <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG 格式</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* 底部按钮 */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-[2rem]">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all"
                    >
                        取消
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerateDisabled}
                        className={`
              px-8 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all
              ${isGenerateDisabled
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:shadow-xl hover:-translate-y-0.5 active:scale-[0.98]'}
            `}
                    >
                        <Sparkles size={20} />
                        <span>开始生成</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
