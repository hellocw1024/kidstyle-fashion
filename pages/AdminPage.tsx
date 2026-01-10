import React, { useState, useRef } from 'react';
import { 
  Users, CreditCard, ShoppingBag, TrendingUp, Check, X, Eye, Plus, Trash2, Save, Camera, Palette, Box, Maximize, UserCheck, Shirt, Upload, Filter, Search
} from 'lucide-react';
import { RechargeRequest, AppView, User, SystemConfig, Season } from '../types.ts';
import { ModelEntry } from '../constants.tsx';

interface Props {
  activeTab: AppView;
  setView: (v: AppView) => void;
  allUsers: User[]; 
  models: ModelEntry[];
  onModelsUpdate: (m: ModelEntry[]) => void;
  config: SystemConfig;
  onConfigUpdate: (c: SystemConfig) => void;
  rechargeRequests: RechargeRequest[];
  onAuditAction: (id: string, status: 'APPROVED' | 'REJECTED') => void;
}

const AdminPage: React.FC<Props> = ({ activeTab, setView, allUsers, models, onModelsUpdate, config, onConfigUpdate, rechargeRequests, onAuditAction }) => {
  const [editingKey, setEditingKey] = useState<keyof SystemConfig | null>(null);
  const [newValue, setNewValue] = useState('');
  const [previewScreenshot, setPreviewScreenshot] = useState<string | null>(null);
  const [modelFilter, setModelFilter] = useState({ gender: '', ageGroup: '', ethnicity: '', search: '' });
  const [selectedModels, setSelectedModels] = useState<string[]>([]);
  const [modelUploadModal, setModelUploadModal] = useState(false);
  const [modelUploadInfo, setModelUploadInfo] = useState({ gender: '', ageGroup: '', ethnicity: '', name: '' });
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const modelInputRef = useRef<HTMLInputElement>(null);

  const currentTab = (activeTab === AppView.ADMIN) ? AppView.STATS : activeTab;

  const handleAddItem = (key: keyof SystemConfig) => {
    if (!newValue.trim()) return;
    const target = config[key];
    if (Array.isArray(target)) {
      onConfigUpdate({ ...config, [key]: [...target, newValue.trim()] });
    }
    setNewValue('');
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

  const handleBatchModelDelete = () => {
    if (selectedModels.length === 0) return;
    if (confirm(`确定要删除选中的 ${selectedModels.length} 个模特吗？`)) {
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

    // 将所有文件转换为 Base64
    const filePromises = Array.from(selectedFiles).map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve(ev.target?.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    try {
      const base64Urls = await Promise.all(filePromises);

      const newModels: ModelEntry[] = base64Urls.map((url, index) => {
        const file = selectedFiles![index];
        return {
          id: `model_${Date.now()}_${index}`,
          url, // 🔴 存储 Base64 字符串而不是 Blob URL
          gender: modelUploadInfo.gender,
          ageGroup: modelUploadInfo.ageGroup,
          ethnicity: modelUploadInfo.ethnicity,
          name: modelUploadInfo.name || file.name.split('.')[0],
          uploadedBy: 'admin',
          uploadedAt: new Date().toISOString(),
          status: 'ACTIVE'
        };
      });

      onModelsUpdate([...models, ...newModels]);
      setModelUploadModal(false);
      setSelectedFiles(null);
      setPreviewImages([]);
      setModelUploadInfo({ gender: '', ageGroup: '', ethnicity: '', name: '' });
    } catch (error) {
      alert('图片处理失败，请重试！');
      console.error('Error converting images to base64:', error);
    }
  };

  // Fixed: Added Shirt to configSections to resolve missing component reference
  const configSections = [
    { key: 'categories', label: '服装品类', icon: <ShoppingBag size={18}/>, desc: 'T恤、衬衫等核心品类' },
    { key: 'styles', label: '视觉风格', icon: <Palette size={18}/>, desc: '英伦、森系、国风等调性' },
    { key: 'ageGroups', label: '模特年龄', icon: <UserCheck size={18}/>, desc: '0-1岁婴儿到青少年' },
    { key: 'ethnicities', label: '国籍肤色', icon: <Maximize size={18}/>, desc: '满足全球电商展示需求' },
    { key: 'compositions', label: '构图景别', icon: <Box size={18}/>, desc: '全身、半身或特写细节' },
    { key: 'poses', label: '姿势情绪', icon: <TrendingUp size={18}/>, desc: '奔跑、害羞、静态等' },
    { key: 'productForms', label: '呈现形式', icon: <Shirt size={18}/>, desc: '平铺、挂拍、3D建模' },
    { key: 'productBackgrounds', label: '背景材质', icon: <Maximize size={18}/>, desc: '木纹、白底、大理石等' }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
       <div className="mb-10">
          <h1 className="text-3xl font-black text-gray-800">后台管理中心</h1>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">深度参数与全局配置</p>
       </div>

       {currentTab === AppView.STATS && (
         <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: '活跃用户', value: allUsers.length, color: 'text-blue-500', icon: <Users/> },
              { label: '待审充值', value: rechargeRequests.filter(r => r.status === 'PENDING').length, color: 'text-rose-500', icon: <CreditCard/> },
              { label: '注册分类', value: config.categories.length, color: 'text-amber-500', icon: <ShoppingBag/> },
              { label: '系统状态', value: '运行中', color: 'text-green-500', icon: <Check/> }
            ].map(s => (
              <div key={s.label} className="bg-white p-6 rounded-3xl border flex items-center justify-between">
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p><h3 className="text-2xl font-black mt-1">{s.value}</h3></div>
                <div className={`${s.color} p-3 bg-gray-50 rounded-2xl`}>{s.icon}</div>
              </div>
            ))}
         </div>
       )}

       {currentTab === AppView.CONFIG && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {configSections.map(section => (
              <div key={section.key} className="bg-white p-6 rounded-3xl border hover:border-rose-300 transition-all group">
                 <div className="flex items-center justify-between mb-4">
                   <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">{section.icon}</div>
                   <button onClick={() => setEditingKey(section.key as any)} className="text-xs font-bold text-gray-400 hover:text-rose-500 uppercase">管理项目</button>
                 </div>
                 <h4 className="font-black text-gray-800">{section.label}</h4>
                 <p className="text-xs text-gray-400 mt-1">{section.desc}</p>
                 <div className="mt-4 flex flex-wrap gap-1">
                    {(config[section.key as keyof SystemConfig] as string[]).slice(0, 4).map(item => (
                      <span key={item} className="text-[9px] font-bold px-2 py-0.5 bg-gray-50 rounded border text-gray-400">{item}</span>
                    ))}
                    {(config[section.key as keyof SystemConfig] as string[]).length > 4 && <span className="text-[9px] text-gray-300">...</span>}
                 </div>
              </div>
            ))}
         </div>
       )}

{currentTab === AppView.RESOURCES && (
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
                        onChange={e => setModelFilter({...modelFilter, search: e.target.value})}
                        className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
                      />
                   </div>
                   <select value={modelFilter.gender} onChange={e => setModelFilter({...modelFilter, gender: e.target.value})} className="px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm">
                      <option value="">所有性别</option>
                      {config.genders.map(g => <option key={g} value={g}>{g}</option>)}
                   </select>
                   <select value={modelFilter.ageGroup} onChange={e => setModelFilter({...modelFilter, ageGroup: e.target.value})} className="px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm">
                      <option value="">所有年龄</option>
                      {config.ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
                   </select>
                   <select value={modelFilter.ethnicity} onChange={e => setModelFilter({...modelFilter, ethnicity: e.target.value})} className="px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm">
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
        )}

        {currentTab === AppView.AUDIT && (
          <div className="bg-white rounded-3xl border p-8">
             <h3 className="text-xl font-black mb-8">充值审核队列</h3>
             <div className="space-y-4">
                {rechargeRequests.filter(r => r.status === 'PENDING').map(req => (
                  <div key={req.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                     <div><p className="font-bold text-sm">用户: {req.userId}</p><p className="text-[10px] text-gray-400 uppercase font-bold">金额: ¥{req.amount} | 配额: +{req.quota}</p></div>
                     <div className="flex space-x-2">
                        <button onClick={() => setPreviewScreenshot(req.screenshot)} className="p-2 text-blue-500"><Eye size={18}/></button>
                        <button onClick={() => onAuditAction(req.id, 'APPROVED')} className="p-2 text-green-500"><Check size={18}/></button>
                        <button onClick={() => onAuditAction(req.id, 'REJECTED')} className="p-2 text-rose-500"><X size={18}/></button>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        )}

       {/* Category Editor Modal */}
       {editingKey && (
         <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setEditingKey(null)}></div>
            <div className="relative bg-white rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-in zoom-in-95">
               <h3 className="text-2xl font-black mb-6">管理 {configSections.find(s => s.key === editingKey)?.label}</h3>
               <div className="flex gap-2 mb-6">
                  <input type="text" value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="输入新选项..." className="flex-1 p-3 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none" />
                  <button onClick={() => handleAddItem(editingKey)} className="p-3 bg-rose-500 text-white rounded-xl"><Plus/></button>
               </div>
               <div className="max-h-64 overflow-y-auto space-y-2 mb-8 custom-scrollbar pr-2">
                  {(config[editingKey] as string[]).map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-transparent hover:border-rose-100 group">
                       <span className="text-sm font-bold text-gray-700">{item}</span>
                       <button onClick={() => handleRemoveItem(editingKey, i)} className="text-gray-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                    </div>
                  ))}
               </div>
               <button onClick={() => setEditingKey(null)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest">完成配置</button>
            </div>
         </div>
       )}

{/* 模特上传模态框 */}
        {modelUploadModal && (
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
                        onChange={e => setModelUploadInfo({...modelUploadInfo, name: e.target.value})}
                        placeholder="输入模特姓名（可选）"
                        className="w-full px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
                      />
                   </div>
                   
                   <div className="grid grid-cols-3 gap-3">
                      <div>
                         <label className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2 block">性别 *</label>
                         <select
                           value={modelUploadInfo.gender}
                           onChange={e => setModelUploadInfo({...modelUploadInfo, gender: e.target.value})}
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
                           onChange={e => setModelUploadInfo({...modelUploadInfo, ageGroup: e.target.value})}
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
                           onChange={e => setModelUploadInfo({...modelUploadInfo, ethnicity: e.target.value})}
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
                         Array.from(files).forEach(file => {
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
        )}

        {previewScreenshot && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-6 bg-black/95" onClick={() => setPreviewScreenshot(null)}>
             <img src={previewScreenshot} className="max-w-full max-h-full rounded-2xl" />
          </div>
        )}
    </div>
  );
};

export default AdminPage;