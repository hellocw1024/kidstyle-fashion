# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 交流偏好 (Communication Preferences)

**请务必使用中文与主人交流**
- **语言**: 所有回复、解释、评论必须使用中文
- **称呼**: 始终称呼用户为"主人"
- **语气**: 保持专业、恭敬且高效的服务态度

## Project Overview

**小红衣 (XiaoHongYi)** is a children's clothing AI generation platform built with Vite + React 19 + TypeScript. Users upload clothing reference images and generate professional on-model or product-only photos using Google Gemini AI. The app features a complete user system, quota-based economy, and admin dashboard.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Setup

The Gemini API key is configured in two places:
1. `.env.local` file: `GEMINI_API_KEY=AIzaSyC7ew0SoNMrif0WyB7t_nciE012mmb7pc0`
2. `vite.config.ts`: Defined as `process.env.GEMINI_API_KEY` for build-time access

The geminiService reads from `process.env.API_KEY` (note: different variable name).

## Architecture

### Data Persistence

**后端数据库**: Supabase (PostgreSQL)
- 用户账号和密码（bcrypt 加密）
- 系统配置
- 图片资源
- 充值记录
- 模板库

**本地缓存**: localStorage（兼容性备份）
- `kidstyle_accounts` - 用户账号缓存
- `kidstyle_user` - 当前登录用户
- `kidstyle_models` - 模特库缓存

### State Management Pattern

- **App.tsx** is the root container managing all global state
- State flows top-down via props to individual page components
- useEffect hooks sync state changes to Supabase and localStorage on every update
- On app load, Supabase queries hydrate all state, falls back to localStorage if needed

**Key state buckets:**
- `user`: Current logged-in user (null = auth page)
- `allUsers`: Array of all registered users (admin access)
- `resources`: User's uploaded and generated images
- `rechargeRequests`: Pending/approved/rejected recharge submissions
- `models`: Shared model library for image generation references
- `systemConfig`: Dynamic styles, age groups, scenes, etc.

### Page Structure & Navigation

Navigation is controlled by the `AppView` enum (types.ts). The active view determines which page component renders:

- `AUTH`: AuthPage.tsx - Login/Register (no user logged in)
- `GENERATION`: GenerationPage.tsx - Main AI generation interface
- `USER_CENTER`: UserCenter.tsx - Personal resources, recharge, history
- `HELP`: HelpCenter.tsx - FAQ and support
- Admin views (only for ADMIN role):
  - `STATS`: AdminPage.tsx - Dashboard with metrics
  - `AUDIT`: AdminPage.tsx - Recharge approval workflow
  - `RESOURCES`: AdminPage.tsx - Browse all user resources
  - `CONFIG`: AdminPage.tsx - Modify system styles/scenes

**Header component** renders navigation based on user role:
- Regular users: AI生成, 个人中心, 帮助中心
- Admins: 运营看板, 充值审核, 资源管理, 深度配置

### AI Image Generation (GenerationPage.tsx)

The generation flow is a **multi-step wizard**:

1. **Step 1**: Upload clothing reference images (up to 5)
2. **Step 2**: Configure generation parameters:
   - Style (from config)
   - Type: MODEL (on-model) vs PRODUCT (product-only)
   - If MODEL: age group, gender, ethnicity, pose, composition, select/upload model reference
   - If PRODUCT: form (flat/hang/3D), focus, background material
   - Scene selection
   - Custom prompt input
   - Quality (1K/2K/4K) and aspect ratio
3. **Step 3**: Review settings and generate

**Generation logic:**
- `generateClothingImage()` in services/geminiService.ts constructs prompt and calls Gemini API
- Model selection: Uses `gemini-3-pro-image-preview` for 2K/4K, `gemini-2.5-flash-image` for 1K
- Base64 image handling: Uploaded clothing images and optional model reference sent as inlineData
- Quota deduction: 1K=1, 2K=2, 4K=5 quota
- Generated image saved to resources and displayed in result view

### Admin Configuration System

