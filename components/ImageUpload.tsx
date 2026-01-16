import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
    onImagesChange: (files: File[]) => void;
    maxImages?: number;
}

export function ImageUpload({ onImagesChange, maxImages = 5 }: ImageUploadProps) {
    const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (files: FileList | null) => {
        if (!files) return;

        const newFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        const remaining = maxImages - previews.length;
        const filesToAdd = newFiles.slice(0, remaining);

        const newPreviews = filesToAdd.map(file => ({
            file,
            url: URL.createObjectURL(file)
        }));

        const updated = [...previews, ...newPreviews];
        setPreviews(updated);
        onImagesChange(updated.map(p => p.file));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previews[index].url);
        const updated = previews.filter((_, i) => i !== index);
        setPreviews(updated);
        onImagesChange(updated.map(p => p.file));
    };

    return (
        <div className="space-y-4">
            {/* 上传区域 */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragging
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-300 hover:bg-gray-50'
                    }`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                />
                <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-full bg-rose-100 flex items-center justify-center">
                        <Upload size={32} className="text-rose-500" />
                    </div>
                    <div>
                        <p className="text-lg font-bold text-gray-700">点击或拖拽上传服装图片</p>
                        <p className="text-sm text-gray-400 mt-1">支持 JPG、PNG 格式，最多 {maxImages} 张</p>
                    </div>
                </div>
            </div>

            {/* 预览列表 */}
            {previews.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {previews.map((preview, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={preview.url}
                                alt={`预览 ${index + 1}`}
                                className="w-full h-32 object-cover rounded-xl border-2 border-gray-100"
                            />
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeImage(index);
                                }}
                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {previews.length > 0 && (
                <p className="text-sm text-gray-500 text-center">
                    已上传 {previews.length} / {maxImages} 张图片
                </p>
            )}
        </div>
    );
}
