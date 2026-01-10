# 🔧 Supabase 数据库设置指南

## 📋 前置准备

1. 访问 [https://supabase.com](https://supabase.com)
2. 使用 GitHub 账号登录（免费）
3. 创建新组织（如果还没有）

---

## 🚀 第一步：创建 Supabase 项目

### 1.1 创建新项目
1. 点击 **"New Project"** 按钮
2. 填写项目信息：
   - **Name**: `xiaohongyi` (或任意名称)
   - **Database Password**: 设置一个强密码（请记住！）
   - **Region**: 选择 `Southeast Asia (Singapore)` （离中国最近）
3. 点击 **"Create new project"**
4. 等待项目创建完成（约 2 分钟）

### 1.2 获取 API 密钥
项目创建后：
1. 点击左侧菜单的 **Settings** → **API**
2. 复制以下两个信息：
   - **Project URL**: 类似 `https://xxxxx.supabase.co`
   - **anon public key**: 一长串随机字符

### 1.3 配置到项目中
将这两个值填入 `.env.local` 文件：

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

---

## 📊 第二步：创建数据库表

### 2.1 打开 SQL Editor
1. 在 Supabase 项目中
2. 点击左侧菜单的 **SQL Editor**
3. 点击 **"New query"**

### 2.2 执行初始化脚本
1. 打开项目中的 `supabase-setup.sql` 文件
2. 复制全部内容
3. 粘贴到 Supabase 的 SQL Editor 中
4. 点击 **"Run"** 按钮（或按 `Ctrl+Enter`）

### 2.3 验证表创建
点击左侧菜单的 **Table Editor**，应该能看到以下表：
- ✅ `users`（用户表）
- ✅ `system_config`（系统配置表）
- ✅ `recharge_requests`（充值记录表）
- ✅ `images`（图片元数据表）

---

## 📁 第三步：创建图片存储桶

### 3.1 打开 Storage
1. 点击左侧菜单的 **Storage**
2. 点击 **"Create a new bucket"**

### 3.2 配置存储桶
填写以下信息：
- **Name**: `images`
- **Public bucket**: ❌ 取消勾选（私有存储）
- **File size limit**: 5MB
- **Allowed MIME types**: `image/png, image/jpeg, image/jpg, image/webp`

点击 **"Create bucket"**

### 3.3 设置访问权限
1. 点击刚创建的 `images` 存储桶
2. 切换到 **"Policies"** 标签
3. 点击 **"New policy"** → **"Create policy from template"**
4. 选择 **"Public read, private write"**
5. 点击 **"Use this template"**
6. 点击 **"Review"** → **"Create policy"**

---

## ✅ 第四步：测试连接

### 4.1 重启开发服务器
```bash
# 停止当前服务器（Ctrl+C）
# 重新启动
npm run dev
```

### 4.2 检查控制台
1. 打开浏览器控制台（F12）
2. 查看是否有 Supabase 连接错误
3. 如果看到 "Failed to fetch"，检查 API 密钥是否正确

---

## 🧪 第五步：测试数据库功能

### 测试 1：注册新用户
1. 打开应用
2. 使用任意 11 位手机号注册（如：13900000001）
3. 设置密码
4. 点击注册

**预期结果**：
- ✅ 注册成功
- ✅ 自动登录
- ✅ 可以在 Supabase 的 Table Editor 中看到新用户

### 测试 2：刷新页面
1. 刷新浏览器
2. 检查是否仍然登录

**预期结果**：
- ✅ 仍然保持登录状态（用户数据从数据库读取）

---

## 🎯 完成！

恭喜！您的项目现在已经集成了 Supabase 数据库！

### 已实现的功能：
- ✅ 用户数据永久保存在云端
- ✅ 多设备登录同步
- ✅ 刷新页面数据不丢失
- ✅ 数据库支持无限用户

### 下一步（可选）：
- 📁 上传图片到 Supabase Storage
- 🔒 添加更严格的安全策略
- 📊 查看数据库使用情况

---

## 💡 常见问题

### Q: 忘记数据库密码怎么办？
A: 删除项目重新创建，或者在 Settings → Database 中重置

### Q: 如何查看数据库使用情况？
A: 在 Project → Settings → Billing 中查看

### Q: 免费额度够用吗？
A: 完全够用！500MB 数据库 + 1GB 存储，支持数千用户

### Q: 数据会被删除吗？
A: 只要不删除项目，数据永久保存

### Q: 如何备份数据？
A: Supabase 自动每天备份，也可以手动导出

---

## 📞 需要帮助？

如果遇到问题，请提供：
1. 错误信息截图
2. 控制台日志
3. 操作步骤描述

我会帮您解决！😊
