import React, { useState, useRef } from 'react';
import {
  Users, CreditCard, ShoppingBag, TrendingUp, Check, X, Eye, Plus, Trash2, Save, Camera, Palette, Box, Maximize, UserCheck, Shirt, Upload, Filter, Search, MessageSquare, ChevronRight
} from 'lucide-react';
import { RechargeRequest, AppView, User, SystemConfig } from '../types.ts';
import { ModelEntry } from '../constants.tsx';

interface Props {
  activeTab: AppView;
  setView: (v: AppView) => void;
  allUsers: User[];
  onUserUpdate: (users: User[]) => void;  // 用于更新用户列表
  models: ModelEntry[];
  onModelsUpdate: (m: ModelEntry[]) => void;
  config: SystemConfig;
  onConfigUpdate: (c: SystemConfig) => void;
  rechargeRequests: RechargeRequest[];
  onAuditAction: (id: string, status: 'APPROVED' | 'REJECTED') => void;
}

const AdminPage: React.FC<Props> = ({ activeTab, setView, allUsers, onUserUpdate, models, onModelsUpdate, config, onConfigUpdate, rechargeRequests, onAuditAction }) => {
  const currentTab = (activeTab === AppView.ADMIN) ? AppView.STATS : activeTab;
  const [editingKey, setEditingKey] = useState<keyof SystemConfig | null>(null);
  const [newValue, setNewValue] = useState('');
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState({ gender: '', ageGroup: '', ethnicity: '', search: '' });
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelUploadModal, setModelUploadModal] = useState(false);
  const [modelUploadInfo, setModelUploadInfo] = useState({ gender: '', ageGroup: '', ethnicity: '', name: '' });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [editingPromptTemplate, setEditingPromptTemplate] = useState<keyof SystemConfig['promptTemplates'] | null>(null);
  const [promptValue, setPromptValue] = useState('');

  // 用户管理相关 state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'USER' | 'ADMIN'>('ALL');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserData, setEditUserData] = useState<{ quota: number; role: 'USER' | 'ADMIN' } | null>(null);
  const [saveResultModal, setSaveResultModal] = useState<{ show: boolean; success: boolean; message: string }>({ show: false, success: false, message: '' });  // 保存结果提示

  const [modelUsageStats, setModelUsageStats] = useState<{ date: string; counts: Record<string, number> }[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Gemini 官方免费限制参考 (RPM 不好衡量，按每日 50 次估算，实际以官方为准)
  const MODEL_DAILY_LIMITS: Record<string, number> = {
    'gemini-3-pro-image-preview': 50,
    'gemini-2.5-flash-image': 100,
    '未知模型': 50
  };

  const modelInputRef = useRef<HTMLInputElement>(null);

  // ✅ 加载模型使用统计
  const fetchModelStats = async () => {
    setIsLoadingStats(true);
    try {
      const { getAllImages } = await import('../lib/database.ts');
      const allImages = await getAllImages();
      const generatedImages = allImages.filter(img => img.type === 'GENERATE');

      // 按日期和模型聚合
      const statsMap: Record<string, Record<string, number>> = {};

      generatedImages.forEach(img => {
        const date = img.date;
        const model = img.modelName || '未知模型';

        if (!statsMap[date]) statsMap[date] = {};
        statsMap[date][model] = (statsMap[date][model] || 0) + 1;
      });

      // 转换为数组并按日期排序
      const statsArray = Object.entries(statsMap).map(([date, counts]) => ({
        date,
        counts
      })).sort((a, b) => b.date.localeCompare(a.date));

      setModelUsageStats(statsArray.slice(0, 7)); // 只显示最近 7 天
    } catch (error) {
      console.error('获取模型统计失败:', error);
    } finally {
      setIsLoadingStats(false);
    }
  };

  React.useEffect(() => {
    if (currentTab === AppView.STATS) {
      fetchModelStats();
    }
  }, [currentTab]);


  const handleAddItem = (key: keyof SystemConfig) => {
    if (!newValue.trim()) return;
    const target = config[key];
    if (Array.isArray(target)) {
      onConfigUpdate({ ...config, [key]: [...target, newValue.trim()] });
    }
    setNewValue('');
  };

  const handlePromptSave = (templateKey: keyof SystemConfig['promptTemplates']) => {
    onConfigUpdate({
      ...config,
      promptTemplates: {
        ...config.promptTemplates,
        [templateKey]: promptValue
      }
    });
    setEditingPromptTemplate(null);
    setPromptValue('');
    setPromptModalOpen(false);
  };

  const handleRemoveItem = (key: keyof SystemConfig, index: number) => {
    const target = config[key];
    if (Array.isArray(target)) {
      onConfigUpdate({ ...config, [key]: target.filter((_, i) => i !== index) });
    }
  };

  const filteredModels = models.filter(model => {
    if (modelFilter.gender && model.gender !== modelFilter.gender) return false;
    if (modelFilter.ageGroup && model.ageGroup !== modelFilter.ageGroup) return false;
    if (modelFilter.ethnicity && model.ethnicity !== modelFilter.ethnicity) return false;
    if (modelFilter.search && !model.name?.toLowerCase().includes(modelFilter.search.toLowerCase())) return false;
    return true;
  });

  const toggleModelSelection = (modelId: string) => {
    setSelectedModels(prev =>
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleBatchModelDelete = async () => {
    if (selectedModels.length === 0) return;
    if (confirm(`确定要删除选中的 ${selectedModels.length} 个模特吗？`)) {
      // 🔑 同时删除 Supabase Storage 中的文件
      const modelsToDelete = models.filter(m => selectedModels.includes(m.id));

      for (const model of modelsToDelete) {
        // 1. 删除 Supabase Storage 中的文件
        if (model.url.includes('supabase.co')) {
          console.log(`🗑️ 删除 Storage 文件: ${model.url}`);
          const { deleteImage } = await import('../lib/storage.ts');
          await deleteImage(model.url);
        }

        // 2. 从数据库中删除记录
        const { deleteModelFromDb } = await import('../lib/database.ts');
        await deleteModelFromDb(model.id);
      }

      onModelsUpdate(models.filter(m => !selectedModels.includes(m.id)));
      setSelectedModels([]);
    }
  };

  const handleModelUpload = async () => {
    // 校验：性别、年龄、国籍都必须选择
    if (!modelUploadInfo.gender || !modelUploadInfo.ageGroup || !modelUploadInfo.ethnicity) {
      alert('请先填写性别、年龄和国籍信息！');
      return;
    }

    // 校验：是否选择了文件
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('请先选择要上传的照片！');
      return;
    }

    try {
      console.log('📤 开始上传模特照片到 Supabase Storage...');

      // 🔑 关键改进：上传到 Supabase Storage 而不是转换为 Base64
      const newModels: ModelEntry[] = [];

      for (let index = 0; index < selectedFiles.length; index++) {
        const file = selectedFiles[index];

        console.log(`📤 上传第 ${index + 1}/${selectedFiles.length} 张: ${file.name}`);

        // 使用已有的 uploadImage 工具上传到 Supabase Storage
        const { uploadImage } = await import('../lib/storage.ts');
        const publicUrl = await uploadImage(file, 'admin', 'models');

        if (!publicUrl) {
          console.error(`❌ 上传失败: ${file.name}`);
          alert(`上传 ${file.name} 失败，请重试！`);
          continue; // 继续上传其他文件
        }

        console.log(`✅ 上传成功，URL: ${publicUrl}`);

        const newModel: ModelEntry = {
          id: `model_${Date.now()}_${index}`,
          url: publicUrl, // ✅ 存储 Supabase CDN URL 而不是 Base64
          gender: modelUploadInfo.gender,
          ageGroup: modelUploadInfo.ageGroup,
          ethnicity: modelUploadInfo.ethnicity,
          name: modelUploadInfo.name || file.name.split('.')[0],
          uploadedBy: 'admin',
          uploadedAt: new Date().toISOString(),
          status: 'ACTIVE'
        };

        // ✅ 将记录保存到数据库
        const { addModel } = await import('../lib/database.ts');
        const dbSuccess = await addModel(newModel);

        if (dbSuccess) {
          newModels.push(newModel);
        } else {
          console.warn(`⚠️ 无法将模特 ${newModel.name} 的记录保存到数据库`);
        }
      }

      if (newModels.length === 0) {
        alert('没有成功上传任何照片，请检查网络连接！');
        return;
      }

      console.log(`✅ 成功上传 ${newModels.length} 张模特照片到 Supabase Storage`);

      onModelsUpdate([...models, ...newModels]);
      setModelUploadModal(false);
      setSelectedFiles(null);
      setPreviewImages([]);
      setModelUploadInfo({ gender: '', ageGroup: '', ethnicity: '', name: '' });

      alert(`成功上传 ${newModels.length} 张模特照片！`);
    } catch (error) {
      console.error('❌ 上传异常:', error);
      alert('上传失败，请重试！');
    }
  };

  // Fixed: Added Shirt to configSections to resolve missing component reference
  const configSections = [
    { key: 'styles', label: '视觉风格', icon: <Palette size={18} />, desc: '英伦、森系、国风等调性' },
    { key: 'ageGroups', label: '模特年龄', icon: <UserCheck size={18} />, desc: '0-1岁婴儿到青少年' },
    { key: 'genders', label: '模特性别', icon: <Users size={18} />, desc: '男、女、中性及通用' },
    { key: 'ethnicities', label: '国籍肤色', icon: <Maximize size={18} />, desc: '满足全球电商展示需求' },
    { key: 'compositions', label: '构图景别', icon: <Box size={18} />, desc: '全身、半身或特写细节' },
    { key: 'poses', label: '姿势情绪', icon: <TrendingUp size={18} />, desc: '奔跑、害羞、静态等' },
    { key: 'scenes', label: '拍摄场景', icon: <Camera size={18} />, desc: '外景、室内、专业摄影棚等' },
    { key: 'productForms', label: '呈现形式', icon: <Shirt size={18} />, desc: '平铺、挂拍、3D建模' },
    { key: 'productFocus', label: '细节聚焦', icon: <Search size={18} />, desc: '面料特写、工艺细节、整体' },
    { key: 'productBackgrounds', label: '背景材质', icon: <Maximize size={18} />, desc: '木纹、白底、大理石等' },
    { key: 'promptTemplates', label: 'AI 提示词管理', icon: <MessageSquare size={18} />, desc: '自定义 AI 生成提示词模板' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-800">后台管理中心</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">深度参数与全局配置</p>
      </div>

      {currentTab === AppView.STATS && (
        <div className="md:col-span-4 mt-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-black text-gray-800">AI 模型每日生成统计</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">追溯模型使用额度与频率</p>
              </div>
              <button onClick={fetchModelStats} className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                <TrendingUp size={20} className={isLoadingStats ? 'animate-pulse' : ''} />
              </button>
            </div>

            {isLoadingStats ? (
              <div className="flex justify-center py-20">
                <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-500 rounded-full animate-spin" />
              </div>
            ) : modelUsageStats.length > 0 ? (
              <div className="space-y-6">
                {modelUsageStats.map(stat => (
                  <div key={stat.date} className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-rose-500 rounded-full" />
                      <span className="text-sm font-black text-gray-700">{stat.date}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pl-4">
                      {Object.entries(stat.counts).map(([model, count]) => {
                        const limit = MODEL_DAILY_LIMITS[model] || 50;
                        const percent = Math.min(100, (count / limit) * 100);
                        const isWarning = percent > 80;

                        return (
                          <div key={model} className="p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{model}</p>
                              <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${isWarning ? 'bg-rose-100 text-rose-500' : 'bg-green-100 text-green-600'}`}>
                                剩余 {Math.max(0, limit - count)}
                              </span>
                            </div>
                            <div className="flex items-end justify-between">
                              <span className="text-2xl font-black text-gray-800">{count}</span>
                              <span className="text-[10px] font-bold text-gray-400 mb-1">/ {limit} 次</span>
                            </div>
                            <div className="w-full h-1 bg-gray-200 rounded-full mt-3 overflow-hidden">
                              <div
                                className={`h-full transition-all duration-500 ${isWarning ? 'bg-rose-500' : 'bg-green-500'}`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-100">
                <TrendingUp size={48} className="text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 font-bold">暂无生成数据</p>
                <p className="text-gray-300 text-xs mt-1">生成图片后此处将展示模型使用分布</p>
              </div>
            )}
          </div>
        </div>
      )}

      {
        currentTab === AppView.CONFIG && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configSections.map(section => {
              const isPromptSection = section.key === 'promptTemplates';
              const sectionValue = config[section.key as keyof SystemConfig];

              return (
                <div key={section.key} className="bg-white p-6 rounded-3xl border hover:border-rose-300 transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">{section.icon}</div>
                    <button
                      onClick={() => isPromptSection ? setPromptModalOpen(true) : setEditingKey(section.key as any)}
                      className="text-xs font-bold text-gray-400 hover:text-rose-500 uppercase"
                    >
                      {isPromptSection ? '编辑提示词' : '管理项目'}
                    </button>
                  </div>
                  <h4 className="font-black text-gray-800">{section.label}</h4>
                  <p className="text-xs text-gray-400 mt-1">{section.desc}</p>
                  {!isPromptSection && Array.isArray(sectionValue) && (
                    <div className="mt-4 flex flex-wrap gap-1">
                      {sectionValue.slice(0, 4).map(item => (
                        <span key={item} className="text-[9px] font-bold px-2 py-0.5 bg-gray-50 rounded border text-gray-400">{item}</span>
                      ))}
                      {sectionValue.length > 4 && <span className="text-[9px] text-gray-300">...</span>}
                    </div>
                  )}
                  {isPromptSection && (
                    <div className="mt-4 text-xs text-rose-500 font-bold">
                      点击编辑自定义提示词模板
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      }

      {
        currentTab === AppView.RESOURCES && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black">模特库管理</h3>
                  <p className="text-sm text-gray-400 mt-1">上传和管理模特照片，支持按年龄、性别、国籍筛选</p>
                </div>
                <button onClick={() => setModelUploadModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-bold">
                  <Upload size={18} />
                  <span>上传模特</span>
                </button>
              </div>

              {/* 筛选器 */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索模特..."
                    value={modelFilter.search}
                    onChange={e => setModelFilter({ ...modelFilter, search: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
                  />
                </div>
                <select value={modelFilter.gender} onChange={e => setModelFilter({ ...modelFilter, gender: e.target.value })} className="px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm">
                  <option value="">所有性别</option>
                  {config.genders.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <select value={modelFilter.ageGroup} onChange={e => setModelFilter({ ...modelFilter, ageGroup: e.target.value })} className="px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm">
                  <option value="">所有年龄</option>
                  {config.ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
                <select value={modelFilter.ethnicity} onChange={e => setModelFilter({ ...modelFilter, ethnicity: e.target.value })} className="px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm">
                  <option value="">所有国籍</option>
                  {config.ethnicities.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>

              {/* 批量操作 */}
              {selectedModels.length > 0 && (
                <div className="flex items-center justify-between p-4 bg-rose-50 rounded-2xl mb-6">
                  <span className="text-sm font-bold text-rose-600">已选择 {selectedModels.length} 个模特</span>
                  <div className="flex space-x-2">
                    <button onClick={() => handleBatchModelDelete()} className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-bold">批量删除</button>
                    <button onClick={() => setSelectedModels([])} className="px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-sm font-bold">取消选择</button>
                  </div>
                </div>
              )}

              {/* 模特网格 */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredModels.map(model => (
                  <div key={model.id} className={`relative group rounded-2xl overflow-hidden border-2 transition-all ${selectedModels.includes(model.id) ? 'border-rose-500 shadow-lg' : 'border-gray-200 hover:border-rose-300'}`}>
                    <div className="aspect-[3/4] bg-gray-100">
                      <img src={model.url} className="w-full h-full object-cover" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-xs font-bold truncate">{model.name || `模特${model.id.slice(-4)}`}</p>
                        <p className="text-white/80 text-[10px]">{model.gender} · {model.ageGroup} · {model.ethnicity}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => toggleModelSelection(model.id)} className={`w-6 h-6 rounded-full border-2 ${selectedModels.includes(model.id) ? 'bg-rose-500 border-rose-500' : 'bg-white border-gray-300'}`}>
                        {selectedModels.includes(model.id) && <Check size={12} className="text-white mx-auto" />}
                      </button>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${model.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                        {model.status === 'ACTIVE' ? '启用' : '禁用'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {filteredModels.length === 0 && (
                <div className="text-center py-12">
                  <Upload size={48} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold">暂无模特数据</p>
                  <p className="text-gray-300 text-sm mt-1">点击上方按钮上传模特照片</p>
                </div>
              )}
            </div>
          </div>
        )
      }

      {
        currentTab === AppView.AUDIT && (
          <div className="bg-white rounded-3xl border p-8">
            <h3 className="text-xl font-black mb-8">充值审核队列</h3>
            <div className="space-y-4">
              {rechargeRequests.filter(r => r.status === 'PENDING').map(req => (
                <div key={req.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <div><p className="font-bold text-sm">用户: {req.userId}</p><p className="text-[10px] text-gray-400 uppercase font-bold">金额: ¥{req.amount} | 配额: +{req.quota}</p></div>
                  <div className="flex space-x-2">
                    <button onClick={() => setPreviewScreenshot(req.screenshot)} className="p-2 text-blue-500"><Eye size={18} /></button>
                    <button onClick={() => onAuditAction(req.id, 'APPROVED')} className="p-2 text-green-500"><Check size={18} /></button>
                    <button onClick={() => onAuditAction(req.id, 'REJECTED')} className="p-2 text-rose-500"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {
        currentTab === AppView.USERS && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-black">用户管理</h3>
                  <p className="text-sm text-gray-400 mt-1">查看和编辑所有用户信息、配额及权限</p>
                </div>
              </div>

              {/* 搜索和筛选 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative md:col-span-2">
                  <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    placeholder="搜索手机号..."
                    value={userSearch}
                    onChange={e => setUserSearch(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
                  />
                </div>
                <select
                  value={userRoleFilter}
                  onChange={e => setUserRoleFilter(e.target.value as any)}
                  className="px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
                >
                  <option value="ALL">所有角色</option>
                  <option value="USER">普通用户</option>
                  <option value="ADMIN">管理员</option>
                </select>
              </div>

              {/* 用户表格 */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2">
                      <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">手机号</th>
                      <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">角色</th>
                      <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">配额</th>
                      <th className="text-left py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">注册时间</th>
                      <th className="text-right py-4 px-4 text-xs font-black text-gray-400 uppercase tracking-widest">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers
                      .filter(u => {
                        const matchSearch = u.phone.includes(userSearch);
                        const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                        return matchSearch && matchRole;
                      })
                      .map(user => (
                        <tr key={user.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4">
                            <span className="font-bold text-gray-800">{user.phone}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                              {user.role === 'ADMIN' ? '管理员' : '用户'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="font-bold text-gray-800">{user.quota}</span>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-sm text-gray-500">-</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => {
                                setEditingUserId(user.id);
                                setEditUserData({ quota: user.quota, role: user.role });
                              }}
                              className="px-3 py-1.5 bg-rose-500 text-white rounded-lg text-sm font-bold hover:bg-rose-600 transition-colors"
                            >
                              编辑
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              {allUsers.filter(u => {
                const matchSearch = u.phone.includes(userSearch);
                const matchRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
                return matchSearch && matchRole;
              }).length === 0 && (
                  <div className="text-center py-12">
                    <Users size={48} className="text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-400 font-bold">未找到匹配的用户</p>
                  </div>
                )}
            </div>
          </div>
        )
      }

      {/* 用户编辑模态框 */}
      {
        editingUserId && editUserData && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingUserId(null)}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-2xl font-black mb-6">编辑用户信息</h3>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    手机号
                  </label>
                  <div className="text-lg font-bold text-gray-800">
                    {allUsers.find(u => u.id === editingUserId)?.phone}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    配额
                  </label>
                  <input
                    type="number"
                    value={editUserData.quota}
                    onChange={e => setEditUserData({ ...editUserData, quota: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-lg font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">
                    角色
                  </label>
                  <select
                    value={editUserData.role}
                    onChange={e => setEditUserData({ ...editUserData, role: e.target.value as 'USER' | 'ADMIN' })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-lg font-bold"
                  >
                    <option value="USER">普通用户</option>
                    <option value="ADMIN">管理员</option>
                  </select>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={async () => {
                      try {
                        console.log('🔄 正在保存用户信息...', { userId: editingUserId, data: editUserData });

                        // 保存更改到数据库
                        const { updateUser } = await import('../lib/database.ts');
                        const success = await updateUser(editingUserId, {
                          quota: editUserData.quota,
                          role: editUserData.role
                        });

                        if (success) {
                          console.log('✅ 数据库更新成功');

                          // 更新本地 allUsers 状态
                          const updatedUsers = allUsers.map(u =>
                            u.id === editingUserId
                              ? { ...u, quota: editUserData.quota, role: editUserData.role }
                              : u
                          );
                          onUserUpdate(updatedUsers);

                          // ✅ 显示成功模态框
                          setSaveResultModal({
                            show: true,
                            success: true,
                            message: '用户信息已成功更新！\n\n配额和角色已保存到数据库。'
                          });
                          setEditingUserId(null);
                          setEditUserData(null);
                        } else {
                          console.error('❌ 数据库更新失败');
                          // ❌ 显示失败模态框
                          setSaveResultModal({
                            show: true,
                            success: false,
                            message: '更新失败！\n\n数据库更新返回失败，请检查网络连接和数据库配置。'
                          });
                        }
                      } catch (error) {
                        console.error('❌ 保存异常:', error);
                        // ❌ 显示异常模态框
                        setSaveResultModal({
                          show: true,
                          success: false,
                          message: `保存失败！\n\n错误信息：${error}\n\n请检查浏览器控制台获取详细信息。`
                        });
                      }
                    }}
                    className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-rose-600 transition-colors"
                  >
                    保存
                  </button>
                  <button
                    onClick={() => setEditingUserId(null)}
                    className="flex-1 py-4 bg-gray-200 text-gray-700 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-300 transition-colors"
                  >
                    取消
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Category Editor Modal */}
      {
        editingKey && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingKey(null)}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-2xl font-black mb-6">管理 {configSections.find(s => s.key === editingKey)?.label}</h3>
              <div className="flex gap-2 mb-6">
                <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="输入新选项..." className="flex-1 p-3 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none" />
                <button onClick={() => handleAddItem(editingKey)} className="p-3 bg-rose-500 text-white rounded-xl"><Plus /></button>
              </div>
              <div className="max-h-64 overflow-y-auto space-y-2 mb-8 custom-scrollbar pr-2">
                {Array.isArray(config[editingKey]) && (config[editingKey] as string[]).map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-rose-100 group">
                    <span className="text-sm font-bold text-gray-700">{item}</span>
                    <button onClick={() => handleRemoveItem(editingKey, i)} className="text-gray-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
              <button onClick={() => setEditingKey(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest">完成配置</button>
            </div>
          </div>
        )
      }

      {/* 模特上传模态框 */}
      {
        modelUploadModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModelUploadModal(false)}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95">
              <h3 className="text-2xl font-black mb-6">上传模特照片</h3>

              {/* 模特信息表单 */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">模特姓名</label>
                  <input
                    type="text"
                    value={modelUploadInfo.name}
                    onChange={e => setModelUploadInfo({ ...modelUploadInfo, name: e.target.value })}
                    placeholder="输入模特姓名（可选）"
                    className="w-full px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">性别 *</label>
                    <select
                      value={modelUploadInfo.gender}
                      onChange={e => setModelUploadInfo({ ...modelUploadInfo, gender: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
                      required
                    >
                      <option value="">选择性别</option>
                      {config.genders.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">年龄 *</label>
                    <select
                      value={modelUploadInfo.ageGroup}
                      onChange={e => setModelUploadInfo({ ...modelUploadInfo, ageGroup: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
                      required
                    >
                      <option value="">选择年龄</option>
                      {config.ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">国籍 *</label>
                    <select
                      value={modelUploadInfo.ethnicity}
                      onChange={e => setModelUploadInfo({ ...modelUploadInfo, ethnicity: e.target.value })}
                      className="w-full px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
                      required
                    >
                      <option value="">选择国籍</option>
                      {config.ethnicities.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* 上传区域 */}
              <div
                className="border-2 border-dashed border-gray-200 hover:border-rose-400 rounded-2xl p-8 text-center transition-colors cursor-pointer"
                onClick={() => modelInputRef.current?.click()}
              >
                <Upload size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 font-bold mb-2">
                  {selectedFiles && selectedFiles.length > 0
                    ? `已选择 ${selectedFiles.length} 张照片`
                    : '点击或拖拽上传'}
                </p>
                <p className="text-gray-400 text-sm">支持 JPG、PNG 格式，可批量上传</p>
                <input
                  ref={modelInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      setSelectedFiles(files);
                      // 生成预览图
                      const previews: string[] = [];
                      Array.from(files as FileList).forEach((file: File) => {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          previews.push(ev.target?.result as string);
                          if (previews.length === files.length) {
                            setPreviewImages(previews);
                          }
                        };
                        reader.readAsDataURL(file);
                      });
                    }
                  }}
                  className="hidden"
                />
              </div>

              {/* 显示已选择的图片预览 */}
              {previewImages.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      已选择 {previewImages.length} 张照片
                    </p>
                    <button
                      onClick={() => {
                        setSelectedFiles(null);
                        setPreviewImages([]);
                        if (modelInputRef.current) {
                          modelInputRef.current.value = '';
                        }
                      }}
                      className="text-xs text-rose-500 hover:text-rose-600 font-bold"
                    >
                      清空全部
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto p-2">
                    {previewImages.map((img, index) => (
                      <div key={index} className="relative group aspect-[3/4] rounded-xl overflow-hidden border-2 border-gray-200 hover:border-rose-400 transition-colors">
                        <img src={img} className="w-full h-full object-cover" alt={`预览 ${index + 1}`} />
                        {selectedFiles && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                            <p className="text-white text-xs truncate">
                              {selectedFiles[index]?.name}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    setModelUploadModal(false);
                    setSelectedFiles(null);
                    setPreviewImages([]);
                    setModelUploadInfo({ gender: '', ageGroup: '', ethnicity: '', name: '' });
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold"
                >
                  取消
                </button>
                <button
                  onClick={handleModelUpload}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
                >
                  确认上传
                </button>
              </div>
            </div>
          </div>
        )
      }

      {
        previewScreenshot && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/95" onClick={() => setPreviewScreenshot(null)}>
            <img src={previewScreenshot} className="max-w-full max-h-full rounded-2xl" />
          </div>
        )
      }

      {/* 提示词管理模态框 */}
      {
        promptModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPromptModalOpen(false)}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-4xl p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-hidden flex flex-col">
              <h3 className="text-2xl font-black mb-6">AI 提示词模板管理</h3>

              {editingPromptTemplate ? (
                // 编辑单个模板
                <div className="flex-1 flex flex-col">
                  <div className="mb-4">
                    <h4 className="text-lg font-bold text-gray-800 mb-2">
                      {
                        editingPromptTemplate === 'mainPrompt' ? '主提示词' :
                          editingPromptTemplate === 'modelModePrompt' ? '真人模特模式提示词' :
                            editingPromptTemplate === 'productModePrompt' ? '纯服装展示模式提示词' :
                              editingPromptTemplate === 'sceneGuidance' ? '场景指导' :
                                editingPromptTemplate === 'qualityGuidance' ? '画质指导' :
                                  '额外指导'
                      }
                    </h4>
                    <p className="text-xs text-gray-400">使用 {`{{变量名}}`} 格式插入占位符</p>
                  </div>
                  <textarea
                    value={promptValue}
                    onChange={e => setPromptValue(e.target.value)}
                    className="flex-1 w-full p-4 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm font-mono resize-none"
                    placeholder="输入提示词模板..."
                  />
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => {
                        setEditingPromptTemplate(null);
                        setPromptValue('');
                      }}
                      className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold"
                    >
                      取消
                    </button>
                    <button
                      onClick={() => handlePromptSave(editingPromptTemplate)}
                      className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-bold hover:bg-rose-600 transition-colors"
                    >
                      保存修改
                    </button>
                  </div>
                </div>
              ) : (
                // 模板列表
                <div className="flex-1 overflow-y-auto">
                  <div className="space-y-3">
                    {config.promptTemplates && Object.keys(config.promptTemplates).length > 0 ? (
                      Object.entries(config.promptTemplates).map(([key, value]) => {
                        const templateValue = value as string;
                        return (
                          <div
                            key={key}
                            onClick={() => {
                              setEditingPromptTemplate(key as keyof SystemConfig['promptTemplates']);
                              setPromptValue(templateValue);
                            }}
                            className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-rose-400 cursor-pointer group transition-all relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 blur-3xl rounded-full -mr-8 -mt-8 group-hover:bg-rose-500/10 transition-colors" />
                            <div className="flex items-start justify-between relative z-10">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-3">
                                  <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl group-hover:scale-110 transition-transform">
                                    <MessageSquare size={20} />
                                  </div>
                                  <div>
                                    <h5 className="text-sm font-black text-gray-800">
                                      {
                                        key === 'mainPrompt' ? '核心任务提示词 (Main Strategy)' :
                                          key === 'modelModePrompt' ? '真人模特渲染模型 (Model Engine)' :
                                            key === 'productModePrompt' ? '产品展示增强 (Product Logic)' :
                                              key === 'sceneGuidance' ? '环境光效指导 (Atmosphere)' :
                                                key === 'qualityGuidance' ? '画质与精度控制 (Resolution)' :
                                                  key === 'additionalGuidance' ? '细节微调规则 (Fine-tuning)' :
                                                    key
                                      }
                                    </h5>
                                    <div className="flex items-center space-x-2 mt-0.5">
                                      <span className="text-[8px] font-black px-2 py-0.5 bg-gray-100 text-gray-400 rounded-full uppercase tracking-tighter">System Template</span>
                                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter ${templateValue.length > 100 ? 'bg-green-50 text-green-500' : 'bg-blue-50 text-blue-500'}`}>
                                        {templateValue.length > 100 ? 'Advanced' : 'Standard'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="bg-gray-50/50 rounded-2xl p-4 border border-gray-100/50">
                                  <p className="text-[11px] text-gray-500 leading-relaxed font-mono line-clamp-2">
                                    {templateValue}
                                  </p>
                                </div>
                              </div>
                              <div className="ml-4 p-2 text-gray-300 group-hover:text-rose-500 transition-colors">
                                <ChevronRight size={20} />
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-400 text-sm">暂无提示词模板配置</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      }

      {saveResultModal.show && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
          <div className="relative bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl animate-in zoom-in-95">
            {/* 图标 */}
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${saveResultModal.success ? 'bg-green-100' : 'bg-rose-100'}`}>
              <span className="text-5xl">{saveResultModal.success ? '✅' : '❌'}</span>
            </div>

            {/* 标题 */}
            <h3 className={`text-3xl font-black text-center mb-4 ${saveResultModal.success ? 'text-green-600' : 'text-rose-600'}`}>
              {saveResultModal.success ? '保存成功' : '保存失败'}
            </h3>

            {/* 消息内容 */}
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <p className="text-center text-gray-700 whitespace-pre-line font-medium">
                {saveResultModal.message}
              </p>
            </div>

            {/* 关闭按钮 */}
            <button
              onClick={() => setSaveResultModal({ show: false, success: false, message: '' })}
              className={`w-full py-4 rounded-2xl font-black text-lg uppercase tracking-widest transition-all ${saveResultModal.success
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                }`}
            >
              确定
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;