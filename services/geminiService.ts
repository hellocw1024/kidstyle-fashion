
import { GoogleGenAI } from "@google/genai";

export const generateClothingImage = async (params: {
  category: string;
  season: string;
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
}) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isHighQuality = params.quality === '4K' || params.quality === '2K';
  const modelName = isHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
  
  let prompt = `
    TASK: Professional children's clothing commercial photography.
    CATEGORY: Automatically identify and match the clothing type from reference images (T-shirt, dress, jacket, pants, etc.)
    SEASON: Automatically determine appropriate season based on clothing style and design
    STYLE: ${params.style}

    ${params.type === 'MODEL' ? `
    MODE: ON-MODEL PROFESSIONAL PHOTOSHOOT
    MODEL DETAILS: ${params.gender} child, age ${params.ageGroup}, ${params.ethnicity} heritage.
    POSE & EMOTION: ${params.pose}
    COMPOSITION: ${params.composition}
    ` : `
    MODE: PRODUCT DISPLAY (STILL LIFE)
    FORM: ${params.productForm}
    FOCUS: ${params.productFocus}
    BACKGROUND: ${params.productBackground}
    `}

    SCENE: ${params.scene || 'Minimalist professional studio background'}
    QUALITY: ${params.quality} - extremely high detail, commercial catalog quality.
    ${params.customPrompt ? `ADDITIONAL DETAILS: ${params.customPrompt}` : ''}

    REFERENCE CLOTHING: Please accurately analyze the clothing design, style, and season from the provided reference images. Render the clothing with appropriate colors, patterns, and fabric texture suitable for the identified season and category.
  `;

  try {
    const contents: any = { parts: [{ text: prompt }] };

    if (params.baseImages) {
      params.baseImages.forEach(img => {
        contents.parts.push({ inlineData: { mimeType: 'image/jpeg', data: img.includes('base64,') ? img.split(',')[1] : img } });
      });
    }

    if (params.modelImage && params.modelImage.startsWith('data:')) {
      contents.parts.push({ inlineData: { mimeType: 'image/jpeg', data: params.modelImage.split(',')[1] } });
    }

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

    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image generated");
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
