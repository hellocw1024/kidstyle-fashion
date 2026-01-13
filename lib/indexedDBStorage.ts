/**
 * IndexedDB 本地存储工具
 * 用于在浏览器中持久化存储图片资源
 */

const DB_NAME = 'XiaoHongYiDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

export interface StoredImage {
  id: string;
  url: string;           // 原图 Base64
  thumbnail: string;     // 缩略图 Base64
  type: 'UPLOAD' | 'GENERATE';
  date: string;
  tags: string[];
  createdAt: number;     // 时间戳，用于排序
  modelName?: string;    // AI 模型名称
}

/**
 * 打开 IndexedDB 数据库
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ IndexedDB 打开失败:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('✅ IndexedDB 打开成功');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建对象存储（如果不存在）
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });

        // 创建索引以便快速查询
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('✅ IndexedDB 对象存储创建成功');
      }
    };
  });
}

/**
 * 保存图片到 IndexedDB
 */
export async function saveImage(image: StoredImage): Promise<boolean> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.put(image);

      request.onsuccess = () => {
        console.log('✅ 图片保存到 IndexedDB 成功:', image.id);
        resolve(true);
      };

      request.onerror = () => {
        console.error('❌ 图片保存失败:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ saveImage 异常:', error);
    return false;
  }
}

/**
 * 获取所有图片（按创建时间倒序）
 */
export async function getAllImages(): Promise<StoredImage[]> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const objectStore = transaction.objectStore(STORE_NAME);
      const index = objectStore.index('createdAt');
      const request = index.openCursor(null, 'prev'); // 倒序遍历

      const results: StoredImage[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;

        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          console.log('✅ 从 IndexedDB 加载图片成功:', results.length, '张');
          resolve(results);
        }
      };

      request.onerror = () => {
        console.error('❌ 获取图片失败:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ getAllImages 异常:', error);
    return [];
  }
}

/**
 * 删除图片
 */
export async function deleteImage(imageId: string): Promise<boolean> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.delete(imageId);

      request.onsuccess = () => {
        console.log('✅ 图片删除成功:', imageId);
        resolve(true);
      };

      request.onerror = () => {
        console.error('❌ 图片删除失败:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ deleteImage 异常:', error);
    return false;
  }
}

/**
 * 清空所有图片
 */
export async function clearAllImages(): Promise<boolean> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const objectStore = transaction.objectStore(STORE_NAME);
      const request = objectStore.clear();

      request.onsuccess = () => {
        console.log('✅ 所有图片已清空');
        resolve(true);
      };

      request.onerror = () => {
        console.error('❌ 清空图片失败:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ clearAllImages 异常:', error);
    return false;
  }
}

/**
 * 获取存储空间使用情况
 */
export async function getStorageInfo(): Promise<{ count: number; estimatedSize: string }> {
  try {
    const images = await getAllImages();

    // 估算存储大小（Base64 长度）
    let totalSize = 0;
    images.forEach(img => {
      totalSize += img.url.length + img.thumbnail.length;
    });

    const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);

    return {
      count: images.length,
      estimatedSize: `${sizeInMB} MB`
    };
  } catch (error) {
    console.error('❌ getStorageInfo 异常:', error);
    return { count: 0, estimatedSize: '0 MB' };
  }
}

/**
 * 导出所有图片为可下载的格式
 */
export function exportImageAsFile(image: StoredImage): { filename: string; data: string } {
  const filename = `小红衣_${image.date}_${image.id}.png`;
  return { filename, data: image.url };
}
