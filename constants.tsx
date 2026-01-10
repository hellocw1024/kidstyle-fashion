
import React from 'react';
import { 
  Shirt, 
  User,
  LayoutDashboard,
  Settings,
  HelpCircle,
  History,
  CreditCard
} from 'lucide-react';
import { SystemConfig, Season } from './types';

export const INITIAL_CONFIG: SystemConfig = {
  categories: ['T恤', '衬衫', '连衣裙', '裤子', '外套', '连体衣', '卫衣', '毛衣'],
  styles: ['可爱风', '运动风', '学院风', '轻奢风', '国风', '森系', '街头潮流'],
  ageGroups: ['0-1岁', '1-3岁', '3-6岁', '6-12岁', '12-16岁'],
  genders: ['男', '女', '中性'],
  ethnicities: ['亚裔', '欧美', '非裔', '混血'],
  compositions: ['全身-展现整体', '半身-展现细节', '七分-动感构图', '特写-局部细节'],
  poses: ['静态站立', '可爱坐姿', '奔跑跳跃', '害羞微笑', '玩耍互动', '背影展示'],
  scenes: {
    [Season.SUMMER]: ['沙滩', '公园', '泳池', '家居卧室'],
    [Season.WINTER]: ['雪地', '室内游乐场', '校园', '欧式街道'],
    [Season.SPRING]: ['花园', '露营地', '奶油风客厅'],
    [Season.AUTUMN]: ['图书馆', '枫林', '美术馆']
  },
  productForms: ['平铺-微褶皱自然', '挂拍-无痕隐形', '3D建模-立体支撑'],
  productFocus: ['整体呈现', '面料质感特写', '工艺细节(领口/刺绣)'],
  productBackgrounds: ['纯白底-电商标准', '木纹底-温馨感', '大理石-轻奢感', '地毯绒面']
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

export const MODEL_LIBRARY: ModelEntry[] = [];
