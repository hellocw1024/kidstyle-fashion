import React from 'react';
import { GenerationTemplate, GenerationType, SystemConfig } from '../types';
import { Sparkles, ArrowRight } from 'lucide-react';
import { getRecommendedTemplates } from '../lib/templateMatcher';

interface SmartRecommendationProps {
    uploadedImages: string[];
    templates: GenerationTemplate[];
    config: SystemConfig;
    onApplyTemplate: (templateId: string) => void;
    onViewMore: () => void;
}

const SmartRecommendation: React.FC<SmartRecommendationProps> = ({
    uploadedImages,
    templates,
    config,
    onApplyTemplate,
    onViewMore,
}) => {
    // 获取推荐模板（最多 3 个）
    const recommendations = getRecommendedTemplates(uploadedImages, templates, config, 3);

    // 如果没有模板，不显示推荐
    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div className="mt-6 p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 animate-in fade-in duration-500">
            {/* 标题 */}
            <div className="flex items-center space-x-2 mb-4">
                <Sparkles size={20} className="text-amber-500" />
                <h4 className="text-sm font-black text-amber-700">为您推荐相关模板</h4>
            </div>

            {/* 推荐卡片 */}
            <div className="grid grid-cols-1 gap-3 mb-4">
                {recommendations.map(({ template, matchScore, reasons }) => (
                    <div
                        key={template.id}
                        className="bg-white rounded-xl p-4 border-2 border-amber-100 hover:border-amber-300 transition-all group cursor-pointer"
                        onClick={() => onApplyTemplate(template.id)}
                    >
                        <div className="flex items-center justify-between">
                            {/* 左侧：模板信息 */}
                            <div className="flex items-center space-x-3 flex-1">
                                {/* 图标 */}
                                <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center text-2xl flex-shrink-0">
                                    {template.config.type === GenerationType.MODEL ? '👤' : '👕'}
                                </div>

                                {/* 信息 */}
                                <div className="flex-1 min-w-0">
                                    <h5 className="text-sm font-black text-gray-800 truncate">{template.name}</h5>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full">
                                            匹配度 {matchScore}%
                                        </span>
                                        {reasons.length > 0 && (
                                            <span className="text-[10px] text-gray-400 truncate">
                                                {reasons[0]}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 右侧：应用按钮 */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onApplyTemplate(template.id);
                                }}
                                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-black hover:bg-amber-600 transition-colors flex items-center space-x-1 shadow-md group-hover:shadow-lg flex-shrink-0"
                            >
                                <span>一键应用</span>
                                <ArrowRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* 查看更多 */}
            <button
                onClick={onViewMore}
                className="w-full text-center text-xs text-amber-600 hover:text-amber-700 font-bold transition-colors flex items-center justify-center space-x-1"
            >
                <span>或查看全部模板</span>
                <ArrowRight size={12} />
            </button>
        </div>
    );
};

export default SmartRecommendation;
