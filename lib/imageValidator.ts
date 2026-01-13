/**
 * 图片校验工具库
 * 提供基础校验和 AI 增强校验
 */

export interface ValidationResult {
  valid: boolean;
  level: 'error' | 'warning' | 'success';
  reason: string;
  suggestions?: string[];
}

/**
 * 基础校验：文件类型、大小、尺寸
 */
export async function validateBasic(
  file: File,
  type: 'clothing' | 'model'
): Promise<ValidationResult> {
  // 1. 文件类型检查
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      level: 'error',
      reason: '不支持的图片格式',
      suggestions: ['请上传 JPG、PNG 或 WEBP 格式的图片']
    };
  }

  // 2. 文件大小检查
  const maxSize = type === 'clothing' ? 10 * 1024 * 1024 : 5 * 1024 * 1024; // 10MB / 5MB
  const minSize = 50 * 1024; // 50KB

  if (file.size > maxSize) {
    return {
      valid: false,
      level: 'error',
      reason: `文件过大（${(file.size / 1024 / 1024).toFixed(1)}MB）`,
      suggestions: [`请上传小于 ${maxSize / 1024 / 1024}MB 的图片`]
    };
  }

  if (file.size < minSize) {
    return {
      valid: false,
      level: 'error',
      reason: '图片过小，可能不够清晰',
      suggestions: ['请上传更高分辨率的图片']
    };
  }

  // 3. 图片尺寸检查（异步）
  try {
    const dimensions = await getImageDimensions(file);

    if (dimensions.width < 500 || dimensions.height < 500) {
      return {
        valid: false,
        level: 'error',
        reason: `图片分辨率过低（${dimensions.width}x${dimensions.height}）`,
        suggestions: ['请上传至少 500x500 像素的图片']
      };
    }

    // 4. 颜色复杂度检查（排除纯文字图片）
    const colorComplexity = await analyzeColorComplexity(file);

    if (colorComplexity < 10 && type === 'clothing') {
      return {
        valid: false,
        level: 'warning',
        reason: '图片颜色单一，可能是文字或简单图形',
        suggestions: ['请确保上传的是服装实物照片']
      };
    }

    return {
      valid: true,
      level: 'success',
      reason: '基础校验通过'
    };

  } catch (error) {
    console.error('图片校验失败:', error);
    return {
      valid: false,
      level: 'error',
      reason: '无法读取图片信息',
      suggestions: ['请尝试重新选择图片']
    };
  }
}

/**
 * 获取图片尺寸
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法加载图片'));
    };

    img.src = url;
  });
}

/**
 * 分析图片颜色复杂度
 * 返回值越大表示颜色越丰富
 */
async function analyzeColorComplexity(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(50); // 默认通过
          return;
        }

        // 缩小采样以提高性能
        const sampleSize = 100;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize);
        const pixels = imageData.data;

        // 统计颜色种类（降低精度以提高性能）
        const colorSet = new Set<string>();

        for (let i = 0; i < pixels.length; i += 4) {
          // 降低颜色精度（每32个色阶合并为1个）
          const r = Math.floor(pixels[i] / 32);
          const g = Math.floor(pixels[i + 1] / 32);
          const b = Math.floor(pixels[i + 2] / 32);
          colorSet.add(`${r},${g},${b}`);
        }

        URL.revokeObjectURL(url);
        resolve(colorSet.size);

      } catch (error) {
        URL.revokeObjectURL(url);
        console.error('颜色分析失败:', error);
        resolve(50); // 默认通过
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法加载图片'));
    };

    img.src = url;
  });
}

/**
 * 将 File 转换为 HTMLImageElement
 */
export function fileToImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('无法加载图片'));
    };

    img.src = url;
  });
}

/**
 * AI 增强校验：使用 MediaPipe 进行人脸检测
 * 仅用于模特照片的额外校验
 */
