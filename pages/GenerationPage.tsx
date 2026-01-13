
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { GenerationType, User, ImageResource, SystemConfig, AppView, ReferenceImage, ReferenceConfig, GenerationTemplate } from '../types.ts';
import { Upload, Wand2, Check, Loader2, Image as ImageIcon, X, Plus, ArrowLeft, Maximize2, Download, Monitor, Scaling, Search, Save, FolderOpen, Trash2, User as UserIcon, Sparkles, BookTemplate } from 'lucide-react';
import { generateClothingImage, buildPrompt } from '../services/geminiService.ts';
import { ModelEntry } from '../constants.tsx';
import { generateThumbnail } from '../lib/thumbnail.ts';
import * as refStorage from '../lib/referenceStorage';
import * as tplStorage from '../lib/templateStorage';
import TemplateSidebar from '../components/TemplateSidebar';
import SmartRecommendation from '../components/SmartRecommendation';
import { OneClickGeneration } from '../components/OneClickGeneration';
import { TypeToggle } from '../components/TypeToggle';
import { GenerationConfig } from '../lib/buildGenerationParams';

interface Props {
  user: User;
  models: ModelEntry[];
  config: SystemConfig;
  setView: (view: AppView) => void;
  onOpenRecharge: () => void;
  onQuotaUpdate: (q: number) => void;
  onAddResource: (res: ImageResource) => void;
  remakeTarget?: ImageResource | null;
  onClearRemakeTarget?: () => void;
}

