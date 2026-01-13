
export enum AppView {
  AUTH = 'AUTH',
  GENERATION = 'GENERATION',
  USER_CENTER = 'USER_CENTER',
  ADMIN = 'ADMIN',
  HELP = 'HELP',
  STATS = 'STATS',
  AUDIT = 'AUDIT',
  RESOURCES = 'RESOURCES',
  CONFIG = 'CONFIG',
  USERS = 'USERS'  // 用户管理
}

export enum GenerationType {
  MODEL = 'MODEL',
  PRODUCT = 'PRODUCT'
}

// 动态分类项接口
export interface SystemConfig {
  styles: string[];
  ageGroups: string[];
  genders: string[];
  ethnicities: string[]; // 国籍/肤色
  compositions: string[]; // 构图景别
  poses: string[]; // 姿势情绪
  scenes: string[]; // 场景列表（AI会根据服装自动适配）
  productForms: string[]; // 呈现形式 (平铺/挂拍/3D)
  productFocus: string[]; // 细节聚焦
  productBackgrounds: string[]; // 背景材质
  // AI 提示词模板
  promptTemplates: {
    mainPrompt: string; // 主提示词模板
    modelModePrompt: string; // 真人模特模式提示词
    productModePrompt: string; // 纯服装展示模式提示词
    sceneGuidance: string; // 场景指导
    qualityGuidance: string; // 画质指导
    additionalGuidance: string; // 额外指导
  };
}

export interface User {
  id: string;
  phone: string;
  password?: string;
  quota: number;
  role: 'USER' | 'ADMIN';
  favorites?: string[]; // 收藏的资源 ID 列表
}

export interface ImageResource {
  id: string;
  url: string;
  type: 'UPLOAD' | 'GENERATE';
  date: string;
  tags: string[];
  thumbnail?: string; // 缩略图（用于快速加载）
  modelName?: string; // 使用的 AI 模型名称
}

export interface RechargeRequest {
  id: string;
  userId: string;
  amount: number;
  quota: number;
  screenshot: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  date: string;
}
