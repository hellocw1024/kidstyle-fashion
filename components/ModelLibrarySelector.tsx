import React, { useState, useMemo } from 'react';
import { ModelEntry } from '../constants';
import { Check } from 'lucide-react';

interface ModelLibrarySelectorProps {
    models: ModelEntry[];
    selectedModel?: string;
    onSelect: (modelId: string) => void;
    filterGender?: string;
    filterAgeGroup?: string;
    filterEthnicity?: string;
}

export const ModelLibrarySelector: React.FC<ModelLibrarySelectorProps> = ({
    models,
    selectedModel,
    onSelect,
    filterGender,
    filterAgeGroup,
    filterEthnicity
}) => {
    const [localGenderFilter, setLocalGenderFilter] = useState<string>('all');
    const [localAgeFilter, setLocalAgeFilter] = useState<string>('all');
    const [localEthnicityFilter, setLocalEthnicityFilter] = useState<string>('all');

    // Use external filters if provided, otherwise use local filters
    const genderFilter = filterGender || localGenderFilter;
    const ageFilter = filterAgeGroup || localAgeFilter;
    const ethnicityFilter = filterEthnicity || localEthnicityFilter;

    // Filter models
    const filteredModels = useMemo(() => {
        return models
            .filter(m => m.status === 'ACTIVE')
            .filter(m => genderFilter === 'all' || m.gender === genderFilter)
            .filter(m => ageFilter === 'all' || m.ageGroup === ageFilter)
            .filter(m => ethnicityFilter === 'all' || m.ethnicity === ethnicityFilter);
    }, [models, genderFilter, ageFilter, ethnicityFilter]);

    return (
        <div className="space-y-4">
            {/* Filters (only show if not controlled externally) */}
            <div className="grid grid-cols-3 gap-3">
                {filterGender === undefined && (
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 ml-1">性别</label>
                        <div className="relative">
                            <select
                                value={genderFilter}
                                onChange={(e) => setLocalGenderFilter(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 transition-all appearance-none"
                            >
                                <option value="all">全部</option>
                                <option value="boy">男孩</option>
                                <option value="girl">女孩</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                                ▼
                            </div>
                        </div>
                    </div>
                )}

                {filterAgeGroup === undefined && (
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 ml-1">年龄段</label>
                        <div className="relative">
                            <select
                                value={ageFilter}
                                onChange={(e) => setLocalAgeFilter(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 transition-all appearance-none"
                            >
                                <option value="all">全部年龄</option>
                                <option value="0-1">0-1岁</option>
                                <option value="1-3">1-3岁</option>
                                <option value="3-5">3-5岁</option>
                                <option value="5-8">5-8岁</option>
                                <option value="8-12">8-12岁</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                                ▼
                            </div>
                        </div>
                    </div>
                )}

                {filterEthnicity === undefined && (
                    <div className="space-y-1">
                        <label className="block text-xs font-bold text-gray-500 ml-1">肤色</label>
                        <div className="relative">
                            <select
                                value={ethnicityFilter}
                                onChange={(e) => setLocalEthnicityFilter(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-300 transition-all appearance-none"
                            >
                                <option value="all">全部特征</option>
                                <option value="asian">亚裔</option>
                                <option value="caucasian">欧美</option>
                                <option value="african">非裔</option>
                                <option value="mixed">混血</option>
                            </select>
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-[10px]">
                                ▼
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Model Grid */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-gray-600">
                        选择模特 ({filteredModels.length})
                    </label>
                </div>

                <div className="grid grid-cols-4 gap-3 max-h-[500px] overflow-y-auto p-1">
                    {filteredModels.length > 0 ? (
                        filteredModels.map(model => (
                            <div
                                key={model.id}
                                onClick={() => onSelect(model.id)}
                                className={`
                  relative cursor-pointer rounded-xl overflow-hidden
                  transition-all duration-200
                  ${selectedModel === model.id
                                        ? 'ring-4 ring-rose-500 shadow-lg'
                                        : 'hover:ring-2 hover:ring-rose-300 shadow-sm hover:shadow-md'
                                    }
                `}
                            >
                                {/* Model Image */}
                                <div className="aspect-[3/4] bg-gray-100">
                                    <img
                                        src={model.imageUrl}
                                        alt={model.name || model.id}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x400?text=Model';
                                        }}
                                    />
                                </div>

                                {/* Selected Indicator */}
                                {selectedModel === model.id && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
                                        <Check className="text-white" size={16} />
                                    </div>
                                )}

                                {/* Model Info */}
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                                    <p className="text-white text-xs font-bold truncate">
                                        {model.name || `模特 ${model.id}`}
                                    </p>
                                    <p className="text-white/80 text-xs">
                                        {model.gender === 'boy' ? '男孩' : '女孩'} · {model.ageGroup}
                                    </p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-2 py-8 text-center text-gray-400">
                            <p className="text-sm">没有找到符合条件的模特</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Selected Model Info */}
            {selectedModel && (
                <div className="p-3 bg-green-50 rounded-lg border-2 border-green-200">
                    <div className="flex items-center gap-2">
                        <Check className="text-green-600" size={18} />
                        <p className="text-sm font-bold text-green-900">
                            已选择: {filteredModels.find(m => m.id === selectedModel)?.name || selectedModel}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};
