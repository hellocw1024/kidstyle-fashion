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
    
    if (dimensions.width < 200 || dimensions.height < 200) {
      return {
        valid: false,
        level: 'error',
        reason: `图片分辨率过低（${dimensions.width}x${dimensions.height}）`,
        suggestions: ['请上传至少 200x200 像素的图片']
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
