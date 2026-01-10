
export enum AppView {
  AUTH = 'AUTH',
  GENERATION = 'GENERATION',
  USER_CENTER = 'USER_CENTER',
  ADMIN = 'ADMIN',
  HELP = 'HELP',
  STATS = 'STATS',
  AUDIT = 'AUDIT',
  RESOURCES = 'RESOURCES',
  CONFIG = 'CONFIG'
}

export enum GenerationType {
  MODEL = 'MODEL',
  PRODUCT = 'PRODUCT'
}

export enum Season {
  SPRING = 'SPRING',
  SUMMER = 'SUMMER',
  AUTUMN = 'AUTUMN',
  WINTER = 'WINTER'
}

// 动态分类项接口
export interface SystemConfig {
  categories: string[];
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
  category: string;
  season: Season;
  date: string;
  tags: string[];
  thumbnail?: string; // 缩略图（用于快速加载）
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
