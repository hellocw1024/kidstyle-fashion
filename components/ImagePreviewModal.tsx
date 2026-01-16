import React from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImagePreviewModalProps {
    imageUrl: string;
    onClose: () => void;
    title?: string;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
    imageUrl,
    onClose,
    title = "图片预览"
}) => {
    if (!imageUrl) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div
                className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center"
                onClick={e => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors bg-white/10 rounded-full hover:bg-white/20 backdrop-blur-sm"
                >
                    <X size={24} />
                </button>

                {/* Optional Title - only if needed, usually image preview is clean */}
                {/* <div className="absolute top-4 left-4 text-white font-medium drop-shadow-md">
                    {title}
                </div> */}

                {/* Image */}
                <img
                    src={imageUrl}
                    alt={title}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
            </div>
        </div>
    );
};
