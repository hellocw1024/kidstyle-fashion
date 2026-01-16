import React from 'react';


export const HeroSection: React.FC = () => {
    return (
        <div className="relative overflow-hidden">
            {/* 渐变背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600" />

            {/* 装饰性图案 */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            {/* 内容 */}
            <div className="relative px-6 py-16 text-center">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                    KidStyle AI
                </h1>
                <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
                    AI智能儿童服装展示生成，让您的商品瞬间生动起来
                </p>


            </div>
        </div>
    );
};
