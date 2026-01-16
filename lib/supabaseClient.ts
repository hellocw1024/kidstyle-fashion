import { createClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase 配置
// ⚠️ Temporary Debug: Hardcode credentials to ensure we are connecting to the correct DB
// const supabaseUrl = process.env.VITE_SUPABASE_URL;
// const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabaseUrl = 'https://cqjskmeodznouiixdrok.supabase.co';
const supabaseAnonKey = 'sb_publishable_K26cSK7CSEV61FS56ea8mw_eUN7O92F';

// 检查配置是否完整
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 配置缺失！');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

// 数据库表类型定义
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string;
          password: string;
          quota: number;
          role: 'USER' | 'ADMIN';
          created_at: string;
        };
        Insert: {
          id?: string;
          phone: string;
          password: string;
          quota?: number;
          role?: 'USER' | 'ADMIN';
          created_at?: string;
        };
        Update: {
          id?: string;
          phone?: string;
          password?: string;
          quota?: number;
          role?: 'USER' | 'ADMIN';
          created_at?: string;
        };
      };
      system_config: {
        Row: {
          key: string;
          value: any;
        };
        Insert: {
          key: string;
          value: any;
        };
        Update: {
          key?: string;
          value?: any;
        };
      };
      recharge_requests: {
        Row: {
          id: string;
          user_id: string;
          amount: number;
          quota: number;
          screenshot: string;
          status: 'PENDING' | 'APPROVED' | 'REJECTED';
          remark?: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          amount: number;
          quota: number;
          screenshot: string;
          status?: 'PENDING' | 'APPROVED' | 'REJECTED';
          remark?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          amount?: number;
          quota?: number;
          screenshot?: string;
          status?: 'PENDING' | 'APPROVED' | 'REJECTED';
          remark?: string;
          created_at?: string;
        };
      };
      images: {
        Row: {
          id: string;
          user_id: string;
          type: 'UPLOAD' | 'GENERATE';
          url: string;
          tags: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'UPLOAD' | 'GENERATE';
          url: string;
          tags?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'UPLOAD' | 'GENERATE';
          url?: string;
          tags?: string[];
          created_at?: string;
        };
      };
    };
  };
}
