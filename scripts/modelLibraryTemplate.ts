/**
 * 模特库配置模板
 * 
 * 使用方法：
 * 1. 将此模板复制到 constants.tsx
 * 2. 根据实际情况修改每个模特的属性
 * 3. 确保 url 路径与 public/models/ 中的文件名匹配
 */

export const MODEL_LIBRARY: ModelEntry[] = [
    // 现有的 2 个模特
    {
        id: 'model_1',
        url: '/models/model_1.png',
        gender: '男',
        ageGroup: '3-6岁',
        ethnicity: '亚裔',
        name: '小小男孩A',
        uploadedBy: 'SYSTEM',
        uploadedAt: new Date().toISOString(),
        status: 'ACTIVE'
    },
    {
        id: 'model_2',
        url: '/models/model_2.png',
        gender: '男',
        ageGroup: '6-12岁',
        ethnicity: '亚裔',
        name: '阳光少年B',
        uploadedBy: 'SYSTEM',
        uploadedAt: new Date().toISOString(),
        status: 'ACTIVE'
    },

    // ========== 新增 48 个模特 ==========
    // 复制下面的模板 48 次，并修改属性

    {
        id: 'model_3',
        url: '/models/model_3.png',  // 👈 修改文件名
        gender: '女',                 // 👈 修改：男/女/中性
        ageGroup: '3-6岁',           // 👈 修改：0-1岁/1-3岁/3-6岁/6-12岁/12-16岁
        ethnicity: '亚裔',           // 👈 修改：亚裔/欧美/非裔/混血
        name: '可爱女孩C',           // 👈 修改：模特名称
        uploadedBy: 'SYSTEM',
        uploadedAt: new Date().toISOString(),
        status: 'ACTIVE'
    },

    // 继续添加 model_4, model_5, ..., model_50
    // ... (复制上面的对象 47 次)

    {
        id: 'model_50',
        url: '/models/model_50.png',
        gender: '男',
        ageGroup: '12-16岁',
        ethnicity: '欧美',
        name: '阳光少年Z',
        uploadedBy: 'SYSTEM',
        uploadedAt: new Date().toISOString(),
        status: 'ACTIVE'
    }
];
