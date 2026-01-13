
import { ModelEntry } from '../constants';

export interface GenerationConfig {
    type: 'model' | 'pure';
    clothingImage: File;
    params: {
        ratio: string;
        model?: string; // Model ID for 'model' type
        scene?: string;
        style?: string;
        // Pure clothing params
        background?: string;
        angle?: string;

        // Additional
        clothingGender?: 'boys' | 'girls' | 'unisex';
    };
}

interface BuildParamsInput {
    clothingGender: 'boys' | 'girls' | 'unisex';
    displayType: 'model' | 'pure';
    modelSelection: 'auto' | 'manual';
    selectedModels: string[];
    clothingImage: File;
    models: ModelEntry[]; // 🔥 Add models input
}

// 纯服装展示预设 variations
const PURE_CLOTHING_VARIATIONS = [
    { background: '纯白底-电商标准', angle: '平铺-微褶皱自然', style: '电商标准', ratio: '1:1' },
    { background: '纯白底-电商标准', angle: '挂拍-无痕隐形', style: '电商标准', ratio: '3:4' },
    { background: '木纹底-温馨感', angle: '平铺-微褶皱自然', style: '社交媒体', ratio: '1:1' },
    { background: '大理石-轻奢感', angle: '平铺-微褶皱自然', style: '品牌宣传', ratio: '3:4' },
    { background: '纯白底-电商标准', angle: '3D建模-立体支撑', style: '社交媒体', ratio: '1:1' },
    { background: '地毯绒面', angle: '挂拍-无痕隐形', style: '艺术创意', ratio: '3:4' },
];

export function buildGenerationParams(input: BuildParamsInput): GenerationConfig[] {
    const { clothingGender, displayType, modelSelection, selectedModels, clothingImage, models } = input;

    if (displayType === 'pure') {
        // 纯服装展示图 - 6 张
        return PURE_CLOTHING_VARIATIONS.map(params => ({
            type: 'pure',
            clothingImage,
            params: {
                ...params,
                clothingGender // Keep context
            }
        }));
    }

    // 模特展示图
    if (modelSelection === 'manual' && selectedModels.length > 0) {
        // 用户自选模特
        return generateManualModelVariations(selectedModels, clothingImage, clothingGender);
    } else {
        // 系统自动选择
        return generateAutoModelVariations(clothingGender, clothingImage, models);
    }
}

// 自动生成模特变化
function generateAutoModelVariations(
    gender: 'boys' | 'girls' | 'unisex',
    clothingImage: File,
    models: ModelEntry[]
): GenerationConfig[] {
    let modelPool: string[];

    // 这里的 ID 需要和 constants.tsx 中的 ID 对应
    // 为了确保 ID 存在，我们从 MODEL_LIBRARY 中筛选
    const allBoys = models.filter(m => m.gender === '男' || m.gender === 'boy').map(m => m.id);
    const allGirls = models.filter(m => m.gender === '女' || m.gender === 'girl').map(m => m.id);

    if (gender === 'boys') {
        modelPool = allBoys.slice(0, 5); // 取前5个男童
    } else if (gender === 'girls') {
        modelPool = allGirls.slice(0, 5); // 取前5个女童
    } else {
        // 通用 - 男女混合
        modelPool = [
            ...allBoys.slice(0, 3),
            ...allGirls.slice(0, 3)
        ];
    }

    // 如果没有找到模特，使用默认或报错 (这里简单处理，假设库里一定有模特)
    if (modelPool.length === 0) {
        // Fallback if empty (should not happen in real app with data)
        modelPool = models.slice(0, 5).map(m => m.id);
    }

    // 生成 9 种变化
    const scenes = ['奶油风室内', '公园绿地', '简约摄影棚（纯色背景）'];
    const styles = ['森系', '街头潮流', '可爱风'];
    const ratios = ['3:4', '1:1', '16:9'];

    const variations: GenerationConfig[] = [];

    for (let i = 0; i < 9; i++) {
        variations.push({
            type: 'model',
            clothingImage,
            params: {
                ratio: ratios[i % 3],
                model: modelPool[i % modelPool.length],
                scene: scenes[i % 3],
                style: styles[i % 3],
                clothingGender: gender
            }
        });
    }

    return variations;
}

// 手动选择模特的变化
function generateManualModelVariations(
    selectedModels: string[],
    clothingImage: File,
    gender: 'boys' | 'girls' | 'unisex'
): GenerationConfig[] {
    const variations: GenerationConfig[] = [];
    // 比如选了 3 个模特，生成 9 张 -> 每个模特 3 张
    // 选了 1 个模特 -> 9 张
    const totalImages = 9;
    const scenesPerModel = Math.ceil(totalImages / selectedModels.length);

    const scenes = ['奶油风室内', '公园绿地', '简约摄影棚（纯色背景）'];
    const styles = ['森系', '街头潮流', '可爱风'];

    selectedModels.forEach((model, modelIndex) => {
        for (let i = 0; i < scenesPerModel && variations.length < totalImages; i++) {
            variations.push({
                type: 'model',
                clothingImage,
                params: {
                    ratio: i === 0 ? '3:4' : i === 1 ? '1:1' : '16:9',
                    model,
                    scene: scenes[i % 3],
                    style: styles[i % 3],
                    clothingGender: gender
                }
            });
        }
    });

    return variations; // 确保最多返回数量符合预期 (loop condition handles it)
}