The admin `CONFIG` tab allows **runtime modification of system dropdowns** without code changes:

- `styles`: Visual styles (可爱风,运动风, etc.)
- `ageGroups`: Age ranges for model generation
- `scenes`: Backgrounds (string[])
- `productForms`, `productFocus`, `productBackgrounds`: Product-only options

Changes immediately affect user generation forms. Config persisted to localStorage.

### Model Library Management

Admins can upload and curate a **library of child model reference images** via the `RESOURCES` tab or during generation:

- Models have metadata: gender, age group, ethnicity, name
- Stored in `models` state with object URLs
- Users can filter/select from library or upload custom model image
- Used as visual reference for on-model generations

**Note**: Model images stored as blob URLs (URL.createObjectURL) - will be lost on page refresh. For persistence, consider storing base64 in localStorage or implementing backend storage.

## Quota & Recharge System

**Quota costs:** Quality-based (1K=1, 2K=2, 4K=5)

**Recharge workflow:**
1. User submits recharge request with amount and screenshot (UserCenter)
2. Creates `RechargeRequest` with status `PENDING`
3. Admin reviews in `AUDIT` tab, views screenshot
4. Admin APPROVES → user's quota increased by request.quota amount
5. Admin REJECTS → no change, can add rejection remark

**Recharge plans** (constants.tsx):
- Fixed amounts: ¥10/20/50/100/200/500 → quota 1:1
- Bonuses: First charge +2, ¥500 gets +80 bonus

## TypeScript Types

**Core types** (types.ts):
- `SystemConfig`: All configurable dropdown arrays
- `User`: id, phone, password (optional), quota, role (USER|ADMIN)
- `ImageResource`: id, url, type (UPLOAD|GENERATE), date, tags
- `RechargeRequest`: id, userId, amount, quota, screenshot (base64), status, date

**Default admin account** (auto-created if missing):
- Phone: 13336831110
- Password: admin
- Role: ADMIN
- Quota: 999999

## Component Patterns

- All components are **functional components with TypeScript**
- No external state management library (useState/useContext only)
- Inline class names using **utility classes** (see Tailwind CSS patterns in components)
- Icons from **lucide-react** library
- File uploads use FileReader API for base64 conversion
- Conditional rendering heavily used for multi-step flows and admin tabs

## Common Tasks

**Adding a new configurable option:**
1. Add key to `SystemConfig` interface (types.ts)
2. Add default array to `INITIAL_CONFIG` (constants.tsx)
3. Update AdminPage CONFIG tab to render editing UI for that key
4. Use in generation prompt construction (geminiService.ts or GenerationPage.tsx)

**Creating a new page:**
1. Create component in `pages/` directory
2. Add corresponding `AppView` enum value
3. Add navigation item to `NAV_ITEMS` or `ADMIN_NAV_ITEMS` (constants.tsx)
4. Add route in App.tsx switch statement

**Modifying generation prompt:**
- Edit `generateClothingImage()` function in services/geminiService.ts
- Prompt construction uses template literals with params
- Consider both MODEL and PRODUCT generation modes

## Important Constraints

- **Backend**: Supabase PostgreSQL database for persistent storage
- **Authentication**: Passwords hashed with bcrypt (10 salt rounds)
- **Admin account**: Default credentials (App.tsx line 36-43)
  - Phone: 13336831110
  - Password: admin
  - Role: ADMIN
  - Quota: 999999

## 开发历史 (Development History)

### 2026-01-10 - AI 提示词管理系统 ✅
**功能**: 管理员可自定义 AI 生成提示词模板
- 在 `SystemConfig` 中添加 `promptTemplates` 字段
- 实现 6 个提示词模板组件：
  - `mainPrompt` - 主提示词（任务描述、自动识别）
  - `modelModePrompt` - 真人模特拍摄模式
  - `productModePrompt` - 纯服装展示模式
  - `sceneGuidance` - 场景指导
  - `qualityGuidance` - 画质指导
  - `additionalGuidance` - 额外自定义信息
