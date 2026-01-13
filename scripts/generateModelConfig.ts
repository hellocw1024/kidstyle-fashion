/**
 * 自动生成模特库配置脚本
 * 
 * 使用方法：
 * 1. 将所有模特照片放到 public/models/ 目录
 * 2. 运行: npx tsx scripts/generateModelConfig.ts
 * 3. 复制输出的配置到 constants.tsx
 */

import fs from 'fs';
import path from 'path';

const MODELS_DIR = path.join(process.cwd(), 'public/models');

// 配置规则：从文件名自动推断属性
// 命名格式建议: model_gender_age_ethnicity_序号.png
// 例如: model_boy_3-6_asian_03.png
function parseModelInfo(filename: string, index: number) {
    const parts = filename.replace(/\.(png|jpg|jpeg)$/i, '').split('_');

    // 尝试从文件名解析，失败则使用默认值
    const config = {
        id: `model_${index + 1}`,
        url: `/models/${filename}`,
        gender: '男', // 默认值
        ageGroup: '3-6岁', // 默认值
        ethnicity: '亚裔', // 默认值
        name: `模特 ${index + 1}`,
        uploadedBy: 'SYSTEM',
        uploadedAt: new Date().toISOString(),
        status: 'ACTIVE' as const
    };

    // 智能解析（如果文件名包含关键词）
    const lowerFilename = filename.toLowerCase();

    // 性别识别
    if (lowerFilename.includes('girl') || lowerFilename.includes('female') || lowerFilename.includes('女')) {
        config.gender = '女';
    } else if (lowerFilename.includes('neutral') || lowerFilename.includes('中性')) {
        config.gender = '中性';
    }

    // 年龄识别
    if (lowerFilename.includes('0-1') || lowerFilename.includes('baby')) {
        config.ageGroup = '0-1岁';
    } else if (lowerFilename.includes('1-3') || lowerFilename.includes('toddler')) {
        config.ageGroup = '1-3岁';
    } else if (lowerFilename.includes('3-6') || lowerFilename.includes('preschool')) {
        config.ageGroup = '3-6岁';
    } else if (lowerFilename.includes('6-12') || lowerFilename.includes('child')) {
        config.ageGroup = '6-12岁';
    } else if (lowerFilename.includes('12-16') || lowerFilename.includes('teen')) {
        config.ageGroup = '12-16岁';
    }

    // 国籍识别
    if (lowerFilename.includes('european') || lowerFilename.includes('欧美')) {
        config.ethnicity = '欧美';
    } else if (lowerFilename.includes('african') || lowerFilename.includes('非裔')) {
        config.ethnicity = '非裔';
    } else if (lowerFilename.includes('mixed') || lowerFilename.includes('混血')) {
        config.ethnicity = '混血';
    }

    return config;
}

async function generateConfig() {
    try {
        console.log('📂 扫描目录:', MODELS_DIR);

        if (!fs.existsSync(MODELS_DIR)) {
            console.error('❌ 目录不存在:', MODELS_DIR);
            console.log('💡 请先创建 public/models/ 目录并放入图片');
            return;
        }

        const files = fs.readdirSync(MODELS_DIR)
            .filter(f => /\.(png|jpg|jpeg)$/i.test(f))
            .sort(); // 按文件名排序

        if (files.length === 0) {
            console.error('❌ 未找到图片文件');
            console.log('💡 请将模特照片（.png, .jpg）放到 public/models/ 目录');
            return;
        }

        console.log(`✅ 找到 ${files.length} 张图片\n`);

        const models = files.map((file, index) => parseModelInfo(file, index));

        console.log('═══════════════════════════════════════════════════════');
        console.log('📋 生成的配置（复制下面的代码到 constants.tsx）');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('export const MODEL_LIBRARY: ModelEntry[] = [');

        models.forEach((model, index) => {
            console.log('  {');
            console.log(`    id: '${model.id}',`);
            console.log(`    url: '${model.url}',`);
            console.log(`    gender: '${model.gender}',`);
            console.log(`    ageGroup: '${model.ageGroup}',`);
            console.log(`    ethnicity: '${model.ethnicity}',`);
            console.log(`    name: '${model.name}',`);
            console.log(`    uploadedBy: '${model.uploadedBy}',`);
            console.log(`    uploadedAt: new Date().toISOString(),`);
            console.log(`    status: '${model.status}'`);
            console.log(index === models.length - 1 ? '  }' : '  },');
        });

        console.log('];\n');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`✅ 共生成 ${models.length} 个模特配置`);
        console.log('\n💡 提示：');
        console.log('1. 复制上面的代码');
        console.log('2. 打开 constants.tsx');
        console.log('3. 替换 MODEL_LIBRARY 的内容');
        console.log('4. 如果自动识别的属性不正确，请手动修改');

        // 同时输出到文件
        const outputPath = path.join(process.cwd(), 'model-config-output.txt');
        const output = `export const MODEL_LIBRARY: ModelEntry[] = [\n${models.map((model, index) =>
            `  {\n    id: '${model.id}',\n    url: '${model.url}',\n    gender: '${model.gender}',\n    ageGroup: '${model.ageGroup}',\n    ethnicity: '${model.ethnicity}',\n    name: '${model.name}',\n    uploadedBy: '${model.uploadedBy}',\n    uploadedAt: new Date().toISOString(),\n    status: '${model.status}'\n  }${index === models.length - 1 ? '' : ','}`
        ).join('\n')}\n];`;

        fs.writeFileSync(outputPath, output, 'utf-8');
        console.log(`\n📄 配置已保存到: ${outputPath}`);

    } catch (error) {
        console.error('❌ 生成失败:', error);
    }
}

generateConfig();
