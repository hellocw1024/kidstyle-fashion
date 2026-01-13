import React, { useState, useMemo } from 'react';
import { GenerationTemplate } from '../types';
import { X, Search, Save } from 'lucide-react';
import TemplateCard from './TemplateCard';

interface TemplateSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    templates: GenerationTemplate[];
    selectedTemplateId: string | null;
    onApplyTemplate: (templateId: string) => void;
    onDeleteTemplate: (templateId: string) => void;
    onSaveTemplate: () => void;
}

const TemplateSidebar: React.FC<TemplateSidebarProps> = ({
    isOpen,
    onClose,
    templates,
    selectedTemplateId,
    onApplyTemplate,
    onDeleteTemplate,
    onSaveTemplate,
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    // 过滤模板
    const filteredTemplates = useMemo(() => {
        if (!searchQuery.trim()) return templates;

        const query = searchQuery.toLowerCase();
        return templates.filter(template => {
            const nameMatch = template.name.toLowerCase().includes(query);
            const descMatch = template.description?.toLowerCase().includes(query);
            const styleMatch = template.config.style.toLowerCase().includes(query);
            return nameMatch || descMatch || styleMatch;
        });
    }, [templates, searchQuery]);

    // 常用模板（使用次数 > 0，按使用次数排序）
    const frequentTemplates = useMemo(() => {
        return filteredTemplates
            .filter(t => t.useCount > 0)
            .sort((a, b) => b.useCount - a.useCount)
            .slice(0, 5);
    }, [filteredTemplates]);

    // 所有模板（按创建时间倒序）
    const allTemplates = useMemo(() => {
        return [...filteredTemplates].sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [filteredTemplates]);

    return (
        <>
            {/* 遮罩层 */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* 侧边栏 */}
            <div
                className={`fixed top-0 right-0 h-full w-[320px] bg-gradient-to-b from-white to-rose-50/30 shadow-2xl z-[110] transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                style={{
                    borderLeft: '2px solid #ffe4e9',
                }}
            >
                {/* 头部 */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-rose-100 p-4 z-10">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-black text-gray-800">我的模板库</h3>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* 搜索框 */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="搜索模板..."
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-rose-300 focus:outline-none focus:bg-white transition-colors"
                        />
                    </div>
                </div>

                {/* 内容区域 */}
                <div className="h-[calc(100%-180px)] overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {/* 常用模板 */}
                    {frequentTemplates.length > 0 && (
                        <section>
                            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                                <span className="mr-1">📌</span> 常用模板
                            </h4>
                            <div className="space-y-3">
                                {frequentTemplates.map(template => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        isSelected={selectedTemplateId === template.id}
                                        onApply={() => onApplyTemplate(template.id)}
                                        onDelete={() => onDeleteTemplate(template.id)}
                                    />
                                ))}
                            </div>
                        </section>
                    )}

                    {/* 全部模板 */}
                    <section>
                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3 flex items-center">
                            <span className="mr-1">📂</span> 全部模板
                        </h4>
                        {allTemplates.length > 0 ? (
                            <div className="space-y-3">
                                {allTemplates.map(template => (
                                    <TemplateCard
                                        key={template.id}
                                        template={template}
                                        isSelected={selectedTemplateId === template.id}
                                        onApply={() => onApplyTemplate(template.id)}
                                        onDelete={() => onDeleteTemplate(template.id)}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-400">
                                    {searchQuery ? '未找到匹配的模板' : '暂无模板'}
                                </p>
                                <p className="text-xs text-gray-300 mt-1">
                                    {!searchQuery && '配置好参数后，点击下方按钮保存'}
                                </p>
                            </div>
                        )}
                    </section>
                </div>

                {/* 底部保存按钮 */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-rose-100">
                    <button
                        onClick={onSaveTemplate}
                        className="w-full py-3 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center space-x-2"
                    >
                        <Save size={16} />
                        <span>保存当前配置为模板</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default TemplateSidebar;
