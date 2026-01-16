import React from 'react';

interface GenerationLayoutProps {
    leftPanel: React.ReactNode;
    rightPanel: React.ReactNode;
}

export const GenerationLayout: React.FC<GenerationLayoutProps> = ({
    leftPanel,
    rightPanel
}) => {
    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            {/* Left Panel - Fixed Width on Desktop, Full Width on Mobile */}
            <div className="w-full md:w-[360px] bg-white border-b md:border-r border-gray-100 flex-shrink-0 md:h-screen overflow-y-auto custom-scrollbar z-20 shadow-sm md:shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
                <div className="p-6 md:pb-24"> {/* pb-24 for safe area if button at bottom */}
                    {leftPanel}
                </div>
            </div>

            {/* Right Panel - Adaptive Width */}
            <div className="flex-1 md:h-screen overflow-hidden bg-[#fafafa]">
                {rightPanel}
            </div>
        </div>
    );
};
