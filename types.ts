

export enum AppView {
  AUTH = 'AUTH',
  INSPIRATION = 'INSPIRATION',
  GENERATION = 'GENERATION',
  USER_CENTER = 'USER_CENTER',
  ADMIN = 'ADMIN',
  HELP = 'HELP',
  STATS = 'STATS',
  AUDIT = 'AUDIT',
  RESOURCES = 'RESOURCES',
  CONFIG = 'CONFIG',
  USERS = 'USERS',  // 用户管理
  PROMPTS = 'PROMPTS'  // 提示词管理
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
  poses: string[]; // 姿势动作
  emotions: string[]; // 情绪表情
  scenes: string[]; // 场景列表（AI会根据服装自动适配）
  productForms: string[]; // 呈现形式 (平铺/挂拍/3D)
  productFocus: string[]; // 细节聚焦
  productBackgrounds: string[]; // 背景材质
  ratios: string[]; // 比例选项
  qualities: string[]; // 质量选项
  // AI 提示词模板
  promptTemplates: {
    mainPrompt: string; // 主提示词模板
    modelModePrompt: string; // 真人模特模式提示词
    productModePrompt: string; // 纯服装展示模式提示词
    sceneGuidance: string; // 场景指导
    qualityGuidance: string; // 画质指导
    additionalGuidance: string; // 额外指导
    // 🔥 自动模式指令配置
    autoModeInstructions: {
      gender: string;
      ageGroup: string;
      ethnicity: string;
      scene: string;
    };
  };

  // 🔥 参考图提示词模板
  referencePromptTemplates: {
    enabled: boolean; // 是否启用参考图功能
    mainGuidance: string; // 主要指导（支持占位符：{{mode}}, {{elements}}）
    strictMode: string; // 严格模式描述
    flexibleMode: string; // 灵活模式描述
    elementExtraction: string; // 元素提取指导（支持占位符：{{elements}}）
    criticalNotice: string; // 关键提示语
    // 🔥 提取关键词配置
    extractionKeywords: {
      background: string;
      pose: string;
      expression: string;
      lighting: string;
      composition: string;
      all: string;
    };
  };



  // 🔥 一键生成预设配置
  oneClickPresets: {
    pureClothingVariations: Array<{
      background: string;
      angle: string;
      style: string;
      ratio: string;
    }>;
    autoModeScenes: string[];
    autoModeStyles: string[];
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
  displayType?: DisplayType; // 🔥 新增：图片展示类型
  date: string;
  tags: string[];
  thumbnail?: string; // 缩略图（用于快速加载）
  modelName?: string; // 使用的 AI 模型名称
}

// 🔥 双模式类型定义
export type DisplayType = 'model' | 'pure';

// 🔥 模特展示参数
export interface ModelDisplayParams {
  ratio: '1:1' | '3:4' | '16:9';
  quality: '1K' | '2K' | '4K';
  model: string; // Model ID from MODEL_LIBRARY
  scene: string;
  style: string;
  pose?: string;
  emotion?: string;
  gender?: string;
  ageGroup?: string;
  ethnicity?: string;
}

// 🔥 纯服装展示参数
export interface PureClothingParams {
  ratio: '1:1' | '3:4' | '16:9';
  quality: '1K' | '2K' | '4K';
  background: string; // 从 config.productBackgrounds
  angle: string; // 从 config.productForms
  style: string; // 简约/时尚/复古/艺术
  focus?: string; // 从 config.productFocus
}

// 🔥 统一生成配置（用于新架构）
export interface UnifiedGenerationConfig {
  displayType: DisplayType;
  clothingImage: File;
  params: ModelDisplayParams | PureClothingParams;
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

// 参考图类型
export enum ReferenceImageType {
  SCENE = 'SCENE',           // 场景参考（背景、环境、光影）
  POSE = 'POSE',             // 动作参考（姿势、构图）
  EXPRESSION = 'EXPRESSION', // 表情参考（情绪、面部表情）
  COMPREHENSIVE = 'COMPREHENSIVE' // 综合参考（全部元素）
}

// 参考图条目
export interface ReferenceImage {
  id: string;
  url: string;               // 图片URL（base64或远程URL）
  thumbnail?: string;        // 缩略图
  name: string;              // 图片名称
  type: ReferenceImageType;  // 参考类型

