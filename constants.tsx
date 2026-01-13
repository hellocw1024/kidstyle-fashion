
import React from 'react';
import {
  Shirt,
  User,
  Users,  // 用户管理图标
  LayoutDashboard,
  Settings,
  HelpCircle,
  History,
  CreditCard
} from 'lucide-react';
import { SystemConfig, ReferenceImage, ReferenceImageType } from './types';

export const INITIAL_CONFIG: SystemConfig = {
  styles: ['可爱风', '运动风', '学院风', '轻奢风', '国风', '森系', '街头潮流'],
  ageGroups: ['0-1岁', '1-3岁', '3-6岁', '6-12岁', '12-16岁'],
  genders: ['男', '女', '中性'],
  ethnicities: ['亚裔', '欧美', '非裔', '混血'],
  compositions: ['全身-展现整体', '半身-展现细节', '七分-动感构图', '特写-局部细节'],
  poses: ['静态站立', '可爱坐姿', '奔跑跳跃', '害羞微笑', '玩耍互动', '背影展示'],
  scenes: [
    '简约摄影棚（纯色背景）',
    '公园绿地',
    '奶油风室内',
    '校园操场',
    '欧式街道',
    '图书馆',
    '花园草坪',
    '室内游乐场',
    '家居卧室',
    '美术馆展厅',
    '沙滩海滨',
    '雪地场景',
    '泳池边',
    '枫林小道',
    '露营地'
  ],
  productForms: ['平铺-微褶皱自然', '挂拍-无痕隐形', '3D建模-立体支撑'],
  productFocus: ['整体呈现', '面料质感特写', '工艺细节(领口/刺绣)'],
  productBackgrounds: ['纯白底-电商标准', '木纹底-温馨感', '大理石-轻奢感', '地毯绒面'],
  // AI 提示词模板
  promptTemplates: {
    mainPrompt: `TASK: Professional children's clothing commercial photography.

INSTRUCTIONS: Analyze the reference clothing images and the scene settings:
1. **SCENE**: Match the scene to the clothing's style{{scene}} (Automatically select or refine the most suitable scene)
2. **ATMOSPHERE**: Ensure the lighting and colors complement the clothing's aesthetic.

STYLE: {{style}}
QUALITY: {{quality}} - extremely high detail, commercial catalog quality.

{{mode_prompt}}

{{scene_guidance}}

{{custom_prompt}}

CRITICAL IDENTITY RULES:
1. IF A MODEL IMAGE IS PROVIDED: You MUST maintain 100% facial identity consistency. The child in the generated image must be the EXACT SAME PERSON as in the model photo. Capture every detail: eye shape, nose structure, lip curve, eyebrow thickness, and hair texture.
2. The generated child must look like they walked directly from the model photo into this new scene.
Render the clothing with accurate colors, patterns, and fabric texture. The background, lighting, and atmosphere should match the overall style.`,
    modelModePrompt: `MODE: ON-MODEL PROFESSIONAL PHOTOSHOOT
IDENTITY: ABSOLUTE CONSISTENCY REQUIRED. Use the attached model photo as the ONLY reference for the child's identity, face, and hair.
MODEL DETAILS: {{gender}} child, age {{ageGroup}}, {{ethnicity}} heritage.
POSE & EMOTION: {{pose}}
COMPOSITION: {{composition}}`,
    productModePrompt: `MODE: PRODUCT DISPLAY (STILL LIFE)
FORM: {{productForm}}
FOCUS: {{productFocus}}
BACKGROUND: {{productBackground}}`,
    sceneGuidance: `SCENE: {{scene}}
Scene should match the clothing's style. Lighting, colors, and atmosphere should complement the clothing design.`,
    qualityGuidance: `QUALITY: {{quality}}
Use extremely high detail, commercial catalog quality standards.`,
    additionalGuidance: `ADDITIONAL DETAILS: {{customPrompt}}`,

    // 🔥 参考图提示词模板
    referencePromptTemplates: {
      enabled: true,
      mainGuidance: `REFERENCE IMAGE GUIDANCE:
You have been provided with a reference image alongside the clothing images. Use it as follows:
- Reference Mode: {{mode}}
- Extract these elements from the reference: {{elements}}
- Apply these extracted elements to the clothing you are generating
{{custom_instruction}}

{{critical_notice}}`,
      strictMode: `STRICTLY FOLLOW the reference style closely`,
      flexibleMode: `Use as FLEXIBLE INSPIRATION while maintaining your own creativity`,
      elementExtraction: `Extract and apply: {{elements}}`,
      criticalNotice: `CRITICAL: The CLOTHING must come from the uploaded clothing images, but the STYLE/ATMOSPHERE should match the reference image.`
    }
  }
};

