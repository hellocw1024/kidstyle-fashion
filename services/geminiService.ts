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
  gender?: string;
  ageGroup?: string;
  ethnicity?: string;
  pose?: string;
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
  };
}, promptTemplates: typeof INITIAL_CONFIG.promptTemplates, referencePromptTemplates?: typeof INITIAL_CONFIG.referencePromptTemplates) {
  const { mainPrompt, modelModePrompt, productModePrompt, sceneGuidance, qualityGuidance, additionalGuidance, autoModeInstructions } = promptTemplates;

  // === 🔥 构建参考图指导（使用可配置模板）===
  let referenceGuidance = '';
  if (params.referenceConfig?.enabled && referencePromptTemplates && referencePromptTemplates.enabled) {
    const { referenceMode, extractElements, customInstruction } = params.referenceConfig;
    const refTemplates = referencePromptTemplates;

    // 🔥 使用配置的关键词构建元素列表
    const keywords = refTemplates.extractionKeywords || INITIAL_CONFIG.referencePromptTemplates.extractionKeywords;

    const elementsToExtract = [];
    if (extractElements.background) elementsToExtract.push(keywords.background);
    if (extractElements.pose) elementsToExtract.push(keywords.pose);
    if (extractElements.expression) elementsToExtract.push(keywords.expression);
    if (extractElements.lighting) elementsToExtract.push(keywords.lighting);
    if (extractElements.composition) elementsToExtract.push(keywords.composition);

    const elementsStr = elementsToExtract.length > 0 ? elementsToExtract.join(', ') : keywords.all;

    // 获取模式描述
    const modeDescription = referenceMode === 'STRICT' ? refTemplates.strictMode : refTemplates.flexibleMode;

    // 使用可配置模板，替换占位符
    referenceGuidance = refTemplates.mainGuidance
      .replace(/{{mode}}/g, modeDescription)
      .replace(/{{elements}}/g, elementsStr)
      .replace(/{{custom_instruction}}/g, customInstruction ? `- Additional instruction: ${customInstruction}` : '')
      .replace(/{{critical_notice}}/g, refTemplates.criticalNotice);
  }

  // 替换模板中的占位符
  let modePrompt = params.type === 'MODEL' ? modelModePrompt : productModePrompt;

  // 🔥 智能处理：如果是空值（Auto模式），则让AI根据服装自动判断
  // 使用配置中的指令
  const instructions = autoModeInstructions || INITIAL_CONFIG.promptTemplates.autoModeInstructions;

  // 🛡️ 兼容性处理：如果检测到旧的硬编码默认值组合，则视为 Auto 模式
  // (用户反馈即使未选择也会出现这些值，可能是旧状态残留)
  // (用户反馈即使未选择也会出现这些值，可能是旧状态残留)
  // const isLegacyDefault = params.gender === 'boy' && params.ageGroup === '3-5' && params.ethnicity === 'asian';

  const genderInstruction = params.gender ? (params.gender === 'boy' ? 'boy' : 'girl') : instructions.gender;
  const ageInstruction = params.ageGroup || instructions.ageGroup;
  const ethnicityInstruction = params.ethnicity || instructions.ethnicity;

  modePrompt = modePrompt.replace(/{{gender}}/g, genderInstruction)
    .replace(/{{ageGroup}}/g, ageInstruction)
    .replace(/{{ethnicity}}/g, ethnicityInstruction)
    .replace(/{{pose}}/g, params.pose || '')
    .replace(/{{composition}}/g, params.composition || '')
    .replace(/{{productForm}}/g, params.productForm || '')
    .replace(/{{productFocus}}/g, params.productFocus || '')
    .replace(/{{productBackground}}/g, params.productBackground || '');

  let sceneInfo = params.scene ? sceneGuidance.replace(/{{scene}}/g, params.scene) : '';

  let qualityInfo = qualityGuidance.replace(/{{quality}}/g, params.quality);

  let customInfo = params.customPrompt ? additionalGuidance.replace(/{{customPrompt}}/g, params.customPrompt) : '';

  // === 组装最终提示词 ===
  let prompt = mainPrompt.replace(/{{style}}/g, params.style)
    .replace(/{{quality}}/g, params.quality)
    .replace(/{{scene}}/g, params.scene ? params.scene : instructions.scene)
    .replace(/{{mode_prompt}}/g, modePrompt)
    .replace(/{{scene_guidance}}/g, sceneInfo)
    .replace(/{{custom_prompt}}/g, customInfo);

  // 🔥 添加参考图指导（放在最前面，确保AI优先理解）
  if (referenceGuidance) {
    prompt = referenceGuidance + '\n\n' + prompt;
  }

  return prompt;
}

export const generateClothingImage = async (params: {
  style: string;
  type: string;
  ageGroup?: string;
  gender?: string;
  ethnicity?: string;
  composition?: string;
  pose?: string;
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
  };
  // 🔥 新增：覆盖提示词（所见即所得）
  overridePrompt?: string;
}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isHighQuality = params.quality === '4K' || params.quality === '2K';
  const modelName = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  // 使用配置的提示词模板，如果没有提供则使用默认模板
  const templates = params.promptTemplates || INITIAL_CONFIG.promptTemplates;
  const refTemplates = params.referencePromptTemplates || INITIAL_CONFIG.referencePromptTemplates;

  // 🔥 核心逻辑：如果有 overridePrompt，直接使用，实现"所见即所得"
  const prompt = params.overridePrompt
    ? params.overridePrompt
    : buildPrompt({
      ...params,
      referenceConfig: params.referenceConfig
    }, templates, refTemplates);

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
