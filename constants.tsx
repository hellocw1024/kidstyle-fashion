
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
import { SystemConfig } from './types';

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
    additionalGuidance: `ADDITIONAL DETAILS: {{customPrompt}}`
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
  }
];