  // 元数据（便于搜索和筛选）
  metadata: {
    scene?: string;          // 场景：公园、海滩、室内...
    pose?: string;           // 动作：站立、坐着、跳跃...
    mood?: string;           // 情绪：开心、害羞、酷...
    ageGroup?: string;       // 适用年龄：3-6岁、6-12岁...
    gender?: string;         // 性别：男、女
    style?: string;          // 风格：可爱、运动、学院...
    tags?: string[];         // 自定义标签
  };

  source: 'SYSTEM' | 'USER'; // 来源：系统内置 or 用户上传
  createdBy?: string;        // 创建者ID（用户上传时）
  createdAt: string;
  usageCount: number;        // 使用次数
  status: 'ACTIVE' | 'INACTIVE';
  category?: 'model' | 'product'; // 🔥 Added to match Admin panel classification
}

// 参考图库条目
export interface ReferenceImageEntry {
  id: string;
  url: string;
  type: 'model' | 'product';  // model: 模特展示图, product: 纯服装展示图
  tags?: string[];
  name?: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'ACTIVE' | 'INACTIVE';
}

// 参考图使用配置
export interface ReferenceConfig {
  enabled: boolean;
  referenceId?: string;      // 选择的参考图ID
  referenceMode: 'STRICT' | 'FLEXIBLE'; // STRICT: 严格模仿, FLEXIBLE: 灵活参考

  // 提取哪些元素（多选）
  extractElements: {
    background: boolean;     // 提取背景
    pose: boolean;           // 提取动作
    expression: boolean;     // 提取表情
    lighting: boolean;       // 提取光影
    composition: boolean;    // 提取构图
  };

  customInstruction?: string; // 额外说明：例如"保留参考图的背景，但改用站立姿势"
}

// 生成模板
export interface GenerationTemplate {
  id: string;
  name: string;                    // 模板名称：如"韩系春款-3岁女童"
  description?: string;            // 模板描述
  userId: string;                  // 创建者ID
  createdAt: string;
  updatedAt: string;
  useCount: number;                // 使用次数

  // 配置参数
  config: {
    type: GenerationType;          // MODEL | PRODUCT
    style: string;
    quality: string;
    aspectRatio: string;
    scene?: string;

    // MODEL模式专用
    gender?: string;
    ageGroup?: string;
    ethnicity?: string;
    pose?: string;
    composition?: string;

    // PRODUCT模式专用
    productForm?: string;
    productFocus?: string;
    productBackground?: string;

    customPrompt?: string;

    // 模特参考（可选）
    modelRef?: {
      type: 'library' | 'custom';   // 来自模特库 or 自定义上传
      modelId?: string;             // 如果是library类型
      imageUrl?: string;            // 如果是custom类型（存储base64）
    };
  };

  // 预览图（可选）：该模板最近一次生成的效果图
  previewImage?: string;
}

// 🎨 "做同款"功能数据
export interface RemakeData {
  referenceImage: ImageResource;  // 参考图
  clothingImageFile: File;        // 用户上传的服装图片文件
  options: {
    scene: boolean;     // 场景复刻
    pose: boolean;      // 姿态复刻
    complete: boolean;  // 完全复刻
  };
  analysis: {
    scene?: {
      environment: string;
      background: string;
      lighting: string;
      atmosphere: string;
    };
    pose?: {
      bodyPose: string;
      facialExpression: string;
      handGesture: string;
      headAngle: string;
    };
    complete?: {
      scene: any;
      pose: any;
      cameraAngle: string;
      composition: string;
      overallStyle: string;
    };
  };
  prompt: string;  // 构建好的 Prompt
}