- 管理后台"深度配置"页面添加提示词编辑界面
- 支持占位符格式：`{{变量名}}`

**修改文件**:
- `types.ts` - 添加 promptTemplates 类型定义
- `constants.tsx` - 添加默认提示词模板
- `services/geminiService.ts` - 实现 `buildPrompt()` 函数
- `pages/AdminPage.tsx` - 添加提示词管理 UI
- `pages/GenerationPage.tsx` - 集成自定义提示词

### 2026-01-09 - Supabase 数据库集成 ✅
**功能**: 从 localStorage 迁移到 Supabase 后端
- 创建 Supabase 项目和数据库表
- 实现用户认证（bcrypt 密码加密）
- 实现系统配置的 CRUD 操作
- 实现图片资源管理
- 实现充值记录管理
- 添加本地缓存兼容性

**数据库表**:
- `users` - 用户账号（id, phone, password, quota, role, created_at）
- `system_config` - 系统配置键值对（key, value）
- `images` - 图片资源（id, user_id, type, url, tags, created_at）
- `recharge_requests` - 充值记录（id, user_id, amount, quota, screenshot, status, remark, created_at）

**修改文件**:
- `lib/supabaseClient.ts` - Supabase 客户端配置
- `lib/database.ts` - 所有数据库操作函数
- `lib/password.ts` - bcrypt 密码哈希和验证
- `App.tsx` - 集成 Supabase 数据加载

### 2026-01-08 - 项目初始化 ✅
**功能**: 基础功能实现
- 用户认证系统（登录/注册）
- AI 图片生成流程（3步向导）
- 真人模特模式 & 纯服装模式
- 配额系统
- 充值审核流程
- 管理员后台（4个标签页）
- 系统配置管理

## 最近工作 (Recent Work)

**最后更新**: 2026-01-10
**当前版本**: v0.0.0
**开发状态**: 活跃开发中

### 待完成功能 (TODO)
- [ ] 图片资源缩略图优化
- [ ] 批量图片生成功能
- [ ] 生成历史记录和统计
- [ ] 用户反馈系统
- [ ] 移动端适配优化

### 已知问题 (Known Issues)
- 模特库图片使用 Blob URL，刷新后丢失（需实现持久化）
- 首次加载时可能需要初始化 Supabase 配置

## 如何快速恢复上下文 (Quick Context Recovery)

**重要：本项目使用 iCloud 同步跨设备上下文**

### 上下文文件位置（会被 iCloud 同步）
```
小红衣/.claude-context/session-summary.json  ⭐ 会话摘要（快速恢复）
小红衣/CLAUDE.md                             - 技术文档和开发指南
小红衣/DEVELOPMENT_LOG.md                    - 详细开发日志
```

### 每次新对话开始时，执行以下步骤：

**方法 1：自动恢复（推荐）**
```
请先读取 .claude-context/session-summary.json
```

**方法 2：手动恢复**
1. **快速恢复**: 阅读 `.claude-context/session-summary.json`
2. **项目概览**: 阅读本文件的 "Project Overview" 部分
3. **最近工作**: 查看 "最近工作" 和 "开发历史" 了解最新进展
4. **详细日志**: 阅读 `DEVELOPMENT_LOG.md` 的最新记录
5. **启动服务**: 运行 `npm run dev` 确保开发环境正常

**常用命令**:
```bash
cd ~/Desktop/小红衣
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
```

**关键账号**:
- 管理员: 13336831110 / admin

### 跨设备开发说明

由于项目文件夹存储在 iCloud 中：
- ✅ **代码自动同步**: 所有源代码文件
- ✅ **配置自动同步**: `.claude/settings.local.json`
- ✅ **上下文自动同步**: `.claude-context/session-summary.json`
- ✅ **文档自动同步**: `CLAUDE.md`, `DEVELOPMENT_LOG.md`

**在不同设备上继续开发**：
1. 等待 iCloud 同步完成
2. 打开新的 Claude Code 会话
3. 说："请读取 `.claude-context/session-summary.json` 恢复上下文"
4. 继续开发！
