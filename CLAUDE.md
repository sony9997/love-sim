# CLAUDE.md

本文件为 Claude Code (claude.ai/code) 在此代码库中工作时提供指导。

## 快速开始

**Love Sim** 是一个恋爱模拟游戏（视觉小说风格），基于 Next.js 16 构建，由 Google Gemini AI 驱动动态角色对话。

### 开发命令

| 命令                      | 描述                                 |
|--------------------------|--------------------------------------|
| `npm run dev`            | 启动端口 3000 的开发服务器           |
| `npm run build`          | 构建生产版本                         |
| `npm run start`          | 启动生产服务器                       |
| `npm run lint`           | 对 src 和 e2e 目录运行 ESLint        |
| `npm run test:e2e`       | 运行 Playwright 测试（无头模式）     |
| `npm run test:e2e:headed`| 运行 Playwright 测试（可见浏览器）   |
| `npm run test:e2e:report`| 打开 Playwright 测试报告             |
| `npx tsc --noEmit`       | 运行 TypeScript 类型检查             |

### 环境配置

创建 `.env.local` 文件：

```
NEXT_PUBLIC_GEMINI_API_KEY=your_google_gemini_api_key
```

API 密钥也支持从 `GEMINI_API_KEY` 环境变量读取作为备选。

## 项目架构

### 技术栈

- **框架**: Next.js 16.0.3 (App Router)
- **React**: 19.2.0
- **状态管理**: Zustand 5.0.8
- **样式**: Tailwind CSS 4
- **动画**: Framer Motion 12.23.24
- **测试**: Playwright 1.57.0
- **AI**: Google Gemini 2.5 Flash

### 核心架构

游戏采用**基于组件的架构**，配以集中式状态管理：

```
src/
├── app/
│   ├── page.tsx           # GameEngine 入口点
│   ├── layout.tsx         # 根布局
│   └── globals.css        # Tailwind CSS
├── components/game/       # 游戏 UI 组件
│   ├── GameEngine.tsx     # 主状态机（菜单/游戏阶段）
│   ├── MainMenu.tsx       # 开始屏幕（新游戏/加载游戏）
│   ├── HUD.tsx            # 顶部栏（时间/属性显示）
│   ├── MapNavigation.tsx  # 位置导航 UI
│   └── DialogueSystem.tsx # 对话和脚本执行
└── lib/
    ├── game-data/         # 游戏逻辑和数据
    │   ├── types.ts       # TypeScript 类型定义
    │   ├── characters.ts  # 角色定义及 AI 提示
    │   ├── locations.ts   # 位置数据
    │   └── scripts.ts     # 预定义对话脚本
    ├── store.ts           # Zustand 游戏状态 (useGameStore)
    ├── ai-service.ts      # Gemini API 集成
    └── i18n.ts            # 国际化 (en/zh)
```

### 状态管理 (Zustand)

`useGameStore` 管理不可变状态：

- **player**: 姓名、属性（智力/魅力/体能/金钱）、当前位置
- **time**: 天数（1+）、小时（0-23）、星期（0-6，周一-周日）
- **relationships**: 每个角色的好感度（0+）、状态、已观看事件
- **agentStates**: 每个角色的 AI 情绪、当前目标、记忆
- **flags**: 任意布尔值游戏标记
- **currentScriptId**: 触发对话/系统事件
- **language**: 'en' 或 'zh'

关键 store 操作：`setLanguage`、`setCurrentScriptId`、`advanceTime`、`setPlayerLocation`、`updateStats`、`modStats`、`updateRelationship`、`updateAgentState`、`setFlag`。

### 对话系统

对话系统支持**预定义脚本和动态 AI 交互**：

1. **预定义脚本**: 在 `scripts.ts` 的 `SCRIPTS` 对象中注册
2. **动态 AI**: 当 `scriptId` 匹配角色 ID 时，系统：
   - 检查"首次相遇"标记 (`met_<charId>`)
   - 如果未相遇，播放预定义的 `meet_<charId>` 脚本
   - 否则调用 `AIService.getAgentResponse()` 进行 AI 对话

**脚本动作**:
- `dialogue` - 角色/说话者对话，可选情绪
- `choice` - 多个选项，带有 `nextId` 分支
- `jump` - 跳转到另一个脚本 ID
- `effect` - 状态变更（set_flag、mod_stat、mod_affection、move、advance_time）
- `background` - 更改背景图片
- `input` - 玩家文本输入
- `end` - 结束当前脚本

