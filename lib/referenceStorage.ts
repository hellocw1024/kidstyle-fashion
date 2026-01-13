import { ReferenceImage } from '../types';
import { REFERENCE_IMAGE_LIBRARY } from '../constants';

const USER_REFERENCES_KEY = 'kidstyle_user_references';

/**
 * 获取所有参考图（系统内置 + 用户自定义）
 */
export async function getAllReferenceImages(): Promise<ReferenceImage[]> {
  try {
    // 获取用户自定义参考图
    const stored = localStorage.getItem(USER_REFERENCES_KEY);
    const userRefs: ReferenceImage[] = stored ? JSON.parse(stored) : [];

    // 合并系统内置和用户自定义
    return [...REFERENCE_IMAGE_LIBRARY, ...userRefs];
  } catch (error) {
    console.error('获取参考图失败:', error);
    return REFERENCE_IMAGE_LIBRARY;
  }
}

/**
 * 保存用户自定义参考图
 */
export async function saveReferenceImage(ref: ReferenceImage): Promise<boolean> {
  try {
    const userRefs = JSON.parse(localStorage.getItem(USER_REFERENCES_KEY) || '[]');

    // 检查是否已存在
    const existingIndex = userRefs.findIndex((r: ReferenceImage) => r.id === ref.id);

    if (existingIndex >= 0) {
      // 更新现有参考图
      userRefs[existingIndex] = ref;
    } else {
      // 添加新参考图
      userRefs.push(ref);
    }

    localStorage.setItem(USER_REFERENCES_KEY, JSON.stringify(userRefs));
    console.log('✅ 参考图已保存:', ref.name);
    return true;
  } catch (error) {
    console.error('❌ 保存参考图失败:', error);
    return false;
  }
}

/**
 * 删除用户自定义参考图
 */
export async function deleteReferenceImage(refId: string): Promise<boolean> {
  try {
    const userRefs = JSON.parse(localStorage.getItem(USER_REFERENCES_KEY) || '[]');
    const filtered = userRefs.filter((r: ReferenceImage) => r.id !== refId);

    if (filtered.length === userRefs.length) {
      console.warn('⚠️ 未找到要删除的参考图:', refId);
      return false;
    }

    localStorage.setItem(USER_REFERENCES_KEY, JSON.stringify(filtered));
    console.log('✅ 参考图已删除:', refId);
    return true;
  } catch (error) {
    console.error('❌ 删除参考图失败:', error);
    return false;
  }
}

/**
 * 增加参考图使用次数
 */
export async function incrementReferenceUsage(refId: string): Promise<void> {
  try {
    const allRefs = await getAllReferenceImages();
    const ref = allRefs.find(r => r.id === refId);

    if (ref && ref.source === 'USER') {
      const userRefs = JSON.parse(localStorage.getItem(USER_REFERENCES_KEY) || '[]');
      const index = userRefs.findIndex((r: ReferenceImage) => r.id === refId);

      if (index >= 0) {
        userRefs[index].usageCount++;
        userRefs[index].createdAt = userRefs[index].createdAt; // 保持原创建时间
        localStorage.setItem(USER_REFERENCES_KEY, JSON.stringify(userRefs));
        console.log('✅ 参考图使用次数已更新:', userRefs[index].name, '使用次数:', userRefs[index].usageCount);
      }
    } else if (ref) {
      // 系统内置参考图的使用次数仅记录在内存中（可选：可以同步到数据库）
      ref.usageCount++;
      console.log('✅ 系统参考图使用次数:', ref.name, '使用次数:', ref.usageCount);
    }
  } catch (error) {
    console.error('❌ 更新使用次数失败:', error);
  }
}

/**
 * 根据ID获取参考图
 */
export async function getReferenceImageById(refId: string): Promise<ReferenceImage | null> {
  try {
    const allRefs = await getAllReferenceImages();
    return allRefs.find(r => r.id === refId) || null;
  } catch (error) {
    console.error('❌ 获取参考图失败:', error);
    return null;
  }
}

/**
 * 筛选参考图
 */
export async function filterReferenceImages(filters: {
  type?: string;
  scene?: string;
  gender?: string;
  ageGroup?: string;
  search?: string;
}): Promise<ReferenceImage[]> {
  try {
    const allRefs = await getAllReferenceImages();

    return allRefs.filter(ref => {
      // 类型筛选
      if (filters.type && ref.type !== filters.type) return false;

      // 元数据筛选
      if (filters.scene && ref.metadata.scene !== filters.scene) return false;
      if (filters.gender && ref.metadata.gender !== filters.gender) return false;
      if (filters.ageGroup && ref.metadata.ageGroup !== filters.ageGroup) return false;

      // 搜索关键词（名称和标签）
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = ref.name.toLowerCase().includes(searchLower);
        const tagsMatch = ref.metadata.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        const sceneMatch = ref.metadata.scene?.toLowerCase().includes(searchLower);

        if (!nameMatch && !tagsMatch && !sceneMatch) return false;
      }

      return true;
    });
  } catch (error) {
    console.error('❌ 筛选参考图失败:', error);
    return [];
  }
}
