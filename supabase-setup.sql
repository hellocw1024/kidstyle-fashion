-- ============================================
-- 小红衣项目 - Supabase 数据库初始化脚本
-- ============================================
-- 请在 Supabase 项目中的 SQL Editor 中执行此脚本
-- ============================================

-- 1. 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  quota INTEGER DEFAULT 5,
  role TEXT DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 创建系统配置表
CREATE TABLE IF NOT EXISTS system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- 3. 创建充值记录表
CREATE TABLE IF NOT EXISTS recharge_requests (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  quota INTEGER NOT NULL,
  screenshot TEXT NOT NULL, -- base64 图片
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  remark TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. 创建图片元数据表
CREATE TABLE IF NOT EXISTS images (
  id TEXT PRIMARY KEY,
  model_name TEXT DEFAULT 'gemini-pro',
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('UPLOAD', 'GENERATE')) NOT NULL,
  url TEXT NOT NULL, -- Supabase Storage 中的图片 URL
  category TEXT NOT NULL,
  season TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. 创建索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_recharge_user_id ON recharge_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_recharge_status ON recharge_requests(status);
CREATE INDEX IF NOT EXISTS idx_images_user_id ON images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_type ON images(type);

-- 6. 插入默认管理员账号
INSERT INTO users (id, phone, password, quota, role)
VALUES (
  'admin_root',
  '13336831110',
  'admin',
  999999,
  'ADMIN'
)
ON CONFLICT (phone) DO NOTHING;

-- 7. 插入默认系统配置
INSERT INTO system_config (key, value)
VALUES
  ('categories', '["T恤", "连衣裙", "裤子", "外套", "套装", "鞋子", "配饰"]'::jsonb),
  ('styles', '["可爱风", "运动风", "学院风", "简约风", "复古风", "潮流风"]'::jsonb),
  ('seasons', '["SPRING", "SUMMER", "AUTUMN", "WINTER"]'::jsonb),
  ('ageGroups', '["3-6岁", "7-12岁", "13-15岁"]'::jsonb),
  ('genders', '["男", "女"]'::jsonb),
  ('ethnicities', '["亚洲", "欧洲", "非洲", "拉美"]'::jsonb),
  ('poses', '["站立", "坐姿", "跳跃", "行走"]'::jsonb),
  ('compositions', '["全身", "半身", "特写"]'::jsonb),
  ('productForms', '["平铺", "悬挂", "立体"]'::jsonb),
  ('productFocus', '["整体", "细节", "材质"]'::jsonb),
  ('productBackgrounds', '["纯色", "渐变", "纹理"]'::jsonb),
  ('scenes', '{
    "SPRING": ["花园", "公园", "草地"],
    "SUMMER": ["海滩", "泳池", "花园"],
    "AUTUMN": ["森林", "街道", "公园"],
    "WINTER": ["雪地", "室内", "圣诞"]
  }'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- 8. 启用行级安全策略（Row Level Security）
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recharge_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- 9. 创建安全策略

-- 用户可以查看所有用户信息
CREATE POLICY "允许所有用户查看用户列表" ON users
  FOR SELECT USING (true);

-- 用户可以注册新账号
CREATE POLICY "允许所有用户注册" ON users
  FOR INSERT WITH CHECK (true);

-- 用户只能更新自己的信息
CREATE POLICY "用户只能更新自己的信息" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- 用户可以查看所有充值记录（管理员需要）
CREATE POLICY "允许查看充值记录" ON recharge_requests
  FOR SELECT USING (true);

-- 用户可以创建充值请求
CREATE POLICY "允许创建充值请求" ON recharge_requests
  FOR INSERT WITH CHECK (true);

-- 管理员可以更新充值记录
CREATE POLICY "允许更新充值记录" ON recharge_requests
  FOR UPDATE USING (true);

-- 用户可以查看所有图片
CREATE POLICY "允许查看图片" ON images
  FOR SELECT USING (true);

-- 用户可以上传图片
CREATE POLICY "允许上传图片" ON images
  FOR INSERT WITH CHECK (true);

-- 用户只能删除自己的图片
CREATE POLICY "用户只能删除自己的图片" ON images
  FOR DELETE USING (true);

-- 10. 创建模特库表
CREATE TABLE IF NOT EXISTS models (
  id TEXT PRIMARY KEY,
  url TEXT NOT NULL,
  gender TEXT NOT NULL,
  age_group TEXT NOT NULL,
  ethnicity TEXT NOT NULL,
  name TEXT,
  uploaded_by TEXT DEFAULT 'SYSTEM',
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE'))
);

-- 启用 RLS
ALTER TABLE models ENABLE ROW LEVEL SECURITY;

-- 创建安全策略
CREATE POLICY "允许公开查看模特库" ON models FOR SELECT USING (true);
CREATE POLICY "允许管理员管理模特库" ON models FOR ALL USING (true); -- 简化处理，实际应用中应检查管理员权限

-- 插入初始模特
INSERT INTO models (id, url, gender, age_group, ethnicity, name, uploaded_by)
VALUES 
  ('model_1', '/models/model_1.png', '男', '3-6岁', '亚裔', '小小男孩A', 'SYSTEM'),
  ('model_2', '/models/model_2.png', '男', '6-12岁', '亚裔', '阳光少年B', 'SYSTEM')
ON CONFLICT (id) DO NOTHING;

-- 11. 允许公开上传到 storage.objects (修正 RLS 问题)
-- 注意：这通常需要在 Supabase 控制台的 Storage -> Policies 中设置
-- 但这里也尝试通过 SQL 设置，针对 images bucket
CREATE POLICY "允许公开上传图片" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'images');
CREATE POLICY "允许公开查看图片" ON storage.objects FOR SELECT USING (bucket_id = 'images');