export const RECHARGE_OPTIONS = [
  { amount: 10, quota: 10 },
  { amount: 20, quota: 20, bonus: '首充+2' },
  { amount: 50, quota: 50 },
  { amount: 100, quota: 100 },
  { amount: 200, quota: 200 },
  { amount: 500, quota: 580, bonus: '送80' }
];

export const NAV_ITEMS = [
  { id: 'GENERATION', label: 'AI生成', icon: <Shirt size={20} /> },
  { id: 'USER_CENTER', label: '个人中心', icon: <User size={20} /> },
  { id: 'HELP', label: '帮助中心', icon: <HelpCircle size={20} /> }
];

export const ADMIN_NAV_ITEMS = [
  { id: 'STATS', label: '运营看板', icon: <LayoutDashboard size={20} /> },
  { id: 'AUDIT', label: '充值审核', icon: <CreditCard size={20} /> },
  { id: 'USERS', label: '用户管理', icon: <Users size={20} /> },  // 新增用户管理
  { id: 'RESOURCES', label: '资源管理', icon: <History size={20} /> },
  { id: 'CONFIG', label: '深度配置', icon: <Settings size={20} /> },
  { id: 'USER_CENTER', label: '个人中心', icon: <User size={20} /> }
];

export interface ModelEntry {
  id: string;
  url: string;
  gender: string;
  ageGroup: string;
  ethnicity: string;
  name?: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export const MODEL_LIBRARY: ModelEntry[] = [
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
  {
    id: 'model_batch1_1',
    url: '/models/chenchen_3yo.png',
    gender: '男',
    ageGroup: '0-1岁',
    ethnicity: '亚裔',
    name: '晨晨',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'model_batch1_2',
    url: '/models/xiaobo_3yo.png',
    gender: '男',
    ageGroup: '0-1岁',
    ethnicity: '亚裔',
    name: '小博',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'model_batch1_3',
    url: '/models/yangyang_4yo.png',
    gender: '男',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '阳阳',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'model_batch1_4',
    url: '/models/hanhan_5yo.png',
    gender: '男',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '涵涵',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'model_batch1_5',
    url: '/models/xuanxuan_5yo.png',
    gender: '男',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '轩轩',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'model_batch2_6',
    url: '/models/mingming_6yo.png',
    gender: '男',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '铭铭',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'model_batch2_7',
    url: '/models/lele_6yo.png',
    gender: '男',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '乐乐',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'model_batch2_8',
    url: '/models/zichen_7yo.png',
    gender: '男',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '梓晨',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'model_batch2_9',
    url: '/models/junjie_8yo.png',
    gender: '男',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '俊杰',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'model_batch2_10',
    url: '/models/haoyu_8yo.png',
    gender: '男',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '浩宇',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_1',
    url: '/models/china_boy_1_3_1768199803161.png',
    gender: '男',
    ageGroup: '1-3岁',
    ethnicity: '亚裔',
    name: '中国男孩-1',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_2',
    url: '/models/china_boy_2_3_1768199821225.png',
    gender: '男',
    ageGroup: '1-3岁',
    ethnicity: '亚裔',
    name: '中国男孩-2',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_3',
    url: '/models/china_boy_3_4_1768199836563.png',
    gender: '男',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国男孩-3',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_4',
    url: '/models/china_boy_4_5_1768199850699.png',
    gender: '男',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国男孩-4',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_5',
    url: '/models/china_boy_5_5_1768199865237.png',
    gender: '男',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国男孩-5',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_6',
    url: '/models/china_boy_6_6_1768199886487.png',
    gender: '男',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国男孩-6',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_7',
    url: '/models/china_boy_7_6_1768199901945.png',
    gender: '男',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国男孩-7',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_8',
    url: '/models/china_boy_8_7_1768199917272.png',
    gender: '男',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国男孩-8',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_9',
    url: '/models/china_boy_9_8_1768199932789.png',
    gender: '男',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国男孩-9',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_10',
    url: '/models/china_boy_10_8_1768199947433.png',
    gender: '男',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国男孩-10',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_11',
    url: '/models/china_boy_11_9_1768199967505.png',
    gender: '男',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国男孩-11',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_12',
    url: '/models/china_boy_12_10_1768199982662.png',
    gender: '男',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国男孩-12',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_13',
    url: '/models/china_boy_13_10_1768199997037.png',
    gender: '男',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国男孩-13',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_14',
    url: '/models/china_boy_14_11_1768200012443.png',
    gender: '男',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国男孩-14',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_15',
    url: '/models/china_boy_15_12_1768200028790.png',
    gender: '男',
    ageGroup: '12-16岁',
    ethnicity: '亚裔',
    name: '中国男孩-15',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_16',
    url: '/models/china_boy_16_12_1768200045143.png',
    gender: '男',
    ageGroup: '12-16岁',
    ethnicity: '亚裔',
    name: '中国男孩-16',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_17',
    url: '/models/china_boy_17_13_1768200067102.png',
    gender: '男',
    ageGroup: '12-16岁',
    ethnicity: '亚裔',
    name: '中国男孩-17',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_boy_18',
    url: '/models/china_boy_18_13_1768200081745.png',
    gender: '男',
    ageGroup: '12-16岁',
    ethnicity: '亚裔',
    name: '中国男孩-18',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_1',
    url: '/models/china_girl_1_3_years_old_1768274023038.png',
    gender: '女',
    ageGroup: '1-3岁',
    ethnicity: '亚裔',
    name: '中国女孩-1',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_2',
    url: '/models/china_girl_2_4_years_old_1768274038095.png',
    gender: '女',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国女孩-2',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_3',
    url: '/models/china_girl_3_5_years_old_1768274053044.png',
    gender: '女',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国女孩-3',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_4',
    url: '/models/china_girl_4_6_years_old_1768274067956.png',
    gender: '女',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国女孩-4',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_5',
    url: '/models/china_girl_5_7_years_old_1768274081953.png',
    gender: '女',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国女孩-5',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_6',
    url: '/models/china_girl_6_8_years_old_1768274095938.png',
    gender: '女',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国女孩-6',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_7',
    url: '/models/china_girl_7_9_years_old_1768274112268.png',
    gender: '女',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国女孩-7',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_8',
    url: '/models/china_girl_8_10_years_old_1768274127173.png',
    gender: '女',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国女孩-8',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_9',
    url: '/models/china_girl_9_11_years_old_1768274142148.png',
    gender: '女',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国女孩-9',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_10',
    url: '/models/china_girl_10_12_years_old_1768274157887.png',
    gender: '女',
    ageGroup: '12-16岁',
    ethnicity: '亚裔',
    name: '中国女孩-10',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_11',
    url: '/models/china_girl_11_3_years_old_1768274384653.png',
    gender: '女',
    ageGroup: '1-3岁',
    ethnicity: '亚裔',
    name: '中国女孩-11',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_new_1',
    url: '/models/girl_model_1.png',
    gender: '女',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国女孩-12',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_new_2',
    url: '/models/girl_model_2.png',
    gender: '女',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国女孩-13',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_new_3',
    url: '/models/girl_model_3.png',
    gender: '女',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国女孩-14',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_new_4',
    url: '/models/girl_model_4.png',
    gender: '女',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国女孩-15',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_new_5',
    url: '/models/girl_model_5.png',
    gender: '女',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国女孩-16',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_new_6',
    url: '/models/girl_model_6.png',
    gender: '女',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国女孩-17',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_new_7',
    url: '/models/girl_model_7.png',
    gender: '女',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国女孩-18',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_new_8',
    url: '/models/girl_model_8.png',
    gender: '女',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国女孩-19',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_new_9',
    url: '/models/girl_model_9.png',
    gender: '女',
    ageGroup: '6-12岁',
    ethnicity: '亚裔',
    name: '中国女孩-20',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  },
  {
    id: 'china_girl_new_10',
    url: '/models/girl_model_10.png',
    gender: '女',
    ageGroup: '3-6岁',
    ethnicity: '亚裔',
    name: '中国女孩-21',
    uploadedBy: 'SYSTEM',
    uploadedAt: new Date().toISOString(),
    status: 'ACTIVE'
  }
];

// 内置参考图库
export const REFERENCE_IMAGE_LIBRARY: ReferenceImage[] = [
  // === 户外场景 - 公园 ===
  {
    id: 'ref_park_running_boy',
    url: '/references/park_running_boy.jpg',
    name: '公园奔跑-男童',
    type: ReferenceImageType.COMPREHENSIVE,
    metadata: {
      scene: '公园绿地',
      pose: '奔跑跳跃',
      mood: '开心活泼',
      ageGroup: '6-12岁',
      gender: '男',
      style: '运动风',
      tags: ['户外', '阳光', '动态', '活力']
    },
    source: 'SYSTEM',
    createdAt: new Date().toISOString(),
    usageCount: 0,
    status: 'ACTIVE'
  },
  {
    id: 'ref_park_sitting_girl',
    url: '/references/park_sitting_girl.jpg',
    name: '公园草地-女童坐姿',
    type: ReferenceImageType.COMPREHENSIVE,
    metadata: {
      scene: '公园绿地',
      pose: '可爱坐姿',
      mood: '温柔甜美',
      ageGroup: '3-6岁',
      gender: '女',
      style: '可爱风',
      tags: ['户外', '自然', '甜美', '静态']
    },
    source: 'SYSTEM',
    createdAt: new Date().toISOString(),
    usageCount: 0,
    status: 'ACTIVE'
  },

  // === 海滩场景 ===
  {
    id: 'ref_beach_playing',
    url: '/references/beach_playing.jpg',
    name: '沙滩玩耍-儿童',
    type: ReferenceImageType.COMPREHENSIVE,
    metadata: {
      scene: '沙滩海滨',
      pose: '玩耍互动',
      mood: '开心自由',
      ageGroup: '3-6岁',
      gender: '中性',
      style: '休闲风',
      tags: ['海滩', '夏日', '自由', '玩耍']
    },
    source: 'SYSTEM',
    createdAt: new Date().toISOString(),
    usageCount: 0,
    status: 'ACTIVE'
  },

  // === 室内场景 - 摄影棚 ===
  {
    id: 'ref_studio_standing_boy',
    url: '/references/studio_standing_boy.jpg',
    name: '摄影棚站立-男童',
    type: ReferenceImageType.SCENE,
    metadata: {
      scene: '简约摄影棚',
      pose: '静态站立',
      mood: '酷酷的',
      ageGroup: '6-12岁',
      gender: '男',
      style: '轻奢风',
      tags: ['纯色背景', '专业', '简洁', '时尚']
    },
    source: 'SYSTEM',
    createdAt: new Date().toISOString(),
    usageCount: 0,
    status: 'ACTIVE'
  },
  {
    id: 'ref_studio_girl_pose',
    url: '/references/studio_girl_pose.jpg',
    name: '摄影棚多姿势-女童',
    type: ReferenceImageType.POSE,
    metadata: {
      scene: '简约摄影棚',
      pose: '多种姿势',
      mood: '甜美可爱',
      ageGroup: '3-6岁',
      gender: '女',
      style: '可爱风',
      tags: ['专业', '多姿势', '商业', '标准']
    },
    source: 'SYSTEM',
    createdAt: new Date().toISOString(),
    usageCount: 0,
    status: 'ACTIVE'
  },

  // === 室内场景 - 家居 ===
  {
    id: 'ref_home_bedroom',
    url: '/references/home_bedroom.jpg',
    name: '温馨卧室-儿童',
    type: ReferenceImageType.COMPREHENSIVE,
    metadata: {
      scene: '家居卧室',
      pose: '自然互动',
      mood: '温馨舒适',
      ageGroup: '3-6岁',
      gender: '中性',
      style: '温馨风',
      tags: ['家居', '温馨', '生活化', '舒适']
    },
    source: 'SYSTEM',
    createdAt: new Date().toISOString(),
    usageCount: 0,
    status: 'ACTIVE'
  },

  // === 校园场景 ===
  {
    id: 'ref_school_playground',
    url: '/references/school_playground.jpg',
    name: '校园操场-儿童',
    type: ReferenceImageType.COMPREHENSIVE,
    metadata: {
      scene: '校园操场',
      pose: '奔跑游戏',
      mood: '活泼开朗',
      ageGroup: '6-12岁',
      gender: '中性',
      style: '学院风',
      tags: ['校园', '青春', '活力', '运动']
    },
    source: 'SYSTEM',
    createdAt: new Date().toISOString(),
    usageCount: 0,
    status: 'ACTIVE'
  },

  // === 特殊表情参考 ===
  {
    id: 'ref_expression_smile',
    url: '/references/expression_smile.jpg',
    name: '甜美微笑表情',
    type: ReferenceImageType.EXPRESSION,
    metadata: {
      mood: '甜美微笑',
      tags: ['微笑', '甜美', '亲和', '自然']
    },
    source: 'SYSTEM',
    createdAt: new Date().toISOString(),
    usageCount: 0,
    status: 'ACTIVE'
  },
  {
    id: 'ref_expression_shy',
    url: '/references/expression_shy.jpg',
    name: '害羞表情',
    type: ReferenceImageType.EXPRESSION,
    metadata: {
      mood: '害羞可爱',
      tags: ['害羞', '可爱', '腼腆', '萌']
    },
    source: 'SYSTEM',
    createdAt: new Date().toISOString(),
    usageCount: 0,
    status: 'ACTIVE'
  },

  // === 特殊动作参考 ===
  {
    id: 'ref_pose_jump',
    url: '/references/pose_jump.jpg',
    name: '跳跃动作',
    type: ReferenceImageType.POSE,
    metadata: {
      pose: '跳跃动作',
      mood: '活力四射',
      tags: ['跳跃', '动态', '活力', '动感']
    },
    source: 'SYSTEM',
    createdAt: new Date().toISOString(),
    usageCount: 0,
    status: 'ACTIVE'
  },
  {
    id: 'ref_pose_sitting_floor',
    url: '/references/pose_sitting_floor.jpg',
    name: '地坐姿势',
    type: ReferenceImageType.POSE,
    metadata: {
      pose: '地坐姿势',
      mood: '自然放松',
      tags: ['坐姿', '地面', '放松', '自然']
    },
    source: 'SYSTEM',
    createdAt: new Date().toISOString(),
    usageCount: 0,
    status: 'ACTIVE'
  }
];
