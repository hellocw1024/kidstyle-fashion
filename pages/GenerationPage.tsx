
import React, { useState, useRef, useMemo } from 'react';
import { Season, GenerationType, User, ImageResource, SystemConfig } from '../types.ts';
import { Upload, Wand2, Check, Loader2, Image as ImageIcon, X, Plus, ArrowLeft, Maximize2, Download, Monitor, Scaling, Search } from 'lucide-react';
import { generateClothingImage } from '../services/geminiService.ts';
import { ModelEntry } from '../constants.tsx';
import { generateThumbnail } from '../lib/thumbnail.ts';

interface Props {
  user: User;
  models: ModelEntry[];
  config: SystemConfig;
  onQuotaUpdate: (q: number) => void;
  onAddResource: (res: ImageResource) => void;
}

const GenerationPage: React.FC<Props> = ({ user, models, config, onQuotaUpdate, onAddResource }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImgs, setUploadedImgs] = useState<string[]>([]);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isModelLibraryOpen, setIsModelLibraryOpen] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState<string | null>(null);
  const [customModelImg, setCustomModelImg] = useState<string | null>(null);
  const [modelLibraryFilter, setModelLibraryFilter] = useState({ gender: '', ageGroup: '', ethnicity: '', search: '' });

  // Generation parameters
  const [category, setCategory] = useState('通用服装'); // ✅ 设置默认值，不再显示选择框
  const [genType, setGenType] = useState<GenerationType>(GenerationType.MODEL);
  const [season, setSeason] = useState<Season>(Season.SUMMER); // ✅ 设置默认值，不再显示选择框
  const [style, setStyle] = useState(config.styles[0]);
  const [ageGroup, setAgeGroup] = useState(config.ageGroups[2]);
  const [gender, setGender] = useState(config.genders[1]);
  const [ethnicity, setEthnicity] = useState(config.ethnicities[0]);
  const [composition, setComposition] = useState(config.compositions[0]);
  const [pose, setPose] = useState(config.poses[0]);
  const [productForm, setProductForm] = useState(config.productForms[0]);
  const [productFocus, setProductFocus] = useState(config.productFocus[0]);
  const [productBackground, setProductBackground] = useState(config.productBackgrounds[0]);
  const [scene, setScene] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [quality, setQuality] = useState('1K');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const filesToUpload = files.slice(0, 5 - uploadedImgs.length);

    for (const file of filesToUpload) {
      try {
        // 直接使用 base64，不再上传到 Storage
        const reader = new FileReader();
        reader.onload = async (ev) => {
          const base64 = ev.target?.result as string;
          setUploadedImgs(prev => [...prev, base64]);

          // ✅ 生成缩略图
          let thumbnail: string | undefined;
          try {
            thumbnail = await generateThumbnail(base64, { maxWidth: 300, maxHeight: 300, quality: 0.7 });
          } catch (err) {
            console.warn('缩略图生成失败，将使用原图:', err);
          }

          // 添加到资源列表
          onAddResource({
            id: 'up-' + Date.now() + Math.random().toString(36).substr(2, 5),
            url: base64,
            type: 'UPLOAD',
            category,
            season,
            date: new Date().toISOString().split('T')[0],
            tags: ['原始素材'],
            thumbnail  // ✅ 添加缩略图字段
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('处理上传文件失败:', error);
      }
    }
  };

  const handleModelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 直接使用 base64，不再上传到 Storage
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target?.result as string;
        setCustomModelImg(base64);
      };
      reader.readAsDataURL(file);
      setSelectedModelId(null);
    }
  };

  const startGeneration = async () => {
    if (isGenerating) return;
    const cost = quality === '1K' ? 1 : quality === '2K' ? 2 : 5;
    if (user.quota < cost) return alert("配额不足");

    setIsGenerating(true);
    setError(null);

    const modelRefImage = customModelImg || (selectedModelId ? models.find(m => m.id === selectedModelId)?.url : undefined);

    try {
      const result = await generateClothingImage({
        category, season, style, type: genType,
        ageGroup: genType === GenerationType.MODEL ? ageGroup : undefined,
        gender: genType === GenerationType.MODEL ? gender : undefined,
        scene: scene || '', // 不指定场景，让 AI 根据服装自动判断
        quality, aspectRatio, baseImages: uploadedImgs, modelImage: modelRefImage,
        ethnicity: genType === GenerationType.MODEL ? ethnicity : undefined,
        composition: genType === GenerationType.MODEL ? composition : undefined,
        pose: genType === GenerationType.MODEL ? pose : undefined,
        productForm: genType === GenerationType.PRODUCT ? productForm : undefined,
        productFocus: genType === GenerationType.PRODUCT ? productFocus : undefined,
        productBackground: genType === GenerationType.PRODUCT ? productBackground : undefined,
        customPrompt
      });

      // ✅ 设置生成的图片
      setResultImg(result);
      onQuotaUpdate(user.quota - cost);

      // ✅ 自动生成缩略图并保存到本地（IndexedDB）
      let thumbnail: string | undefined;
      try {
        thumbnail = await generateThumbnail(result, { maxWidth: 300, maxHeight: 300, quality: 0.7 });
      } catch (err) {
        console.warn('缩略图生成失败，将使用原图:', err);
      }

      // ✅ 自动保存到本地
      onAddResource({
        id: 'gen-' + Date.now(),
        url: result,
        type: 'GENERATE',
        category,
        season,
        date: new Date().toISOString().split('T')[0],
        tags: [style, quality],
        thumbnail
      });

      console.log('✅ 图片已自动保存到本地 IndexedDB');
      setStep(3);
    } catch (err: any) {
      setError("生成失败：" + (err.message || "未知错误"));
    } finally { setIsGenerating(false); }
  };

  const selectedModelUrl = useMemo(() => {
    if (customModelImg) return customModelImg;
    if (selectedModelId) return models.find(m => m.id === selectedModelId)?.url;
    return null;
  }, [customModelImg, selectedModelId, models]);

  const filteredModels = useMemo(() => {
    return models.filter(model => {
      if (model.status !== 'ACTIVE') return false;
      if (modelLibraryFilter.gender && model.gender !== modelLibraryFilter.gender) return false;
      if (modelLibraryFilter.ageGroup && model.ageGroup !== modelLibraryFilter.ageGroup) return false;
      if (modelLibraryFilter.ethnicity && model.ethnicity !== modelLibraryFilter.ethnicity) return false;
      if (modelLibraryFilter.search && !model.name?.toLowerCase().includes(modelLibraryFilter.search.toLowerCase())) return false;
      return true;
    });
  }, [models, modelLibraryFilter]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
        {[1, 2, 3].map((s) => (
          <React.Fragment key={s}>
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step >= s ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white border-gray-200 text-gray-400'}`}>
                {step > s ? <Check size={18} /> : s}
              </div>
              <span className={`text-[10px] mt-2 font-black uppercase tracking-widest ${step >= s ? 'text-rose-500' : 'text-gray-400'}`}>
                {['上传服装', '深度配置', '生成结果'][s-1]}
              </span>
            </div>
            {s < 3 && <div className={`flex-1 h-0.5 mx-2 mb-6 ${step > s ? 'bg-rose-500' : 'bg-gray-100'}`} />}
          </React.Fragment>
        ))}
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px] border border-gray-100 flex flex-col md:flex-row">
        {/* Left Side: Sidebar */}
        <div className="w-full md:w-2/5 p-6 bg-gray-50/50 border-r overflow-y-auto custom-scrollbar max-h-[850px]">
          {step === 1 ? (
            <div className="space-y-6">
               <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest">1. 选择并上传服装</h3>
               <div onClick={() => fileInputRef.current?.click()} className="aspect-[3/4] border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer hover:border-rose-400 hover:bg-rose-50/30 transition-all overflow-hidden relative group">
                 {uploadedImgs.length === 0 ? (
                   <><Upload className="text-gray-300 group-hover:text-rose-400 mb-2 transition-colors" size={32} /><p className="text-[10px] font-bold text-gray-500 uppercase">点击上传主图素材</p></>
                 ) : (
                   <div className="grid grid-cols-2 gap-3 p-4 w-full h-full overflow-y-auto custom-scrollbar bg-white/50 backdrop-blur">
                      {uploadedImgs.map((img, i) => (
                        <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group border-2 border-white shadow-sm">
                          <img src={img} className="w-full h-full object-cover" />
                          <button onClick={(e) => {e.stopPropagation(); setUploadedImgs(prev => prev.filter((_, idx) => idx !== i))}} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                        </div>
                      ))}
                      {uploadedImgs.length < 5 && <div className="aspect-square bg-white flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-100"><Plus className="text-gray-300" /></div>}
                   </div>
                 )}
               </div>
               <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" multiple />
               <button onClick={() => uploadedImgs.length > 0 && setStep(2)} className={`w-full py-5 rounded-2xl font-black text-lg shadow-[0_15px_30px_-5px_rgba(244,63,94,0.2)] transition-all ${uploadedImgs.length > 0 ? 'bg-rose-500 text-white hover:scale-[1.01] active:scale-95' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                 下一步
               </button>
            </div>
          ) : step === 2 ? (
            <div className="space-y-6 animate-in fade-in duration-300">
               <div className="flex items-center -ml-2 mb-2">
                 <button onClick={() => setStep(1)} className="p-2 hover:bg-gray-200/50 rounded-xl text-gray-400 hover:text-rose-500 transition-all"><ArrowLeft size={20} /></button>
                 <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest ml-1">深度配置中心</h3>
               </div>

               <section className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase ml-1">生成模式</label>
                 <div className="grid grid-cols-2 gap-2">
                   {[GenerationType.MODEL, GenerationType.PRODUCT].map(t => (
                     <button key={t} onClick={() => setGenType(t)} className={`py-3 rounded-xl text-[11px] border-2 font-black transition-all ${genType === t ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-md' : 'border-gray-100 bg-white text-gray-400'}`}>{t === GenerationType.MODEL ? '真人模特' : '纯服装展示'}</button>
                   ))}
                 </div>
               </section>

               {genType === GenerationType.MODEL ? (
                 <div className="space-y-4 pt-2 border-t border-gray-200/50">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-gray-400 ml-1 uppercase">模特参考图 (可选)</label>
                       <div className="flex items-center justify-between">
                          <div className="flex space-x-3">
                             <button onClick={() => setIsModelLibraryOpen(true)} className="px-4 py-2.5 text-xs font-black text-rose-500 bg-rose-50 border-2 border-rose-200 rounded-xl hover:bg-rose-100 transition-colors">模特库</button>
                             <button onClick={() => modelInputRef.current?.click()} className="px-4 py-2.5 text-xs font-black text-gray-500 bg-gray-50 border-2 border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">本地上传</button>
                             <input type="file" ref={modelInputRef} onChange={handleModelUpload} className="hidden" accept="image/*" />
                          </div>
                          <div className="relative group">
                            <div className="w-32 h-40 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-white overflow-hidden">
                               {selectedModelUrl ? <img src={selectedModelUrl} className="w-full h-full object-cover" /> : <Plus size={24} className="text-gray-300" />}
                            </div>
                            {selectedModelUrl && (
                              <button
                                onClick={() => {
                                  setSelectedModelId(null);
                                  setCustomModelImg(null);
                                }}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"
                                title="清除模特参考图"
                              >
                                <X size={14} />
                              </button>
                            )}
                          </div>
                       </div>
                    </div>

                    {selectedModelUrl && (
                      <div className="flex items-center space-x-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-xl">
                        <Check size={14} className="text-rose-600" />
                        <p className="text-[10px] font-bold text-rose-600">已选择模特参考图，性别、年龄、国籍将自动从参考图推断</p>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-1">模特性别</label>
                        <select
                          value={gender}
                          onChange={e => setGender(e.target.value)}
                          disabled={!!selectedModelUrl}
                          className={`w-full p-2.5 rounded-xl border-2 text-[10px] font-black outline-none transition-all ${
                            selectedModelUrl
                              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'border-gray-100 bg-white text-gray-600 focus:border-rose-300'
                          }`}
                        >
                          {config.genders.map(g => <option key={g} value={g}>{g}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-1">年龄段</label>
                        <select
                          value={ageGroup}
                          onChange={e => setAgeGroup(e.target.value as any)}
                          disabled={!!selectedModelUrl}
                          className={`w-full p-2.5 rounded-xl border-2 text-[10px] font-black outline-none transition-all ${
                            selectedModelUrl
                              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'border-gray-100 bg-white text-gray-600 focus:border-rose-300'
                          }`}
                        >
                          {config.ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-1">国籍肤色</label>
                        <select
                          value={ethnicity}
                          onChange={e => setEthnicity(e.target.value)}
                          disabled={!!selectedModelUrl}
                          className={`w-full p-2.5 rounded-xl border-2 text-[10px] font-black outline-none transition-all ${
                            selectedModelUrl
                              ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'border-gray-100 bg-white text-gray-600 focus:border-rose-300'
                          }`}
                        >
                          {config.ethnicities.map(e => <option key={e} value={e}>{e}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-1">风格调性</label>
                        <select value={style} onChange={e => setStyle(e.target.value)} className="w-full p-2.5 rounded-xl border-2 border-gray-100 text-[10px] font-black bg-white outline-none focus:border-rose-300 transition-all">{config.styles.map(s => <option key={s} value={s}>{s}</option>)}</select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-1">姿势情绪</label>
                        <select value={pose} onChange={e => setPose(e.target.value)} className="w-full p-2.5 rounded-xl border-2 border-gray-100 text-[10px] font-black bg-white outline-none focus:border-rose-300 transition-all">{config.poses.map(p => <option key={p} value={p}>{p}</option>)}</select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-1">景别构图</label>
                        <select value={composition} onChange={e => setComposition(e.target.value)} className="w-full p-2.5 rounded-xl border-2 border-gray-100 text-[10px] font-black bg-white outline-none focus:border-rose-300 transition-all">{config.compositions.map(c => <option key={c} value={c}>{c}</option>)}</select>
                      </div>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4 pt-2 border-t border-gray-200/50">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 ml-1">风格调性</label>
                      <select value={style} onChange={e => setStyle(e.target.value)} className="w-full p-3 rounded-xl border-2 border-gray-100 text-xs font-black bg-white outline-none focus:border-rose-300 transition-all">{config.styles.map(s => <option key={s} value={s}>{s}</option>)}</select>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-1">呈现形式</label>
                        <select value={productForm} onChange={e => setProductForm(e.target.value)} className="w-full p-2.5 rounded-xl border-2 border-gray-100 text-[10px] font-black bg-white outline-none focus:border-rose-300 transition-all">{config.productForms.map(f => <option key={f} value={f}>{f}</option>)}</select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-1">细节聚焦</label>
                        <select value={productFocus} onChange={e => setProductFocus(e.target.value)} className="w-full p-2.5 rounded-xl border-2 border-gray-100 text-[10px] font-black bg-white outline-none focus:border-rose-300 transition-all">{config.productFocus.map(f => <option key={f} value={f}>{f}</option>)}</select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 ml-1">背景材质</label>
                        <select value={productBackground} onChange={e => setProductBackground(e.target.value)} className="w-full p-2.5 rounded-xl border-2 border-gray-100 text-[10px] font-black bg-white outline-none focus:border-rose-300 transition-all">{config.productBackgrounds.map(b => <option key={b} value={b}>{b}</option>)}</select>
                      </div>
                    </div>
                 </div>
               )}

               <div className="space-y-4 pt-4 border-t border-gray-200/50">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 ml-1 uppercase flex items-center"><Monitor size={12} className="mr-1" /> 画质</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['1K', '2K', '4K'].map(q => (
                         <button key={q} onClick={() => setQuality(q)} className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all ${quality === q ? 'border-rose-500 bg-rose-50 text-rose-600' : 'border-gray-100 bg-white text-gray-400'}`}>
                           {q}
                         </button>
                       ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 ml-1 uppercase flex items-center"><Scaling size={12} className="mr-1" /> 比例</label>
                    <div className="grid grid-cols-5 gap-2">
                       {[
                         { ratio: '1:1', width: 24, height: 24 },
                         { ratio: '3:4', width: 18, height: 24 },
                         { ratio: '4:3', width: 24, height: 18 },
                         { ratio: '9:16', width: 14, height: 24 },
                         { ratio: '16:9', width: 24, height: 14 }
                       ].map(({ ratio, width, height }) => (
                         <button
                           key={ratio}
                           onClick={() => setAspectRatio(ratio)}
                           className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${aspectRatio === ratio ? 'border-rose-500 bg-rose-50' : 'border-gray-100 bg-white hover:border-gray-200'}`}
                         >
                           <div className={`border-2 ${aspectRatio === ratio ? 'border-rose-500 bg-rose-200' : 'border-gray-300 bg-gray-100'} rounded-sm mb-1 transition-all`} style={{ width: `${width}px`, height: `${height}px` }} />
                           <span className={`text-[8px] font-black ${aspectRatio === ratio ? 'text-rose-600' : 'text-gray-400'}`}>{ratio}</span>
                         </button>
                       ))}
                    </div>
                  </div>
               </div>

               <button onClick={startGeneration} disabled={isGenerating} className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center space-x-2 transition-all active:scale-95 shadow-xl ${isGenerating ? 'bg-gray-100 text-gray-400' : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:scale-[1.01]'}`}>
                 {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={24} />}
                 <span>{isGenerating ? '渲染中...' : '生成作品'}</span>
               </button>
               {error && <p className="text-[10px] text-rose-500 font-bold text-center mt-3">{error}</p>}
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-left duration-400">
              <h3 className="text-xl font-black text-gray-800">创作已完成</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-loose">您可以查看右侧预览，或点击下载保存成果。</p>
              <button onClick={() => { setStep(1); setUploadedImgs([]); setResultImg(null); setCustomPrompt(''); setIsSavedToCloud(false); }} className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black shadow-xl hover:scale-[1.01] active:scale-95 transition-all">
                再来一单
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Content Preview Area */}
        <div className="flex-1 p-8 bg-white flex flex-col items-center relative overflow-y-auto custom-scrollbar">
          {isGenerating ? (
            /* GENERATING LOADING */
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-24 h-24 border-[6px] border-rose-50 border-t-rose-500 rounded-full animate-spin mb-8" />
              <h2 className="text-2xl font-black text-gray-800">Gemini 视觉合成中</h2>
              <p className="text-sm text-gray-400 mt-2 font-bold uppercase">正在为您渲染极致画质素材</p>
            </div>
          ) : resultImg && step === 3 ? (
            /* STEP 3: FINAL RESULT */
            <div className="w-full h-full flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
               <div className="relative group cursor-zoom-in" onClick={() => setPreviewImg(resultImg)}>
                 <img src={resultImg} className="max-w-md w-full rounded-[2.5rem] shadow-2xl border-[12px] border-white transition-transform group-hover:scale-[1.01]" alt="Final Result" />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center transition-all rounded-[1.8rem]">
                    <Maximize2 className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={48} />
                 </div>
               </div>
               <div className="mt-10 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button onClick={() => { const a = document.createElement('a'); a.href=resultImg; a.download=`KidStyle_${Date.now()}.png`; a.click(); }} className="px-10 py-4 bg-gray-900 text-white rounded-2xl font-black flex items-center justify-center space-x-3 shadow-xl hover:bg-black active:scale-95 transition-all">
                    <Download size={20}/>
                    <span>下载到本地</span>
                  </button>
                  <button onClick={() => setStep(2)} className="px-10 py-4 bg-gray-100 text-gray-600 rounded-2xl font-black hover:bg-gray-200 transition-all">
                    微调参数
                  </button>
               </div>
            </div>
          ) : step === 1 && uploadedImgs.length > 0 ? (
            /* STEP 1: ALWAYS SHOW THE LAST UPLOADED IMAGE LARGE */
            <div className="w-full h-full flex items-center justify-center p-4">
               <div 
                 className="w-full h-full max-h-[600px] aspect-[3/4] rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl relative group cursor-zoom-in"
                 onClick={() => setPreviewImg(uploadedImgs[uploadedImgs.length - 1])}
               >
                  <img src={uploadedImgs[uploadedImgs.length - 1]} className="w-full h-full object-contain" alt="Last Uploaded Large View" />
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                     <Maximize2 className="text-gray-300" size={40} />
                  </div>
               </div>
            </div>
          ) : step === 2 && uploadedImgs.length > 0 ? (
            /* STEP 2: SHOW FULL GALLERY PREVIEW + PROMPT TEXTAREA */
            <div className="w-full h-full flex flex-col items-center">
               <div className="w-full flex-1 flex items-center justify-center p-4 overflow-y-auto custom-scrollbar">
                  {uploadedImgs.length === 1 ? (
                    <div className="w-full h-full max-h-[550px] aspect-[3/4] bg-gray-50 rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl relative group cursor-zoom-in" onClick={() => setPreviewImg(uploadedImgs[0])}>
                      <img src={uploadedImgs[0]} className="w-full h-full object-contain" alt="Single Preview" />
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Maximize2 className="text-gray-300" size={40} /></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-8 w-full max-w-2xl py-8">
                       {uploadedImgs.map((img, idx) => (
                         <div key={idx} className="aspect-[3/4] bg-gray-50 rounded-[2.5rem] overflow-hidden border-[8px] border-white shadow-2xl relative group cursor-zoom-in transition-all hover:scale-[1.02]" onClick={() => setPreviewImg(img)}>
                            <img src={img} className="w-full h-full object-contain" alt={`Material ${idx + 1}`} />
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all"><Maximize2 className="text-gray-400" size={24} /></div>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
               <div className="w-full max-w-lg mt-8 pt-8 border-t border-gray-100 space-y-4 animate-in fade-in duration-500">
                  <div className="flex items-center space-x-2 text-rose-500">
                    <Wand2 size={18} />
                    <label className="text-[11px] font-black uppercase tracking-widest text-gray-400">文字补充说明 (可选描述)</label>
                  </div>
                  <textarea placeholder="例如：补充衣服褶皱、指定环境光影、增加特定配饰等..." className="w-full p-6 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-rose-300 focus:bg-white outline-none resize-none text-sm h-32 transition-all shadow-inner" value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} />
               </div>
            </div>
          ) : (
            /* EMPTY INITIAL STATE */
            <div className="text-center max-w-sm flex flex-col items-center justify-center h-full">
               <div className="w-24 h-24 macaron-pink rounded-[2.5rem] mb-10 flex items-center justify-center shadow-inner"><ImageIcon className="text-rose-300" size={48} /></div>
               <h2 className="text-3xl font-black text-gray-800 tracking-tight">AI 童装视觉工坊</h2>
               <p className="text-sm text-gray-400 mt-4 leading-relaxed font-medium">请先在左侧上传服装图片。随后 Gemini 将为您创造极致的商业拍摄效果。</p>
            </div>
          )}
        </div>
      </div>

      {/* Model Library Modal */}
      {isModelLibraryOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsModelLibraryOpen(false)}></div>
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-5xl p-8 shadow-2xl animate-in zoom-in-95">
             <div className="flex items-center justify-between mb-8">
               <div>
                 <h3 className="text-2xl font-black text-gray-800">模特库</h3>
                 <p className="text-sm text-gray-400 mt-1">选择合适的模特进行生成</p>
               </div>
               <button onClick={() => setIsModelLibraryOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={24} /></button>
             </div>
             
             {/* 筛选器 */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
               <select 
                 value={modelLibraryFilter.gender} 
                 onChange={e => setModelLibraryFilter({...modelLibraryFilter, gender: e.target.value})}
                 className="px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
               >
                 <option value="">所有性别</option>
                 {config.genders.map(g => <option key={g} value={g}>{g}</option>)}
               </select>
               <select 
                 value={modelLibraryFilter.ageGroup} 
                 onChange={e => setModelLibraryFilter({...modelLibraryFilter, ageGroup: e.target.value})}
                 className="px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
               >
                 <option value="">所有年龄</option>
                 {config.ageGroups.map(a => <option key={a} value={a}>{a}</option>)}
               </select>
               <select 
                 value={modelLibraryFilter.ethnicity} 
                 onChange={e => setModelLibraryFilter({...modelLibraryFilter, ethnicity: e.target.value})}
                 className="px-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm"
               >
                 <option value="">所有国籍</option>
                 {config.ethnicities.map(e => <option key={e} value={e}>{e}</option>)}
               </select>
               <div className="relative">
                 <Search size={16} className="absolute left-3 top-3 text-gray-400" />
                 <input 
                   type="text" 
                   placeholder="搜索模特..." 
                   value={modelLibraryFilter.search}
                   onChange={e => setModelLibraryFilter({...modelLibraryFilter, search: e.target.value})}
                   className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-xl outline-none text-sm" 
                 />
               </div>
             </div>

             <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
               {filteredModels.map(m => (
                 <div key={m.id} onClick={() => { setSelectedModelId(m.id); setCustomModelImg(null); setIsModelLibraryOpen(false); }} className={`aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer border-4 transition-all hover:scale-105 group ${selectedModelId === m.id ? 'border-rose-500 shadow-xl' : 'border-transparent'}`}>
                   <img src={m.url} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                     <div className="absolute bottom-0 left-0 right-0 p-2">
                       <p className="text-white text-[10px] font-bold truncate">{m.name || `模特${m.id.slice(-4)}`}</p>
                       <p className="text-white/80 text-[8px]">{m.gender} · {m.ageGroup}</p>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
             
             <div className="mt-8 flex justify-center">
               <button onClick={() => setIsModelLibraryOpen(false)} className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">确认选择</button>
             </div>
          </div>
        </div>
      )}

      {/* Global Image Preview Overlay */}
      {previewImg && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 cursor-zoom-out" onClick={() => setPreviewImg(null)}>
           <button className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-all"><X size={28}/></button>
           <img src={previewImg} className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95" alt="Large Preview" />
        </div>
      )}
    </div>
  );
};

export default GenerationPage;
