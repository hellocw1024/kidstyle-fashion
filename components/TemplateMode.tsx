import React, { useState } from 'react';
import { FileUploader } from './FileUploader';
import { Button } from './Button';
import { Card } from './Card';
import { TrendingUp } from 'lucide-react';
import { IconSparkles } from './icons/AppIcons';

interface Template {
    id: string;
    name: string;
    preview: string;
    category: string;
    tags: string[];
    usageCount: number;
    params: {
        scene: string;
        style: string;
        composition: string;
        ratio: string;
    };
}

const MOCK_TEMPLATES: Template[] = [
    {
        id: 'template-1',
        name: '时尚大片',
        preview: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=200&h=300&fit=crop',
        category: '时尚',
        tags: ['户外', '阳光'],
        usageCount: 128,
        params: {
            scene: 'outdoor',
            style: 'fashionable',
            composition: 'full-body',
            ratio: '3:4'
        }
    },
    {
        id: 'template-2',
        name: '清新自然',
        preview: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=200&h=300&fit=crop',
        category: '清新',
        tags: ['自然', '简约'],
        usageCount: 89,
        params: {
            scene: 'natural',
            style: 'fresh',
            composition: 'half-body',
            ratio: '3:4'
        }
    }
];

interface TemplateModeProps {
    onGenerate: () => void;
}

export const TemplateMode: React.FC<TemplateModeProps> = ({ onGenerate }) => {
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [activeCategory, setActiveCategory] = useState('全部');

    const categories = ['全部', '时尚', '清新', '复古', '可爱'];

    return (
        <div className="space-y-6">
            {/* Template Categories */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    📋 模板分类
                </h3>
                <select
                    value={activeCategory}
                    onChange={(e) => setActiveCategory(e.target.value)}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-semibold text-gray-700 focus:border-rose-400 outline-none transition-all"
                >
                    {categories.map(category => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>

            <hr className="border-gray-200" />

            {/* Template Grid */}
            <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                    📸 模板列表
                </h3>
                <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto">
                    {MOCK_TEMPLATES.map(template => (
                        <Card
                            key={template.id}
                            hover
                            onClick={() => setSelectedTemplate(template)}
                            className={`
                p-0 overflow-hidden cursor-pointer
                ${selectedTemplate?.id === template.id ? 'ring-2 ring-rose-500' : ''}
              `}
                        >
                            <div className="aspect-[3/4] overflow-hidden">
                                <img
                                    src={template.preview}
                                    alt={template.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-3">
                                <h4 className="font-bold text-sm text-gray-900 mb-1">{template.name}</h4>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <TrendingUp size={12} />
                                    <span>{template.usageCount} 次使用</span>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Selected Template Info */}
            {selectedTemplate && (
                <>
                    <hr className="border-gray-200" />
                    <div className="p-4 bg-blue-50 rounded-xl">
                        <h4 className="font-bold text-blue-900 mb-2">✓ 已选模板：{selectedTemplate.name}</h4>
                        <div className="text-sm text-blue-700 space-y-1">
                            <p>• 场景: {selectedTemplate.params.scene}</p>
                            <p>• 风格: {selectedTemplate.params.style}</p>
                            <p>• 构图: {selectedTemplate.params.composition}</p>
                            <p>• 比例: {selectedTemplate.params.ratio}</p>
                        </div>
                    </div>
                </>
            )}

            <hr className="border-gray-200" />

            {/* Upload Clothing */}
            <FileUploader
                label="📤 上传服装"
                onUpload={(file) => console.log('Clothing uploaded:', file)}
            />

            <hr className="border-gray-200" />

            {/* Generate Button */}
            <Button
                variant="primary"
                size="lg"
                fullWidth
                icon={<IconSparkles active={!!selectedTemplate} />}
                onClick={() => onGenerate()}
                disabled={!selectedTemplate}
            >
                使用模板生成
                <span className="text-xs opacity-90">（消耗 1 配额）</span>
            </Button>
        </div>
    );
};
