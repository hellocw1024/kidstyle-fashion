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
function buildPrompt(params: {
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
}, promptTemplates: typeof INITIAL_CONFIG.promptTemplates) {
  const { mainPrompt, modelModePrompt, productModePrompt, sceneGuidance, qualityGuidance, additionalGuidance } = promptTemplates;

  // 替换模板中的占位符
  let modePrompt = params.type === 'MODEL' ? modelModePrompt : productModePrompt;
  modePrompt = modePrompt.replace(/{{gender}}/g, params.gender || '')
    .replace(/{{ageGroup}}/g, params.ageGroup || '')
    .replace(/{{ethnicity}}/g, params.ethnicity || '')
    .replace(/{{pose}}/g, params.pose || '')
    .replace(/{{composition}}/g, params.composition || '')
    .replace(/{{productForm}}/g, params.productForm || '')
    .replace(/{{productFocus}}/g, params.productFocus || '')
    .replace(/{{productBackground}}/g, params.productBackground || '');

  let sceneInfo = params.scene ? sceneGuidance.replace(/{{scene}}/g, params.scene) : '';

  let qualityInfo = qualityGuidance.replace(/{{quality}}/g, params.quality);

  let customInfo = params.customPrompt ? additionalGuidance.replace(/{{customPrompt}}/g, params.customPrompt) : '';

  // 组装最终提示词
  let prompt = mainPrompt.replace(/{{style}}/g, params.style)
    .replace(/{{quality}}/g, params.quality)
    .replace(/{{scene}}/g, params.scene ? params.scene : 'automatically determined')
    .replace(/{{mode_prompt}}/g, modePrompt)
    .replace(/{{scene_guidance}}/g, sceneInfo)
    .replace(/{{custom_prompt}}/g, customInfo);

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
}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isHighQuality = params.quality === '4K' || params.quality === '2K';
  const modelName = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

  // 使用配置的提示词模板，如果没有提供则使用默认模板
  const templates = params.promptTemplates || INITIAL_CONFIG.promptTemplates;

  const prompt = buildPrompt(params, templates);

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
