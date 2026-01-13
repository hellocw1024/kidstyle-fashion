import { GenerationTemplate } from '../types';

const TEMPLATES_KEY = 'kidstyle_templates';

/**
 * 获取所有模板
 */
export async function getAllTemplates(): Promise<GenerationTemplate[]> {
  try {
    const stored = localStorage.getItem(TEMPLATES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('❌ 获取模板失败:', error);
    return [];
  }
}

/**
 * 保存模板（新建或更新）
 */
export async function saveTemplate(template: GenerationTemplate): Promise<boolean> {
  try {
    const templates = await getAllTemplates();
    const existingIndex = templates.findIndex(t => t.id === template.id);

    if (existingIndex >= 0) {
      // 更新现有模板
      templates[existingIndex] = template;
    } else {
      // 添加新模板
      templates.push(template);
    }

    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
    console.log('✅ 模板已保存:', template.name);
    return true;
  } catch (error) {
    console.error('❌ 保存模板失败:', error);
    return false;
  }
}

/**
 * 删除模板
 */
export async function deleteTemplateById(id: string): Promise<boolean> {
  try {
    const templates = await getAllTemplates();
    const filtered = templates.filter(t => t.id !== id);

    if (filtered.length === templates.length) {
      console.warn('⚠️ 未找到要删除的模板:', id);
      return false;
    }

    localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
    console.log('✅ 模板已删除:', id);
    return true;
  } catch (error) {
    console.error('❌ 删除模板失败:', error);
    return false;
  }
}

/**
 * 增加模板使用次数
 */
export async function incrementTemplateUseCount(id: string): Promise<void> {
  try {
    const templates = await getAllTemplates();
    const template = templates.find(t => t.id === id);

    if (template) {
      template.useCount++;
      template.updatedAt = new Date().toISOString();
      await saveTemplate(template);
      console.log('✅ 模板使用次数已更新:', template.name, '使用次数:', template.useCount);
    }
  } catch (error) {
    console.error('❌ 更新使用次数失败:', error);
  }
}

/**
 * 根据ID获取模板
 */
export async function getTemplateById(id: string): Promise<GenerationTemplate | null> {
  try {
    const templates = await getAllTemplates();
    return templates.find(t => t.id === id) || null;
  } catch (error) {
    console.error('❌ 获取模板失败:', error);
    return null;
  }
}

/**
 * 筛选模板
 */
export async function filterTemplates(filters: {
  userId?: string;
  type?: string;
  style?: string;
  search?: string;
}): Promise<GenerationTemplate[]> {
  try {
    const templates = await getAllTemplates();

    return templates.filter(template => {
      // 用户筛选
      if (filters.userId && template.userId !== filters.userId) return false;

      // 类型筛选
      if (filters.type && template.config.type !== filters.type) return false;

      // 风格筛选
      if (filters.style && template.config.style !== filters.style) return false;

      // 搜索关键词（名称和描述）
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const nameMatch = template.name.toLowerCase().includes(searchLower);
        const descMatch = template.description?.toLowerCase().includes(searchLower);
        if (!nameMatch && !descMatch) return false;
      }

      return true;
    });
  } catch (error) {
    console.error('❌ 筛选模板失败:', error);
    return [];
  }
}

/**
 * 获取用户的模板
 */
export async function getUserTemplates(userId: string): Promise<GenerationTemplate[]> {
  return filterTemplates({ userId });
}

/**
 * 获取最常用的模板（按使用次数排序）
 */
export async function getMostUsedTemplates(limit: number = 5): Promise<GenerationTemplate[]> {
  try {
    const templates = await getAllTemplates();
    return templates
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, limit);
  } catch (error) {
    console.error('❌ 获取热门模板失败:', error);
    return [];
  }
}
