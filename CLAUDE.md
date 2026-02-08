# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 快速开始

**Love Sim** 是一个基于 Next.js 16 的恋爱模拟游戏（视觉小说风格），采用 Google Gemini AI 驱动的对话系统。

### 开发命令

| 命令                        | 描述                          |
| --------------------------- | ----------------------------- |
| `npm run dev`             | 启动端口 3000 的开发服务器    |
| `npm run build`           | 构建生产版本                  |
| `npm run start`           | 启动生产服务器                |
| `npm run lint`            | 对 src 和 e2e 目录运行 ESLint |
| `npm run test:e2e`        | 运行 Playwright 测试          |
| `npm run test:e2e:headed` | 以可见浏览器模式运行 E2E 测试 |
| `npm run test:e2e:report` | 显示 Playwright 测试报告      |

### 环境配置

创建 `.env.local` 文件并配置：

```
NEXT_PUBLIC_GEMINI_API_KEY=你的_google_gemini_api_key
```

## 项目架构

### 技术栈

- **框架**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **状态管理**: Zustand 5.0.8
- **样式**: Tailwind CSS 4
- **动画**: Framer Motion 12.23.24
- **测试**: Playwright 1.57.0
- **AI**: Google Gemini 2.5 Flash

### 代码结构

```
src/
├── app/                 # Next.js App Router
│   ├── page.tsx         # GameEngine 入口点
│   ├── layout.tsx       # 根布局
│   └── globals.css      # Tailwind 样式
├── components/game/     # 游戏组件
│   ├── GameEngine.tsx   # 主状态控制器
│   ├── MainMenu.tsx     # 菜单界面
│   ├── HUD.tsx          # 属性/时间显示
│   ├── MapNavigation.tsx
│   └── DialogueSystem.tsx
└── lib/
    ├── game-data/       # 游戏逻辑数据
    │   ├── types.ts     # TypeScript 类型定义
    │   ├── characters.ts
    │   ├── locations.ts
    │   └── scripts.ts
    ├── store.ts         # Zustand 状态
    ├── ai-service.ts    # Gemini 集成
    └── i18n.ts          # 国际化
```

### 核心模式

- **状态不可变性**: 始终创建新对象，禁止直接修改
- **文件小型化**: 组件保持在 200-400 行，最多不超过 800 行
- **严格 TypeScript**: 启用 `noImplicitAny`、`strictNullChecks`，路径别名 `@/*`
- **组件专注性**: 每个组件应易于理解

### 游戏状态 (Zustand)

`useGameStore` 管理：

- 玩家：姓名、属性（智力、魅力、体能、金钱）、位置
- 时间：天数、小时（0-23）、星期（周一-周日）
- 人物关系：每位女主角的好感度、状态、已触发事件
- AI 角色状态：情绪、目标、记忆
- 游戏标记和语言设置（'en' 或 'zh'）

### 对话系统

支持预设脚本和动态 AI 交互。动作类型包括：dialogue（对话）、choice（选择）、jump（跳转）、effect（效果，如 set_flag、mod_stat、mod_affection、move、advance_time）、background（背景）、input（输入）、end（结束）。

### 国际化

在主菜单中切换英语和简体中文。所有 UI 文本定义在 `lib/i18n.ts` 中。