**AI 对话循环**:
- 玩家与角色对话 → AI 生成回复 → 显示对话，提供"继续聊天"或"离开"选项
- "继续聊天"回到角色 ID，触发新的 AI 回复
- "离开"跳转到 `end_conversation`

### AI 服务 (`lib/ai-service.ts`)

使用 Google Gemini 2.5 Flash API，包含以下方法：

- **`getAgentResponse(characterId, playerInput, gameState)`**: 根据系统提示、上下文（时间、位置、关系、情绪、目标）生成角色对话
- **`getCharacterAction(characterId, gameState)`**: AI 决定角色应该在哪里
- **`getDirectorEvent(gameState)`**: 高层事件策划的占位符

角色提示定义在 `lib/game-data/characters.ts`，包含性格、语气和当前目标。

### 游戏循环

1. **菜单阶段**: `MainMenu` 组件显示新游戏/加载游戏选项
2. **新游戏**: 设置 `currentScriptId` 为 'prologue'，切换到 'playing' 阶段
3. **游戏阶段**:
   - `HUD` 显示时间/属性
   - `MapNavigation` 显示位置选项
   - 如果设置了 `currentScriptId`，`DialogueSystem` 覆盖层并处理脚本
4. **自动保存**: 玩家/时间变更时，状态持久化到 `localStorage` ('love-sim-save')

### 国际化

支持的语言: 'en' (English), 'zh' (简体中文)

- UI 文本在 `lib/i18n.ts` 中定义 (`UI_TEXT` 对象，包含嵌套键)
- 角色对话通过 AI 提示支持多语言
- 主菜单中的语言切换调用 `setLanguage()` store 操作

## 当前进度 (Checkpoint: e2e-tests-passing)

**最后更新**: 2026-02-13

### 已完成

| 模块 | 状态 | 测试覆盖 |
|------|------|----------|
| Agent 核心逻辑 | ✅ 完成 | 10/10 单元测试 |
| 事件系统 | ✅ 完成 | 4/4 单元测试 |
| 日程调度器 | ✅ 完成 | 8/8 单元测试 |
| 记忆系统 | ✅ 完成 | 8/8 单元测试 |
| 关系引擎 | ✅ 完成 | 22/22 单元测试 |
| Agent 可视化 | ✅ 完成 | 14/14 单元测试 |
| E2E 测试 | ✅ 完成 | 20/21 (1 跳过) |

### 关键修复

1. **DialogueSystem.tsx**: 添加 `end` 动作到自动前进列表
2. **E2E 测试**: 创建 `agent-behaviors.spec.ts`，包含 20 个完整的 Agent 行为测试
3. **全旅程测试**: 临时跳过 (`full-journey.spec.ts`)，因依赖 AI API 调用

### 测试命令

| 命令 | 描述 |
|------|------|
| `npx vitest run` | 运行所有单元测试 (66/66 通过) |
| `npx playwright test` | 运行 E2E 测试 (20/21 通过) |
| `npx playwright test e2e/agent-behaviors.spec.ts` | 仅运行 Agent 行为测试 |

## Gstack

使用 `/browse` 技能进行所有网页浏览操作，**不要使用 `mcp__claude-in-chrome__*` 工具**。

### 可用技能

| 技能 | 用途 |
|------|------|
| `/office-hours` | 办公时间 |
| `/plan-ceo-review` | CEO 计划评审 |
| `/plan-eng-review` | 工程计划评审 |
| `/plan-design-review` | 设计计划评审 |
| `/design-consultation` | 设计咨询 |
| `/review` | 代码审查 |
| `/ship` | 发布 |
| `/land-and-deploy` | 合并并部署 |
| `/canary` | 金丝雀发布 |
| `/benchmark` | 性能基准测试 |
| `/browse` | 网页浏览（替代 mcp__claude-in-chrome__*） |
| `/qa` | 质量保证测试 |
| `/qa-only` | 仅 QA 测试 |
| `/design-review` | 设计审查 |
| `/setup-browser-cookies` | 设置浏览器 Cookie |
| `/setup-deploy` | 设置部署配置 |
| `/retro` | 回顾会议 |
| `/investigate` | 问题调查 |
| `/document-release` | 发布文档 |
| `/codex` | Codex 相关 |
| `/careful` | 谨慎模式 |
| `/freeze` | 冻结 |
| `/guard` | 守护 |
| `/unfreeze` | 解冻 |
| `/gstack-upgrade` | 升级 gstack |

### 故障排除

如果 gstack 技能无法正常工作，运行以下命令重新构建二进制文件并注册技能：

```bash
cd .claude/skills/gstack && ./setup
```
