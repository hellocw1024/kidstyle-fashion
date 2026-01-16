import React from 'react';
import { Card } from './Card';

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
    icon,
    title,
    description,
    onClick
}) => {
    return (
        <Card
            hover
            onClick={onClick}
            className="min-w-[140px] p-6 text-center cursor-pointer"
        >
            <div className="text-4xl mb-3">{icon}</div>
            <h3 className="text-base font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
        </Card>
    );
};

interface FeatureCardsProps {
    onFeatureClick: (featureId: string) => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({ onFeatureClick }) => {
    const features = [
        {
            id: 'camera',
            icon: '📸',
            title: '拍照生成',
            description: '直接拍摄，立即生成'
        },
        {
            id: 'smart',
            icon: '⚡',
            title: '一键智能',
            description: '批量生成，智能配置'
        },
        {
            id: 'custom',
            icon: '✨',
            title: '自定义',
            description: '精细配置，完全掌控'
        },
        {
            id: 'remake',
            icon: '🎨',
            title: '做同款',
            description: '参考复刻，风格一致'
        },
        {
            id: 'template',
            icon: '📂',
            title: '模板库',
            description: '预设模板，快速应用'
        },
        {
            id: 'history',
            icon: '⏱️',
            title: '历史记录',
            description: '查看已生成作品'
        }
    ];

    return (
        <div className="px-6 py-8 overflow-x-auto">
            <div className="flex gap-4 min-w-max pb-2">
                {features.map(feature => (
                    <FeatureCard
                        key={feature.id}
                        icon={feature.icon}
                        title={feature.title}
                        description={feature.description}
                        onClick={() => onFeatureClick(feature.id)}
                    />
                ))}
            </div>
        </div>
    );
};
