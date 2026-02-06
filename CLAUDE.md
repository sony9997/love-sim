# CLAUDE.md

本文档为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 项目概述

这是一个基于 Next.js 的恋爱模拟游戏，名为 "love-sim"，它使用 Google Gemini API 的 AI 集成为角色互动创造动态体验。游戏具有以角色驱动的叙事，包含四个主要角色，并支持双语（中文/英文）游戏体验。

## 架构

### 核心技术
- Next.js 16.0.3 (App Router)
- React 19.2.0
- TypeScript
- Zustand (状态管理)
- Tailwind CSS
- Framer Motion (动画)
- Google Gemini API (AI 驱动的角色回应)

### 游戏架构
- **游戏状态管理**: 使用 Zustand 存储 (`src/lib/store.ts`) 进行集中式状态管理
- **角色**: 在 `src/lib/game-data/characters.ts` 中定义，包含各自的个性、系统提示和关系
- **地点**: 游戏世界在 `src/lib/game-data/locations.ts` 中定义，包含交互元素
- **AI 服务**: 在 `src/lib/ai-service.ts` 中与 Google Gemini API 集成，用于生成动态角色回应
- **国际化**: 通过 `src/lib/i18n.ts` 提供内置中文/英文支持

### 主要组件
- `src/components/game/GameEngine.tsx`: 主游戏循环和状态管理
- `src/components/game/MainMenu.tsx`: 主菜单界面
- `src/components/game/HUD.tsx`: 头部显示界面，显示玩家统计数据和 UI 元素
- `src/components/game/MapNavigation.tsx`: 地点导航系统
- `src/components/game/DialogueSystem.tsx`: 处理角色对话和玩家输入

### 状态结构
- 玩家属性（智力、魅力、体能、金钱）
- 时间系统（天数、小时、星期几）
- 角色关系（好感度、状态）
- 角色状态（心情、目标、记忆）
- 游戏标记和进度跟踪
- 当前语言设置（en/zh）

## 开发命令

### 运行应用程序
```bash
npm run dev          # 启动开发服务器
npm run build        # 构建生产版本
npm run start        # 启动生产服务器
```

### 测试
```bash
npm run test:e2e              # 运行 Playwright 端到端测试
npm run test:e2e:headed       # 以有头模式运行端到端测试
npm run test:e2e:report       # 显示 Playwright 测试报告
```

### 代码检查
```bash
npm run lint         # 对 src 和 e2e 目录运行 ESLint
```

## 配置要求

### 环境变量
- `NEXT_PUBLIC_GEMINI_API_KEY` 或 `GEMINI_API_KEY`: AI 功能必需
- 存在于 `.env.local` 文件中

### 重要文件
- `package.json`: 包含所有依赖项和脚本
- `tsconfig.json`: TypeScript 配置及路径别名 (@/* → ./src/*)
- `next.config.ts`: Next.js 配置
- `playwright.config.ts`: 端到端测试配置

## 代码约定

### 文件结构
- 组件位于 `src/components/`
- 游戏数据位于 `src/lib/game-data/`
- 工具函数和存储位于 `src/lib/`
- Next.js 应用路由器页面位于 `src/app/`

### 导入方式
- 使用路径别名：`@/components/`, `@/lib/` 等
- 遵循 Next.js App Router 约定

### 游戏数据类型
- 角色 ID: `'su_qingqian' | 'chen_siyao' | 'ling_ruoyu' | 'lu_jiaxin'`
- 属性: `intelligence`, `charm`, `fitness`, `money`
- 时间: 天数/小时/星期几跟踪
- 关系: 好感度水平和状态跟踪

## AI 集成

游戏使用 Google 的 Gemini API 生成动态角色回应。每个角色都有详细的角色提示，定义其个性、说话风格和行为模式。AI 服务根据以下因素对交互进行上下文化：
- 当前时间和地点
- 与玩家的关系状态
- 角色心情和目标
- 玩家输入和游戏状态

## 国际化

游戏通过 i18n 系统同时支持中文和英文。文本以两种语言存储在 UI_TEXT 常量中，并可以使用 getTranslation 函数动态检索。组件应能够无缝处理两种语言。