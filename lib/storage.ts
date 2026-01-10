import { supabase } from './supabaseClient';

const BUCKET_NAME = 'images';

/**
 * 上传图片到 Supabase Storage
 * @param file 图片文件
 * @param userId 用户ID
 * @param folder 文件夹路径 (例如: 'uploads', 'generated', 'models', 'screenshots')
 * @returns 图片的公共 URL
 */
export async function uploadImage(
  file: File,
  userId: string,
  folder: string
): Promise<string | null> {
  try {
    // 生成唯一文件名: userId_folder_timestamp_random.ext
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${folder}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // 上传文件到 Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file);

    if (error) {
      console.error('上传图片失败:', error);
      return null;
    }

    // 获取公共 URL
    const { data: { publicUrl } } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('上传图片异常:', error);
    return null;
  }
}

/**
 * 上传 base64 图片到 Supabase Storage
 * @param base64Data base64 字符串 (data:image/png;base64,...)
 * @param userId 用户ID
 * @param folder 文件夹路径
 * @returns 图片的公共 URL
 */
export async function uploadBase64Image(
  base64Data: string,
  userId: string,
  folder: string
): Promise<string | null> {
  try {
    // 从 base64 中提取实际的图片数据
    const matches = base64Data.match(/^data:image\/(\w+);base64,(.+)$/);
    if (!matches) {
      console.error('无效的 base64 格式');
      return null;
    }

    const fileExt = matches[1]; // png, jpeg, etc.
    const base64String = matches[2];

    // 将 base64 转换为 Blob
    const byteCharacters = atob(base64String);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: `image/${fileExt}` });

    // 将 Blob 转换为 File
    const file = new File([blob], `image.${fileExt}`, { type: `image/${fileExt}` });

    return await uploadImage(file, userId, folder);
  } catch (error) {
    console.error('上传 base64 图片异常:', error);
    return null;
  }
}

/**
 * 从 Supabase Storage 删除图片
 * @param imageUrl 图片的完整 URL
 * @returns 是否删除成功
 */
export async function deleteImage(imageUrl: string): Promise<boolean> {
  try {
    // 从 URL 中提取文件路径
    // URL 格式: https://xxx.supabase.co/storage/v1/object/public/images/folders/filename
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split('/');
    const bucketIndex = pathParts.indexOf(BUCKET_NAME);

    if (bucketIndex === -1) {
      console.error('URL 中找不到 bucket 名称:', imageUrl);
      return false;
    }

    // 提取 bucket 之后的路径
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('删除图片失败:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('删除图片异常:', error);
    return false;
  }
}

/**
 * 批量删除图片
 * @param imageUrls 图片 URL 数组
 * @returns 成功删除的数量
 */
export async function deleteImages(imageUrls: string[]): Promise<number> {
  let successCount = 0;

  for (const url of imageUrls) {
    const result = await deleteImage(url);
    if (result) successCount++;
  }

  return successCount;
}
