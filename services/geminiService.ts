import { GoogleGenAI } from "@google/genai";
import { INITIAL_CONFIG } from "../constants.tsx";

// 辅助函数：将 URL 转换为 Base64
async function fetchImageAsBase64(url: string): Promise<string> {
  if (url.startsWith('data:')) {
    console.log('✅ 图片已是 Base64 格式');
    return url;
  }

  console.log('🔄 开始转换图片 URL 为 Base64:', url);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const blob = await response.blob();
    console.log('✅ 成功获取图片 blob (大小:', blob.size, 'bytes)');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        console.log('✅ Base64 转换完成');
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        console.error('❌ FileReader 转换失败');
        reject(new Error('FileReader conversion failed'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ 图片转换失败:', url, error);
    throw new Error(`Failed to convert image to Base64: ${url}. Error: ${error}`);
  }
}

// 获取提示词模板的辅助函数
export function buildPrompt(params: {
  style: string;
  quality: string;
  scene?: string;
  type: string;
  appMode?: string; // 🔥 新增：应用模式 (custom, remake, template)
  gender?: string;
  ageGroup?: string;
  ethnicity?: string;
  pose?: string;
  emotion?: string; // 🔥 新增：情绪
  composition?: string;
  productForm?: string;
  productFocus?: string;
  productBackground?: string;
  customPrompt?: string;
  // 🔥 新增：参考图配置
  referenceConfig?: {
    enabled: boolean;
    referenceMode: 'STRICT' | 'FLEXIBLE';
    extractElements: {
      background: boolean;
      pose: boolean;
      expression: boolean;
      lighting: boolean;
      composition: boolean;
    };
    customInstruction?: string;
    // 🔥 新增：复刻模式（优先级高于通用参考配置）
    remakeMode?: 'scene' | 'pose' | 'complete';
  };
}, promptTemplates: typeof INITIAL_CONFIG.promptTemplates, referencePromptTemplates?: typeof INITIAL_CONFIG.referencePromptTemplates, remakePrompts?: typeof INITIAL_CONFIG.remakePrompts) {
  // Determine App Mode (default to custom if not provided)
  const appMode = params.appMode || 'custom';

  const { customMainPrompt, remakeMainPrompt, templateMainPrompt, modelModePrompt, productModePrompt, sceneGuidance, qualityGuidance, additionalGuidance, autoModeInstructions } = promptTemplates;

  // Select the correct main prompt based on App Mode
  let mainPrompt = customMainPrompt; // Default
  if (appMode === 'remake') {
    mainPrompt = remakeMainPrompt;
  } else if (appMode === 'template') {
    mainPrompt = templateMainPrompt;
  }

  // === 🔥 构建参考图指导（使用可配置模板）===
  let referenceGuidance = '';

  // 优先级1: 特定的复刻模式 (Remake Mode)
  if (params.referenceConfig?.enabled && params.referenceConfig.remakeMode) {
    const mode = params.referenceConfig.remakeMode;
    // 优先使用传入的配置，否则回退到默认配置
    const prompts = remakePrompts || INITIAL_CONFIG.remakePrompts;
    if (prompts && prompts[mode]) {
      referenceGuidance = `REFERENCE MODE: ${mode.toUpperCase()} REMAKE\n${prompts[mode]}`;
      // 如果有自定义指令，追加在后面
      if (params.referenceConfig.customInstruction) {
        referenceGuidance += `\nAdditional instruction: ${params.referenceConfig.customInstruction}`;
      }
    }
  }
  // 优先级2: 通用参考配置 (Generic Reference Config)
  else if (params.referenceConfig?.enabled) {
    const { referenceMode, extractElements, customInstruction } = params.referenceConfig;

    const elementsToExtract = [];
    if (extractElements.background) elementsToExtract.push('background environment');
    if (extractElements.pose) elementsToExtract.push('pose and body position');
    if (extractElements.expression) elementsToExtract.push('facial expression and mood');
    if (extractElements.lighting) elementsToExtract.push('lighting and atmosphere');
    if (extractElements.composition) elementsToExtract.push('composition and framing');

    const elementsStr = elementsToExtract.length > 0 ? elementsToExtract.join(', ') : 'all visual elements';
    const modeDescription = referenceMode === 'STRICT' ? 'STRICTLY FOLLOW the reference style closely' : 'Use as FLEXIBLE INSPIRATION';

    referenceGuidance = `REFERENCE IMAGE GUIDANCE:
You have been provided with a reference image. Use it as follows:
- Reference Mode: ${modeDescription}
- Extract and apply these elements: ${elementsStr}
${customInstruction ? `- Additional instruction: ${customInstruction}` : ''}

CRITICAL: The CLOTHING must come from the uploaded clothing images, but the STYLE/ATMOSPHERE should match the reference image.`;
  }

  // 替换模板中的占位符
  let modePrompt = params.type === 'MODEL' ? modelModePrompt : productModePrompt;

  // 🔥 智能处理：如果是空值（Auto模式），则让AI根据服装自动判断
  // 使用配置中的指令
  const instructions = autoModeInstructions || INITIAL_CONFIG.promptTemplates.autoModeInstructions;

  // 🛡️ 优先使用模特图中的特征 (如果提供了模特图且未指定参数)
  const defaultGender = params.modelImage ? 'Match gender of the model in the provided photo' : instructions.gender;
  const defaultAge = params.modelImage ? 'Match age of the model in the provided photo' : instructions.ageGroup;
  const defaultEthnicity = params.modelImage ? 'Match ethnicity of the model in the provided photo' : instructions.ethnicity;

  const genderInstruction = params.gender
    ? (['boy', 'male'].includes(params.gender.toLowerCase()) ? 'boy' : 'girl')
    : defaultGender;
  const ageInstruction = params.ageGroup || defaultAge;
  const ethnicityInstruction = params.ethnicity || defaultEthnicity;

  // 🔥 智能抑制逻辑 (Smart Suppression)
  // 如果是复刻模式 (scene/complete) 或 自定义模式下勾选了 "Background" 提取
  const isRemakeScene =
    params.referenceConfig?.remakeMode === 'scene' ||
    params.referenceConfig?.remakeMode === 'complete' ||
    params.referenceConfig?.extractElements?.background === true;

  // 如果是复刻模式 (pose/complete) 或 自定义模式下勾选了 "Pose" 提取
  const isRemakePose =
    params.referenceConfig?.remakeMode === 'pose' ||
    params.referenceConfig?.remakeMode === 'complete' ||
    params.referenceConfig?.extractElements?.pose === true;

  // 🌟 智能自动选择指令 (AI Auto-Selection)
  // 当用户未选择 (undefined/null/empty) 时，注入指令让 AI 根据服装自动决定
  const autoScene = "Automatically select the most suitable scene that fits the clothing style (e.g., street, park, studio).";
  const autoStyle = "Automatically detect the clothing style (e.g., casual, elegant, sporty) and apply a matching photographic style.";
  const autoPose = "Choose a natural, dynamic pose that best showcases the clothing details.";
  const autoEmotion = "Select a natural emotion that fits the overall vibe of the clothing and scene.";
  const autoComposition = "Use the best composition to highlight the clothing features.";

  // 如果是复刻背景，强制忽略默认的场景描述（避免 "Studio" vs "Park" 冲突）
  const targetScene = isRemakeScene ? 'Use background from reference image' : (params.scene || autoScene);
  const targetStyle = params.style || autoStyle;

  // 如果是复刻姿态，强制忽略默认姿态
  const targetPose = isRemakePose ? 'Use pose from reference image' : (params.pose || autoPose);
  const targetComposition = isRemakePose ? 'Use composition from reference image' : (params.composition || autoComposition);
  const targetEmotion = params.emotion || autoEmotion;

  modePrompt = modePrompt.replace(/{{gender}}/g, genderInstruction)
    .replace(/{{ageGroup}}/g, ageInstruction)
    .replace(/{{ethnicity}}/g, ethnicityInstruction)
    .replace(/{{ethnicity}}/g, ethnicityInstruction)
    .replace(/{{pose}}/g, targetPose)
    .replace(/{{emotion}}/g, targetEmotion)  // 🔥 替换 emotion
    .replace(/{{composition}}/g, targetComposition)
    .replace(/{{productForm}}/g, params.productForm || '')
    .replace(/{{productFocus}}/g, params.productFocus || '')
    .replace(/{{productBackground}}/g, params.productBackground || '');

  let sceneInfo = targetScene ? sceneGuidance.replace(/{{scene}}/g, targetScene) : '';

  let qualityInfo = qualityGuidance.replace(/{{quality}}/g, params.quality);

  let customInfo = params.customPrompt ? additionalGuidance.replace(/{{customPrompt}}/g, params.customPrompt) : '';

  // === 组装最终提示词 ===
  let prompt = mainPrompt.replace(/{{style}}/g, targetStyle)
    .replace(/{{quality}}/g, params.quality)
    .replace(/{{scene}}/g, targetScene)
    .replace(/{{mode_prompt}}/g, modePrompt)
    .replace(/{{scene_guidance}}/g, sceneInfo)
    .replace(/{{custom_prompt}}/g, customInfo)
    .replace(/{{emotion}}/g, targetEmotion); // 🔥 修复：在主模板中替换 emotion

  // 🔥 添加参考图指导（放在最前面，确保AI优先理解）
  if (referenceGuidance) {
    prompt = referenceGuidance + '\n\n' + prompt;
  }

  return prompt;
}

export const generateClothingImage = async (params: {
  style: string;
  type: string;
  appMode?: string; // 🔥 新增：应用模式
  ageGroup?: string;
  gender?: string;
  ethnicity?: string;
  composition?: string;
  composition?: string;
  pose?: string;
  emotion?: string; // 🔥 新增：情绪
  productForm?: string;
  productFocus?: string;
  productBackground?: string;
  scene?: string;
  customPrompt?: string;
  quality: string;
  aspectRatio: string;
  baseImages?: string[];
  modelImage?: string;
  promptTemplates?: typeof INITIAL_CONFIG.promptTemplates;
  referencePromptTemplates?: typeof INITIAL_CONFIG.referencePromptTemplates;
  remakePrompts?: typeof INITIAL_CONFIG.remakePrompts; // 🔥 新增：复刻模式提示词配置
  // 🔥 新增：参考图参数
  referenceImage?: string;
  referenceConfig?: {
    enabled: boolean;
    referenceMode: 'STRICT' | 'FLEXIBLE';
    extractElements: {
      background: boolean;
      pose: boolean;
      expression: boolean;
      lighting: boolean;
      composition: boolean;
    };
    customInstruction?: string;
    remakeMode?: 'scene' | 'pose' | 'complete'; // 🔥 新增：复刻模式
  };
  // 🔥 新增：覆盖提示词（所见即所得）
  overridePrompt?: string;
  // 🔥 新增：负向提示词
  negativePrompt?: string;
}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isHighQuality = params.quality === '4K' || params.quality === '2K';
  const modelName = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  // 使用配置的提示词模板，如果没有提供则使用默认模板
  const templates = params.promptTemplates || INITIAL_CONFIG.promptTemplates;
  const refTemplates = params.referencePromptTemplates || INITIAL_CONFIG.referencePromptTemplates;
  const remakePrompts = params.remakePrompts || INITIAL_CONFIG.remakePrompts;

  // 🔥 核心逻辑：如果有 overridePrompt，直接使用，实现"所见即所得"
  let prompt = params.overridePrompt
    ? params.overridePrompt
    : buildPrompt({
      ...params,
      referenceConfig: params.referenceConfig
    }, templates, refTemplates, remakePrompts);

  // 🔥 追加负向提示词 (Negative Prompt)
  if (params.negativePrompt) {
    prompt += `\n\nNEGATIVE PROMPT (EXCLUSIONS): ${params.negativePrompt}`;
  }

  try {
    const contents: any = { parts: [{ text: prompt }] };

    // 处理基础图（上传的服装图）
    if (params.baseImages) {
      for (const img of params.baseImages) {
        const b64 = img.startsWith('data:') ? img : await fetchImageAsBase64(img);
        contents.parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: b64.includes('base64,') ? b64.split(',')[1] : b64
          }
        });
      }
    }

    // 处理模特参考图
    if (params.modelImage) {
      console.log('🖼️ 模特参考图 URL:', params.modelImage);
      console.log('🔍 检查格式:', params.modelImage.startsWith('data:') ? 'Base64 格式' : '需要转换的 URL');

      const b64 = params.modelImage.startsWith('data:') ? params.modelImage : await fetchImageAsBase64(params.modelImage);

      if (!b64.startsWith('data:')) {
        console.error('❌ 模特参考图转换失败，未得到 Base64 格式:', b64);
        throw new Error(`模特参考图转换失败: ${params.modelImage}`);
      }

      console.log('✅ 模特参考图已转换为 Base64 (长度:', b64.length, '字符)');

      contents.parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: b64.includes('base64,') ? b64.split(',')[1] : b64
        }
      });

      console.log('✅ 模特参考图已添加到 API 请求中');
    } else {
      console.log('ℹ️ 未提供模特参考图');
    }

    // 🔥 3️⃣ 参考图（如果提供）
    if (params.referenceImage && params.referenceConfig?.enabled) {
      console.log('🖼️ 添加参考图:', params.referenceImage);
      const b64 = params.referenceImage.startsWith('data:') ? params.referenceImage : await fetchImageAsBase64(params.referenceImage);

      if (!b64.startsWith('data:')) {
        console.error('❌ 参考图转换失败，未得到 Base64 格式:', b64);
        throw new Error(`参考图转换失败: ${params.referenceImage}`);
      }

      console.log('✅ 参考图已转换为 Base64 (长度:', b64.length, '字符)');

      contents.parts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: b64.includes('base64,') ? b64.split(',')[1] : b64
        }
      });

      console.log('✅ 参考图已添加到 API 请求中');
    } else {
      console.log('ℹ️ 未提供参考图或参考功能未启用');
    }

    console.log('📤 发送请求到 Gemini API, 模型:', modelName);
    console.log('📋 请求参数:', {
      aspectRatio: params.aspectRatio,
      quality: params.quality,
      partsCount: contents.parts.length
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        imageConfig: {
          aspectRatio: params.aspectRatio as any,
          ...(isHighQuality ? { imageSize: params.quality as any } : {})
        }
      }
    });

    console.log('📥 收到 Gemini API 响应');
    console.log('🔍 完整响应结构:', JSON.stringify(response, null, 2));

    if (response.candidates) {
      console.log('✅ 找到 candidates, 数量:', response.candidates.length);

      if (response.candidates[0]?.content?.parts) {
        console.log('✅ 找到 parts, 数量:', response.candidates[0].content.parts.length);

        for (const part of response.candidates[0].content.parts) {
          console.log('🔍 检查 part:', Object.keys(part));
          if (part.inlineData) {
            console.log('✅ 找到图片数据, 大小:', part.inlineData.data?.length || 0, '字符');
            return {
              url: `data:image/png;base64,${part.inlineData.data}`,
              modelUsed: modelName
            };
          }
        }
        console.warn('⚠️ parts 中没有找到 inlineData');
      } else {
        console.warn('⚠️ candidates[0].content.parts 不存在');
      }
    } else {
      console.warn('⚠️ response.candidates 不存在');
    }

    throw new Error("No image generated");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

