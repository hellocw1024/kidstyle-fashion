import React, { useState } from 'react';
import { GenerationLayout } from '../components/GenerationLayout';
import { ModeSwitcher, GenerationMode } from '../components/ModeSwitcher';
import { CustomMode } from '../components/CustomMode';
import { SmartMode } from '../components/SmartMode';
import { RemakeMode } from '../components/RemakeMode';
import { TemplateMode } from '../components/TemplateMode';
import { PreviewArea } from '../components/PreviewArea';
import { PromptPreviewModal } from '../components/PromptPreviewModal';
import { DisplayType } from '../types';
import { ModelEntry, REFERENCE_IMAGE_LIBRARY } from '../constants';
import { generateClothingImage, buildPrompt } from '../services/geminiService';
import { fileToImageElement } from '../lib/thumbnail';

interface GenerationPageProps {
  models?: ModelEntry[];
  user?: any;
  config?: any;
  setView?: any;
  onOpenRecharge?: any;
  remakeData?: any;
  onClearRemakeData?: any;
  onQuotaUpdate?: any;
  onAddResource?: any;
  initialMode?: string;
}

const GenerationPage: React.FC<GenerationPageProps> = ({
  models = [],
  initialMode,
  onAddResource,
  config // ✅ Destructure config
}) => {
  const [mode, setMode] = useState<GenerationMode>((initialMode as GenerationMode) || 'custom');
  const [displayType, setDisplayType] = useState<DisplayType>('model');
  const [previewState, setPreviewState] = useState<'empty' | 'ready' | 'generating' | 'complete'>('empty');
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [currentNegativePrompt, setCurrentNegativePrompt] = useState('');
  const [currentParameters, setCurrentParameters] = useState<Record<string, any>>({});

  const handleGenerate = (params?: any) => {
    console.log('🎨 Generation parameters:', params);

    // Build the prompt using the service function with dynamic config
    const prompt = buildPrompt({
      ...params,
      // Map params to service format if necessary
      type: displayType === 'model' ? 'MODEL' : 'PRODUCT',
      style: params?.modelDisplayParams?.style,
      quality: '4K',
      scene: params?.modelDisplayParams?.scene,
      gender: params?.gender,
      ageGroup: params?.ageGroup,
      ethnicity: params?.ethnicity,
      pose: params?.modelDisplayParams?.pose,
      composition: params?.modelDisplayParams?.composition,
      productForm: params?.pureClothingParams?.angle,
      productFocus: params?.pureClothingParams?.focus,
      productBackground: params?.pureClothingParams?.background,
      referenceConfig: params?.referenceConfig
    }, config?.promptTemplates || undefined, config?.referencePromptTemplates || undefined);

    // Enhanced negative prompt to ensure quality
    const negativePrompt = [
      'blurry', 'low quality', 'low resolution', 'pixelated', 'grainy', 'noisy',
      'out of focus', 'soft focus', 'poor quality', 'jpeg artifacts',

      // Anatomical issues
      'bad anatomy', 'distorted', 'deformed', 'disfigured', 'extra limbs',
      'extra fingers', 'mutated', 'malformed', 'missing limbs', 'poorly drawn',

      // Color and lighting issues
      'oversaturated', 'washed out', 'overexposed', 'underexposed',
      'bad lighting', 'harsh shadows', 'unnatural colors',

      // Clothing inconsistencies
      'wrong clothing color', 'incorrect pattern', 'different design',
      'altered clothing', 'modified outfit', 'changed style',

      // Face and model issues
      'different face', 'changed facial features', 'wrong person',
      'altered appearance', 'inconsistent model', 'face swap',

      // Text and watermarks
      'watermark', 'text', 'signature', 'logo overlay', 'copyright mark',
      'username', 'timestamp', 'frame border',

      // Composition issues
      'cropped', 'cut off', 'partial view', 'out of frame',
      'bad composition', 'awkward angle', 'distorted perspective',

      // Unnatural elements
      'surreal', 'abstract', 'unrealistic', 'fake looking',
      'artificial', 'CGI', 'cartoon', 'illustration', 'drawing'
    ].join(', ');

    const parameters = {
      mode,
      ...(params || {}),
      resolution: '1024x1536',
      steps: 40,  // 增加步数以提高质量
      sampler: 'DPM++ 2M Karras',
      cfg_scale: 7.5,
      clip_skip: 2,
    };

    console.log('📝 Generated prompt:', prompt);
    console.log('🚫 Negative prompt:', negativePrompt);

    setCurrentPrompt(prompt);
    setCurrentNegativePrompt(negativePrompt);
    setCurrentParameters(parameters);
    setShowPromptPreview(true);
  };



  const confirmGeneration = async () => {
    console.log('🎨 Confirmed generation with prompt:', currentPrompt);
    setShowPromptPreview(false);

    // Immediately show generating state
    setPreviewState('generating');

    try {
      console.log('🚀 Starting real Gemini generation...');

      const clothingFile = currentParameters.clothingImage;
      const modelFile = currentParameters.modelImage;

      // Convert Files to URLs/Base64 if necessary
      const clothingUrl = clothingFile
        ? (clothingFile instanceof File ? URL.createObjectURL(clothingFile) : clothingFile)
        : undefined;

      const modelUrl = modelFile
        ? (modelFile instanceof File ? URL.createObjectURL(modelFile) : modelFile)
        : undefined;

      const result = await generateClothingImage({
        style: currentParameters.modelDisplayParams?.style,
        type: displayType === 'model' ? 'MODEL' : 'PRODUCT',
        ageGroup: currentParameters.ageGroup,
        gender: currentParameters.gender,
        ethnicity: currentParameters.ethnicity,
        scene: currentParameters.modelDisplayParams?.scene,
        quality: '4K',
        aspectRatio: currentParameters.modelDisplayParams?.ratio || '3:4',
        modelImage: modelUrl,
        baseImages: clothingUrl ? [clothingUrl] : undefined,
        customPrompt: currentPrompt,
        // Pass dynamic config from Admin Panel
        promptTemplates: config?.promptTemplates,
        referencePromptTemplates: config?.referencePromptTemplates,
        // 🔥 Use the exact prompt from preview (WYSIWYG)
        overridePrompt: currentPrompt,
        // Pass other params
      });

      console.log('✅ Real generation complete!', result);

      if (result && result.url) {
        setGeneratedImage(result.url);

        // 🔥 Save to User Resources
        if (onAddResource) {
          const newResource = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            url: result.url,
            thumbnail: result.url,
            type: 'GENERATE',
            date: new Date().toISOString().split('T')[0],
            tags: ['generated', mode, currentParameters.modelDisplayParams?.style || 'standard'],
            modelName: 'Gemini 3 Pro'
          };
          console.log('💾 Saving generated image to resources...', newResource);
          onAddResource(newResource);
        }
      }

      setPreviewState('complete');

    } catch (error) {
      console.error('❌ Generation failed:', error);
      setPreviewState('complete');
      alert('生成失败: ' + (error instanceof Error ? error.message : '未知错误'));
    }
  };

  const renderModeContent = () => {
    switch (mode) {
      case 'custom':
        return (
          <CustomMode
            displayType={displayType}
            onDisplayTypeChange={setDisplayType}
            onGenerate={handleGenerate}
            models={models}
            onClothingUpload={async (file) => {
              if (onAddResource) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const base64 = reader.result as string;
                  const newResource = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                    url: base64,
                    thumbnail: base64,
                    type: 'UPLOAD',
                    date: new Date().toISOString().split('T')[0],
                    tags: ['upload', 'clothing'],
                    modelName: 'User Upload'
                  };
                  console.log('💾 Saving uploaded clothing to resources...', newResource);
                  onAddResource(newResource);
                };
                reader.readAsDataURL(file);
              }
            }}
          />
        );

      case 'smart':
        return (
          <SmartMode
            displayType={displayType}
            onDisplayTypeChange={setDisplayType}
            onGenerate={handleGenerate}
          />
        );

      case 'remake':
        return <RemakeMode
          onGenerate={handleGenerate}
          referenceImages={REFERENCE_IMAGE_LIBRARY}
        />;

      case 'template':
        return <TemplateMode onGenerate={handleGenerate} />;

      default:
        return null;
    }
  };

  const leftPanel = (
    <>
      <ModeSwitcher activeMode={mode} onChange={setMode} />
      {renderModeContent()}
    </>
  );

  const rightPanel = (
    <PreviewArea
      state={previewState}
      clothingImage={
        previewState !== 'empty'
          ? (currentParameters.clothingImage ? URL.createObjectURL(currentParameters.clothingImage) : '/models/girl_model_1.png')
          : undefined
      }
      resultImages={previewState === 'complete' ? (generatedImage ? [generatedImage] : [
        '/models/girl_model_1.png',
        '/models/girl_model_2.png',
        '/models/girl_model_3.png'
      ]) : []}
    />
  );

  return (
    <>
      <GenerationLayout leftPanel={leftPanel} rightPanel={rightPanel} />

      {/* Prompt Preview Modal */}
      {showPromptPreview && (
        <PromptPreviewModal
          prompt={currentPrompt}
          negativePrompt={currentNegativePrompt}
          parameters={currentParameters}
          onConfirm={confirmGeneration}
          onCancel={() => setShowPromptPreview(false)}
        />
      )}
    </>
  );
};

export default GenerationPage;
