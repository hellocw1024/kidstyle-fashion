import React, { useRef, useState } from 'react';
import { Upload, Camera, X, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { validateBasic, validateWithAI, fileToImageElement, ValidationResult } from '../lib/imageValidator';
import { ZoomableImage } from './ZoomableImage';

interface FileUploaderProps {
    onUpload: (file: File) => void;
    accept?: string;
    maxSize?: number; // MB
    showPreview?: boolean;
    showCamera?: boolean;
    label?: string;
    validationType?: 'clothing' | 'model'; // 新增：验证类型
    enableAIValidation?: boolean; // 新增：是否启用AI验证
}

export function FileUploader({
    onUpload,
    accept = 'image/*',
    maxSize = 10,
    showPreview = true,
    showCamera = true,
    label = '上传图片',
    validationType,
    enableAIValidation = true,
}: FileUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [fileName, setFileName] = useState<string>('');
    const [validating, setValidating] = useState(false);
    const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (file: File | null) => {
        if (!file) return;

        // 重置验证结果
        setValidationResult(null);
        setValidating(true);

        try {
            // 基础验证
            if (validationType) {
                console.log(`🔍 开始验证 ${validationType} 类型图片:`, file.name);

                try {
                    const basicResult = await validateBasic(file, validationType);
                    console.log('📋 基础验证结果:', basicResult);

                    if (!basicResult.valid) {
                        setValidationResult(basicResult);
                        setValidating(false);
                        return;
                    }

                    // AI验证（如果启用）
                    if (enableAIValidation) {
                        try {
                            console.log('🤖 开始AI验证...');
                            const imageElement = await fileToImageElement(file);
                            const aiResult = await validateWithAI(imageElement, validationType);
                            console.log('🎯 AI验证结果:', aiResult);

                            setValidationResult(aiResult);

                            // 如果AI验证失败，不继续
                            if (!aiResult.valid) {
                                setValidating(false);
                                return;
                            }
                        } catch (aiError) {
                            // AI验证失败时的降级处理
                            console.warn('⚠️ AI验证失败，使用基础验证结果:', aiError);
                            setValidationResult({
                                valid: true,
                                level: 'warning',
                                reason: 'AI验证不可用，已跳过智能检测',
                                suggestions: ['基础验证已通过，您可以继续使用']
                            });
                        }
                    } else {
                        // 不使用AI验证时，显示基础验证结果
                        setValidationResult(basicResult);
                    }
                } catch (validationError) {
                    // 验证过程出错时的降级处理
                    console.error('❌ 验证过程出错:', validationError);
                    setValidationResult({
                        valid: true,
                        level: 'warning',
                        reason: '图片验证服务暂时不可用',
                        suggestions: ['基本检查已通过，您可以继续使用']
                    });
                }
            }

            // 验证通过或跳过验证，处理文件
            setFileName(file.name);

            if (showPreview) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }

            console.log('✅ 文件上传成功:', file.name);
            onUpload(file);

        } catch (error) {
            console.error('❌ 图片处理失败:', error);

            // 即使出错也显示详细信息，并允许用户继续
            const errorMessage = error instanceof Error ? error.message : '未知错误';
            setValidationResult({
                valid: true,  // 改为true，允许继续
                level: 'warning',
                reason: '图片验证遇到问题，但已允许上传',
                suggestions: [
                    `错误详情: ${errorMessage}`,
                    '建议使用清晰的单人照片以获得最佳效果'
                ]
            });

            // 仍然处理文件
            setFileName(file.name);
            if (showPreview) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(file);
            }
            onUpload(file);

        } finally {
            setValidating(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileSelect(file);
    };

    const clearPreview = () => {
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {label}
                </label>
            )}

            {preview ? (
                <div className="relative group/preview">
                    <ZoomableImage
                        src={preview}
                        alt="Preview"
                        containerClassName="w-full h-64 rounded-xl shadow-sm"
                        className="w-full h-full object-cover"
                    />
                    <button
                        onClick={clearPreview}
                        className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10"
                    >
                        <X size={16} />
                    </button>
                </div>
            ) : (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`group border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${isDragging
                        ? 'border-rose-400 bg-rose-50 shadow-inner'
                        : 'border-gray-200 bg-gray-50/30 hover:border-rose-300 hover:bg-white hover:shadow-sm'
                        }`}
                >
                    <div className={`mx-auto mb-4 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:text-rose-500 ${isDragging ? 'text-rose-500 scale-110' : 'text-gray-400'}`}>
                        <Upload size={24} />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                        {isDragging ? '释放以上传' : '拖拽图片到此处'}
                    </p>
                    <p className="text-xs text-gray-400 mb-6">
                        支持 JPG, PNG (最大 {maxSize}MB)
                    </p>

                    <div className="flex gap-3 justify-center">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={accept}
                            onChange={handleChange}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-5 py-2.5 bg-white text-rose-600 border border-rose-100 font-bold rounded-xl shadow-sm hover:shadow-md hover:border-rose-200 transition-all flex items-center gap-2"
                            disabled={validating}
                        >
                            选择文件
                        </button>
                        {showCamera && (
                            <>
                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => cameraInputRef.current?.click()}
                                    className="px-5 py-2.5 bg-white text-gray-600 border border-gray-200 font-bold rounded-xl shadow-sm hover:shadow-md hover:bg-gray-50 transition-all flex items-center gap-2"
                                    disabled={validating}
                                >
                                    <Camera size={18} />
                                    拍照
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Validation Result Display */}
            {validationResult && (
                <div className={`mt-3 p-3 rounded-lg ${validationResult.level === 'error' ? 'bg-red-50 border border-red-200' :
                    validationResult.level === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                        'bg-green-50 border border-green-200'
                    }`}>
                    <div className="flex items-start gap-2">
                        {validationResult.level === 'error' && <AlertCircle className="text-red-600 flex-shrink-0" size={20} />}
                        {validationResult.level === 'warning' && <AlertTriangle className="text-yellow-600 flex-shrink-0" size={20} />}
                        {validationResult.level === 'success' && <CheckCircle className="text-green-600 flex-shrink-0" size={20} />}
                        <div className="flex-1">
                            <p className={`text-sm font-semibold ${validationResult.level === 'error' ? 'text-red-900' :
                                validationResult.level === 'warning' ? 'text-yellow-900' :
                                    'text-green-900'
                                }`}>
                                {validationResult.reason}
                            </p>
                            {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                                <ul className={`mt-1 text-xs space-y-0.5 ${validationResult.level === 'error' ? 'text-red-700' :
                                    validationResult.level === 'warning' ? 'text-yellow-700' :
                                        'text-green-700'
                                    }`}>
                                    {validationResult.suggestions.map((suggestion, index) => (
                                        <li key={index}>• {suggestion}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