/**
 * 🆕 使用 Gemini Vision API 分析图片
 * @param imageUrl 图片 URL或 Base64
 * @param analysisPrompt 分析指令 Prompt
 * @returns JSON 格式的分析结果
 */
export const analyzeImageWithVision = async (
  imageUrl: string,
  analysisPrompt: string
): Promise<any> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const modelName = 'gemini-2.5-flash-preview'; // 使用 Flash 模型进行分析

  try {
    console.log('🔍 开始 Vision 分析...');
    console.log('📋 分析 Prompt:', analysisPrompt.substring(0, 100) + '...');

    // 转换图片为 Base64
    const b64 = imageUrl.startsWith('data:') ? imageUrl : await fetchImageAsBase64(imageUrl);

    if (!b64.startsWith('data:')) {
      throw new Error(`图片转换失败: ${imageUrl}`);
    }

    const contents = {
      parts: [
        { text: analysisPrompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: b64.includes('base64,') ? b64.split(',')[1] : b64
          }
        }
      ]
    };

    console.log('📤 发送 Vision 分析请求到 Gemini API...');

    const response = await ai.models.generateContent({
      model: modelName,
      contents
    });

    console.log('📥 收到 Vision 分析响应');

    if (response.candidates && response.candidates[0]?.content?.parts) {
      const textPart = response.candidates[0].content.parts.find(p => p.text);

      if (textPart && textPart.text) {
        const responseText = textPart.text.trim();
        console.log('✅ Vision 分析结果:', responseText.substring(0, 200) + '...');

        // 尝试解析 JSON
        try {
          // 清理可能的 Markdown 代码块标记
          let cleanedText = responseText;
          if (responseText.includes('```json')) {
            cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          } else if (responseText.includes('```')) {
            cleanedText = responseText.replace(/```\n?/g, '').trim();
          }

          const jsonResult = JSON.parse(cleanedText);
          console.log('✅ JSON 解析成功');
          return jsonResult;

        } catch (parseError) {
          console.error('❌ JSON 解析失败:', parseError);
          console.error('原始响应:', responseText);
          throw new Error('AI 返回的格式无效，无法解析为 JSON');
        }
      }
    }

    throw new Error('Vision API 未返回有效数据');

  } catch (error) {
    console.error('❌ Vision 分析失败:', error);
    throw error;
  }
};
