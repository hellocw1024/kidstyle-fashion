import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { ImagePreviewModal } from './ImagePreviewModal';

interface ZoomableImageProps {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
}

export const ZoomableImage: React.FC<ZoomableImageProps> = ({
    src,
    alt,
    className = "",
    containerClassName = ""
}) => {
    const [isZoomed, setIsZoomed] = useState(false);

    return (
        <>
            <div
                className={`group relative overflow-hidden cursor-pointer ${containerClassName}`}
                onClick={() => setIsZoomed(true)}
            >
                <img
                    src={src}
                    alt={alt}
                    className={className}
                />

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <div className="p-3 bg-white/20 hover:bg-white/30 rounded-full backdrop-blur-md border border-white/50 text-white shadow-lg">
                            <Maximize2 size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {isZoomed && (
                <ImagePreviewModal
                    imageUrl={src}
                    onClose={() => setIsZoomed(false)}
                    title={alt}
                />
            )}
        </>
    );
};
