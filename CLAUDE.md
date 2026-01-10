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

### State Management Pattern

This is a **single-page React application** using **localStorage for all data persistence**. No backend server or database.

- **App.tsx** is the root container managing all global state
- State flows top-down via props to individual page components
- useEffect hooks sync state changes to localStorage on every update
- On app load, localStorage hydrates all state (user, resources, recharge requests, models, config)

**Key state buckets:**
- `user`: Current logged-in user (null = auth page)
- `allUsers`: Array of all registered users (admin access)
- `resources`: User's uploaded and generated images
- `rechargeRequests`: Pending/approved/rejected recharge submissions
- `models`: Shared model library for image generation references
- `systemConfig`: Dynamic categories, styles, age groups, scenes, etc.

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
  - `CONFIG`: AdminPage.tsx - Modify system categories/styles/scenes

**Header component** renders navigation based on user role:
- Regular users: AI生成, 个人中心, 帮助中心
- Admins: 运营看板, 充值审核, 资源管理, 深度配置

### AI Image Generation (GenerationPage.tsx)

The generation flow is a **multi-step wizard**:

1. **Step 1**: Upload clothing reference images (up to 5)
2. **Step 2**: Configure generation parameters:
   - Category, Season, Style (from config)
   - Type: MODEL (on-model) vs PRODUCT (product-only)
   - If MODEL: age group, gender, ethnicity, pose, composition, select/upload model reference
   - If PRODUCT: form (flat/hang/3D), focus, background material
   - Scene selection (dynamically filtered by season)
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

- `categories`: Clothing types (T恤, 连衣裙, etc.)
- `styles`: Visual styles (可爱风, 运动风, etc.)
- `ageGroups`: Age ranges for model generation
- `scenes`: Season-specific backgrounds (Record<Season, string[]>)
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
- `AppView`: Navigation enum
- `GenerationType`: MODEL | PRODUCT
- `Season`: SPRING | SUMMER | AUTUMN | WINTER
- `SystemConfig`: All configurable dropdown arrays
- `User`: id, phone, password (optional), quota, role (USER|ADMIN)
- `ImageResource`: id, url, type (UPLOAD|GENERATE), category, season, date, tags
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

- **No backend**: All data in localStorage, cleared on browser clear
- **No authentication security**: Passwords stored in plain text, suitable for demo/prototype only
- **Model image persistence**: Blob URLs don't persist across sessions
- **Admin account**: Default credentials hardcoded (App.tsx line 36-43)
- **API key**: Exposed in vite.config.ts and .env.local
