/**
 * 缩略图生成工具
 * 使用 Canvas 压缩图片，生成适合列表展示的缩略图
 */

export interface ThumbnailOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * 从 Base64 图片生成缩略图
 * @param base64String 原始 Base64 图片
 * @param options 缩略图配置
 * @returns Promise<string> 缩略图的 Base64 字符串
 */
export async function generateThumbnail(
  base64String: string,
  options: ThumbnailOptions = {}
): Promise<string> {
  const {
    maxWidth = 300,    // 最大宽度 300px
    maxHeight = 300,   // 最大高度 300px
    quality = 0.7      // JPEG 质量 0.7
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // 创建 Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('无法获取 Canvas 上下文'));
          return;
        }

        // 计算缩放比例（保持宽高比）
        let width = img.width;
        let height = img.height;
        const ratio = Math.min(maxWidth / width, maxHeight / height);

        if (ratio < 1) {
          width = width * ratio;
          height = height * ratio;
        }

        // 设置 Canvas 尺寸
        canvas.width = width;
        canvas.height = height;

        // 绘制缩略图
        ctx.drawImage(img, 0, 0, width, height);

        // 导出为 Base64（使用 JPEG 格式压缩）
        const thumbnail = canvas.toDataURL('image/jpeg', quality);
        resolve(thumbnail);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('图片加载失败'));
    };

    // 加载原始图片
    img.src = base64String;
  });
}

/**
 * 批量生成缩略图
 * @param base64Images Base64 图片数组
 * @param options 缩略图配置
 * @returns Promise<string[]> 缩略图数组
 */
export async function generateThumbnails(
  base64Images: string[],
  options?: ThumbnailOptions
): Promise<string[]> {
  const promises = base64Images.map(img => generateThumbnail(img, options));
  return Promise.all(promises);
}