const GenerationPage: React.FC<Props> = ({ user, models, config, setView, onOpenRecharge, onQuotaUpdate, onAddResource, remakeTarget, onClearRemakeTarget }) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImgs, setResultImgs] = useState<string[]>([]);
  const [resultImg, setResultImg] = useState<string | null>(null);
  const [uploadedImgs, setUploadedImgs] = useState<string[]>([]);
  const [customPrompt, setCustomPrompt] = useState('');
  const [isTemplateSidebarOpen, setIsTemplateSidebarOpen] = useState(false);
  const [isSaveTemplateOpen, setIsSaveTemplateOpen] = useState(false);
  const [templates, setTemplates] = useState<GenerationTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [previewImg, setPreviewImg] = useState<string | null>(null);

  // State specific to OneClickGeneration integration
  // (Most logic is handled within OneClickGeneration component now, which passes configs back)

  // 辅助函数：File 转 Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleBatchGenerate = async (configs: GenerationConfig[]) => {
    setIsGenerating(true);
    setResultImgs([]);
    setStep(3);

    // Simplified execution for now to fix syntax
    try {
      const results: string[] = [];

      // 串行执行生成，避免并发过高
      for (const conf of configs) {
        const cost = 1; // 假设一键生成每张消耗 1 配额
        if (user.quota < cost) {
          console.warn('配额不足，停止生成');
          break;
        }

        const base64Clothing = await fileToBase64(conf.clothingImage);

        const params = {
          style: conf.params.style || config.styles[0],
          type: GenerationType.MODEL, // Default to MODEL, override below

          ...(conf.type === 'pure' ? {
            type: GenerationType.PRODUCT,
            productBackground: conf.params.background,
            productForm: conf.params.angle
          } : {
            type: GenerationType.MODEL,
            scene: conf.params.scene,
            pose: '静态站立',
            gender: conf.params.clothingGender === 'boys' ? '男' : conf.params.clothingGender === 'girls' ? '女' : '中性',
          }),

          quality: '1K',
          aspectRatio: conf.params.ratio || '3:4',
          baseImages: [base64Clothing],
          modelImage: conf.params.model ? models.find(m => m.id === conf.params.model)?.url : undefined,
        };

        const { url: result, modelUsed } = await generateClothingImage({
          ...params,
          type: params.type === GenerationType.MODEL ? 'MODEL' : 'PRODUCT',
          quality: '1K'
        });

        results.push(result);
        setResultImgs(prev => [...prev, result]); // 实时更新显示

        // 扣除配额 & 保存资源
        onQuotaUpdate(user.quota - cost);
        onAddResource({
          id: 'gen-' + Date.now() + Math.random(),
          url: result,
          type: 'GENERATE',
          date: new Date().toISOString().split('T')[0],
          tags: ['一键生成', params.style],
          modelName: modelUsed
        });
      }

      if (results.length > 0) {
        setResultImg(results[0]);
      }

    } catch (err: any) {
      console.error("Batch Generation Error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplyTemplate = (id: string) => { console.log("Apply template", id); };
  const handleDeleteTemplate = (id: string) => { console.log("Delete template", id); };


  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8 max-w-2xl mx-auto">
        <div className="flex items-center flex-1">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${step >= s ? 'bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-white border-gray-200 text-gray-400'}`}>
                  {step > s ? <Check size={18} /> : s}
                </div>
                <span className={`text-[10px] mt-2 font-black uppercase tracking-widest ${step >= s ? 'text-rose-500' : 'text-gray-400'}`}>
                  {['上传服装', '深度配置', '生成结果'][s - 1]}
                </span>
              </div>
              {s < 3 && <div className={`flex-1 h-0.5 mx-2 mb-6 ${step > s ? 'bg-rose-500' : 'bg-gray-100'}`} />}
            </React.Fragment>
          ))}
        </div>

        <button
          onClick={() => setIsTemplateSidebarOpen(true)}
          className="ml-4 px-4 py-2 bg-rose-500 text-white rounded-xl font-bold text-sm hover:bg-rose-600 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 group"
          title="打开模板库"
        >
          <BookTemplate size={18} className="group-hover:scale-110 transition-transform" />
          <span>模板</span>
        </button>
      </div>

      <div className="glass-morphism rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px] border border-gray-100 flex flex-col md:flex-row animate-fade-in-up">
        {/* Left Side */}
        <div className="w-full md:w-2/5 p-6 bg-gray-50/50 border-r overflow-y-auto custom-scrollbar max-h-[850px]">
          {step === 1 ? (
            <OneClickGeneration
              onGenerate={handleBatchGenerate}
              isGenerating={isGenerating}
              models={models}
            />
          ) : step === 2 ? (
            <div className="space-y-6">
              <TypeToggle
                value="model"
                onChange={(v) => console.log(v)}
              />
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded-xl">
                Step 2: Advanced Configuration (Coming Soon)
              </div>
              <button onClick={() => setStep(3)} className="w-full py-3 bg-gray-900 text-white rounded-xl">
                Next
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-left duration-400">
              <h3 className="text-xl font-black text-gray-800">创作已完成</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest leading-loose">您可以查看右侧预览。</p>
              <button onClick={() => { setStep(1); setUploadedImgs([]); setResultImg(null); setResultImgs([]); setCustomPrompt(''); }} className="w-full py-5 bg-rose-500 text-white rounded-2xl font-black shadow-xl hover:scale-[1.01] btn-press transition-all hover-glow">
                再来一单
              </button>
            </div>
          )}
        </div>

        {/* Right Side */}
        <div className="flex-1 p-8 bg-white flex flex-col items-center relative overflow-y-auto custom-scrollbar">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <Loader2 className="animate-spin text-rose-500 mb-4" size={48} />
              <h2 className="text-xl font-bold">生成中...</h2>
            </div>
          ) : resultImgs.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {resultImgs.map((img, idx) => (
                <img key={idx} src={img} className="rounded-xl shadow-lg border-2 border-gray-100" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ImageIcon size={64} className="mb-4 opacity-20" />
              <p>预览区域</p>
            </div>
          )}
        </div>
      </div>

      <TemplateSidebar
        isOpen={isTemplateSidebarOpen}
        onClose={() => setIsTemplateSidebarOpen(false)}
        templates={templates}
        selectedTemplateId={selectedTemplate}
        onApplyTemplate={handleApplyTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onSaveTemplate={() => {
          setIsTemplateSidebarOpen(false);
          setIsSaveTemplateOpen(true);
        }}
      />

      {/* Placeholder for other modals */}
      {previewImg && <div onClick={() => setPreviewImg(null)} className="fixed inset-0 bg-black/80 z-50"></div>}

    </div>
  );
};

export default GenerationPage;
