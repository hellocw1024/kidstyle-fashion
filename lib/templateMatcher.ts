import { GenerationTemplate, SystemConfig } from '../types';

/**
 * 模板匹配结果
 */
export interface TemplateMatch {
    template: GenerationTemplate;
    matchScore: number; // 0-100
    reasons: string[]; // 匹配原因
}

/**
 * 智能匹配模板
 * 根据上传的服装图片和系统配置，推荐最合适的模板
 */
export function matchTemplates(
    uploadedImages: string[],
    templates: GenerationTemplate[],
    config: SystemConfig
): TemplateMatch[] {
    if (templates.length === 0) return [];

    const matches: TemplateMatch[] = templates.map(template => {
        let score = 0;
        const reasons: string[] = [];

        // 基础分：所有模板都有 20 分
        score += 20;

        // 使用频率加分（最高 30 分）
        if (template.useCount > 0) {
            const frequencyScore = Math.min(template.useCount * 5, 30);
            score += frequencyScore;
            if (template.useCount >= 3) {
                reasons.push('常用模板');
            }
        }

        // 最近使用加分（最高 20 分）
        const daysSinceUpdate = (Date.now() - new Date(template.updatedAt).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceUpdate < 7) {
            const recencyScore = Math.max(20 - daysSinceUpdate * 2, 0);
            score += recencyScore;
            if (daysSinceUpdate < 1) {
                reasons.push('最近使用');
            }
        }

        // 配置完整度加分（最高 15 分）
        let configCompleteness = 0;
        if (template.config.scene) configCompleteness += 5;
        if (template.config.modelRef) configCompleteness += 5;
        if (template.config.customPrompt) configCompleteness += 5;
        score += configCompleteness;
        if (configCompleteness >= 10) {
            reasons.push('配置完整');
        }

        // 风格流行度加分（最高 15 分）
        const popularStyles = ['韩系', '日系', '简约', '时尚'];
        if (popularStyles.some(style => template.config.style.includes(style))) {
            score += 15;
            reasons.push('热门风格');
        }

        // 确保分数在 0-100 之间
        score = Math.min(Math.max(score, 0), 100);

        // 如果没有特别的原因，添加一个通用原因
        if (reasons.length === 0) {
            reasons.push('推荐使用');
        }

        return {
            template,
            matchScore: Math.round(score),
            reasons
        };
    });

    // 按匹配分数降序排序
    return matches.sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * 获取推荐模板（前 N 个）
 */
export function getRecommendedTemplates(
    uploadedImages: string[],
    templates: GenerationTemplate[],
    config: SystemConfig,
    count: number = 3
): TemplateMatch[] {
    const matches = matchTemplates(uploadedImages, templates, config);
    return matches.slice(0, count);
}