export async function validateWithAI(
  imageElement: HTMLImageElement,
  type: 'clothing' | 'model'
): Promise<ValidationResult> {
  // 仅在支持的环境中加载 MediaPipe
  try {
    const { detectFaces, isWasmSupported, loadMediaPipe } = await import('./mediaPipeLoader');

    // 检查 WASM 支持
    if (!isWasmSupported()) {
      return {
        valid: true,
        level: 'warning',
        reason: '您的浏览器不支持 AI 检测，已跳过智能校验',
        suggestions: ['建议使用最新版 Chrome、Safari 或 Firefox 浏览器']
      };
    }

    // 加载 MediaPipe 模型
    await loadMediaPipe();

    // 检测人脸
    const { count, confidence } = await detectFaces(imageElement);

    // 模特照片校验
    if (type === 'model') {
      if (count === 0) {
        return {
          valid: false,
          level: 'error',
          reason: '未检测到人脸',
          suggestions: [
            '模特照片应包含清晰的人脸',
            '请确保照片中有一个儿童模特',
            '避免使用风景、动物或物品照片'
          ]
        };
      }

      if (count > 1) {
        return {
          valid: false,
          level: 'error',
          reason: `检测到 ${count} 张人脸`,
          suggestions: [
            '请使用单人照片',
            '避免使用多人合照'
          ]
        };
      }

      if (confidence < 0.6) {
        return {
          valid: true,
          level: 'warning',
          reason: '人脸识别置信度较低',
          suggestions: [
            '建议使用更清晰的正面照片',
            '确保人脸光线充足、无遮挡'
          ]
        };
      }

      return {
        valid: true,
        level: 'success',
        reason: `AI 校验通过（检测到 1 张人脸，置信度 ${(confidence * 100).toFixed(0)}%）`
      };
    }

    // 服装照片校验
    if (type === 'clothing') {
      // ✅ Step 1: 使用图像分类器识别内容
      try {
        const { classifyImage } = await import('./mediaPipeLoader');
        const classification = await classifyImage(imageElement);

        // 如果不是服装
        if (!classification.isClothing) {
          return {
            valid: false,
            level: 'error',
            reason: `检测到的内容是"${classification.topLabel}"（置信度 ${(classification.confidence * 100).toFixed(0)}%），不是服装类照片`,
            suggestions: [
              '请上传服装的照片（如 T恤、裙子、裤子、外套等）',
              '确保照片主体是服装产品',
              `其他可能的内容：${classification.allLabels.slice(1, 3).join('、')}`
            ]
          };
        }

        // 是服装，但检测到人脸
        if (count > 0) {
          return {
            valid: true,
            level: 'warning',
            reason: `检测到 ${count} 张人脸，识别为"${classification.topLabel}"`,
            suggestions: [
              '如果您要上传模特照片，请使用"模特参考图"功能',
              '如果这是纯服装照片，可以忽略此警告'
            ]
          };
        }

        // 完美：是服装且无人脸
        return {
          valid: true,
          level: 'success',
          reason: `AI 校验通过（识别为"${classification.topLabel}"，置信度 ${(classification.confidence * 100).toFixed(0)}%）`
        };

      } catch (classifyError) {
        console.warn('图像分类失败，仅使用人脸检测:', classifyError);

        // 降级：如果分类失败，仅使用人脸检测
        if (count > 0) {
          return {
            valid: true,
            level: 'warning',
            reason: `检测到 ${count} 张人脸`,
            suggestions: [
              '如果您要上传模特照片，请使用"模特参考图"功能',
              '如果这是纯服装照片，可以忽略此警告'
            ]
          };
        }

        return {
          valid: true,
          level: 'success',
          reason: 'AI 校验通过'
        };
      }
    }

    return {
      valid: true,
      level: 'success',
      reason: 'AI 校验通过'
    };

  } catch (error) {
    console.error('AI 校验失败:', error);
    return {
      valid: true,
      level: 'warning',
      reason: 'AI 检测失败，已跳过智能校验',
      suggestions: ['基础校验已通过，您可以继续使用']
    };
  }
}
