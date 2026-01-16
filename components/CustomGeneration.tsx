import React, { useState, useRef } from 'react';
import { Upload, Plus, X, Image as ImageIcon } from 'lucide-react';

interface CustomGenerationProps {
    onGenerate: (params: any) => void;
    isGenerating: boolean;
    models: any[];
    config: any;
}

export function CustomGeneration({ onGenerate, isGenerating, models, config }: CustomGenerationProps) {
    // 状态管理
    const [activeTab, setActiveTab] = useState<'library' | 'upload'>('upload');
    const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);
    const [uploadPreviews, setUploadPreviews] = React.useState<string[]>([]);

    // 配置参数
    const [genType, setGenType] = React.useState<'MODEL' | 'PRODUCT'>('MODEL');
    const [gender, setGender] = React.useState('女');
    const [ageGroup, setAgeGroup] = React.useState('6-11岁');
    const [styling, setStyling] = React.useState('中性');
    const [style, setStyle] = React.useState('可爱风');
    const [pose, setPose] = React.useState('站立');
    const [composition, setComposition] = React.useState('全身');
    const [quality, setQuality] = React.useState('1K');
    const [ratio, setRatio] = React.useState('3:4');

    const fileInputRef = useRef<HTMLInputElement>(null);

    // 处理文件上传
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const newFiles = files.slice(0, 5 - uploadedFiles.length);

        setUploadedFiles(prev => [...prev, ...newFiles]);

        // 生成预览
        newFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadPreviews(prev => [...prev, e.target?.result as string]);
            };
            reader.readAsDataURL(file);
        });
    };

    // 删除图片
    const removeImage = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
        setUploadPreviews(prev => prev.filter((_, i) => i !== index));
    };

    // 生成处理
    const handleGenerate = () => {
        if (uploadedFiles.length === 0) {
            alert('请先上传服装图片！');
            return;
        }

        onGenerate({
            files: uploadedFiles,
            params: {
                type: genType,
                gender,
                ageGroup,
                style,
                pose,
                composition,
                quality,
                aspectRatio: ratio
            }
        });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">
                服装参考图 (可选)
            </h3>

            {/* 标签切换 */}
            <div className="flex gap-3">
                <button
                    onClick={() => setActiveTab('library')}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'library'
                            ? 'bg-rose-50 text-rose-600 border-2 border-rose-200'
                            : 'bg-gray-50 text-gray-500 border-2 border-gray-200'
                        }`}
                >
                    编辑库
                </button>
                <button
                    onClick={() => setActiveTab('upload')}
                    className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === 'upload'
                            ? 'bg-rose-50 text-rose-600 border-2 border-rose-200'
                            : 'bg-gray-50 text-gray-500 border-2 border-gray-200'
                        }`}
                >
                    本地上传
                </button>
                {uploadPreviews.length > 0 && activeTab === 'upload' && (
                    <button className="ml-auto p-2.5 rounded-lg bg-gray-100 hover:bg-gray-200">
                        <Plus size={20} className="text-gray-600" />
                    </button>
                )}
            </div>

            {/* 上传区域 */}
            {activeTab === 'upload' && (
                <div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {uploadPreviews.length === 0 ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-[3/4] border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-rose-300 hover:bg-rose-50/30 transition-all"
                        >
                            <ImageIcon size={40} className="text-gray-300 mb-2" />
                            <p className="text-xs font-bold text-gray-400">点击上传</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {uploadPreviews.map((preview, idx) => (
                                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-white shadow-sm group">
                                    <img src={preview} className="w-full h-full object-cover" alt={`预览${idx + 1}`} />
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                            {uploadPreviews.length < 5 && (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50"
                                >
                                    <Plus size={24} className="text-gray-300" />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* 配置选项 */}
            <div className="space-y-3 pt-3">
                {/* 模特性别、年龄段、造型组合 */}
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 mb-1 block">模特性别</label>
                        <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 text-xs font-semibold bg-white"
                        >
                            <option>女</option>
                            <option>男</option>
                            <option>中性</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 mb-1 block">年龄段</label>
                        <select
                            value={ageGroup}
                            onChange={(e) => setAgeGroup(e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 text-xs font-semibold bg-white"
                        >
                            <option>0-1岁</option>
                            <option>2-5岁</option>
                            <option>6-11岁</option>
                            <option>12-17岁</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 mb-1 block">造型组合</label>
                        <select
                            value={styling}
                            onChange={(e) => setStyling(e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 text-xs font-semibold bg-white"
                        >
                            <option>中性</option>
                            <option>甜美</option>
                            <option>帅气</option>
                        </select>
                    </div>
                </div>

                {/* 风格理解、摄影理解、整理比喻 */}
                <div className="grid grid-cols-3 gap-2">
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 mb-1 block">风格理解</label>
                        <select
                            value={style}
                            onChange={(e) => setStyle(e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 text-xs font-semibold bg-white"
                        >
                            <option>可爱风</option>
                            <option>自然</option>
                            <option>时尚</option>
                            <option>复古</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 mb-1 block">摄影理解</label>
                        <select
                            value={pose}
                            onChange={(e) => setPose(e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 text-xs font-semibold bg-white"
                        >
                            <option>站立</option>
                            <option>坐姿</option>
                            <option>跳跃</option>
                            <option>奔跑</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-[10px] font-bold text-gray-400 mb-1 block">整理比喻</label>
                        <select
                            value={composition}
                            onChange={(e) => setComposition(e.target.value)}
                            className="w-full px-2 py-2 rounded-lg border border-gray-200 text-xs font-semibold bg-white"
                        >
                            <option>全身</option>
                            <option>半身</option>
                            <option>特写</option>
                        </select>
                    </div>
                </div>

                {/* 画质选择 */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 mb-2 block flex items-center">
                        <span className="mr-1">⚡</span> 画质
                    </label>
                    <div className="flex gap-2">
                        {['1K', '2K', '4K'].map((q) => (
                            <button
                                key={q}
                                onClick={() => setQuality(q)}
                                className={`flex-1 py-2.5 rounded-xl font-bold text-sm border-2 transition-all ${quality === q
                                        ? 'bg-rose-500 border-rose-500 text-white'
                                        : 'bg-white border-gray-200 text-gray-400'
                                    }`}
                            >
                                {q}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 比例选择 */}
                <div>
                    <label className="text-[10px] font-bold text-gray-400 mb-2 block flex items-center">
                        <span className="mr-1">📐</span> 比例
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {[
                            { ratio: '1:1', w: 24, h: 24 },
                            { ratio: '3:4', w: 18, h: 24 },
                            { ratio: '4:3', w: 24, h: 18 },
                            { ratio: '9:16', w: 14, h: 24 },
                            { ratio: '16:9', w: 24, h: 14 }
                        ].map(({ ratio: r, w, h }) => (
                            <button
                                key={r}
                                onClick={() => setRatio(r)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${ratio === r
                                        ? 'bg-rose-50 border-rose-500'
                                        : 'bg-white border-gray-200'
                                    }`}
                            >
                                <div
                                    className={`border-2 rounded-sm mb-1 ${ratio === r ? 'bg-rose-200 border-rose-500' : 'bg-gray-100 border-gray-300'
                                        }`}
                                    style={{ width: `${w}px`, height: `${h}px` }}
                                />
                                <span className={`text-[8px] font-black ${ratio === r ? 'text-rose-600' : 'text-gray-400'}`}>
                                    {r}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* 生成按钮 */}
            <button
                onClick={handleGenerate}
                disabled={isGenerating || uploadedFiles.length === 0}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl font-black text-lg shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
                <span className="text-xl">✨</span>
                <span>{isGenerating ? '渲染中...' : '生成作品'}</span>
            </button>
        </div>
    );
}
