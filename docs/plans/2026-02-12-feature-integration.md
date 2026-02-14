# love-sim 功能集成实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将已开发的辅助模块集成到游戏主系统中，实现完整的恋爱模拟游戏体验

**Architecture:**
- HUD 组件显示关系/成就信息
- Map Navigation 使用角色排班系统
- DialogueSystem 集成关系阶段和事件系统
- 存档系统使用 IndexedDB

**Tech Stack:** Next.js 16, React 19, TypeScript, Zustand, IndexedDB

---

## Task 1: 增强 HUD 显示关系和成就

**Files:**
- Modify: `src/components/game/HUD.tsx`

**Step 1: 查看当前 HUD 组件**

```bash
cat src/components/game/HUD.tsx
```

**Step 2: 添加关系状态显示**

在 HUD 中添加每个角色的关系阶段显示（使用 getRelationshipStage）：
```typescript
import { getRelationshipStage } from '@/lib/relationship-utils';
import { useGameStore } from '@/lib/store';

// Show relationship stage for each character
const rel = gameState.relationships[charId];
const stage = getRelationshipStage(rel.affection);
```

**Step 3: 添加成就进度显示**

```typescript
import { getUnlockedAchievements, getAchievementPoints } from '@/lib/achievement-utils';

const unlocked = getUnlockedAchievements(gameState);
const points = getAchievementPoints(unlocked);
```

**Step 4: 运行构建验证**

```bash
npm run build
```

**Step 5: 提交更改**

```bash
git add src/components/game/HUD.tsx
git commit -m "feat: add relationship and achievement display to HUD"
```

---

## Task 2: 增强 Map Navigation 使用角色排班

**Files:**
- Modify: `src/components/game/MapNavigation.tsx`
- Import: `getAvailableCharacters` from `@/lib/schedule-utils`

**Step 1: 添加角色排班导入**

```typescript
import { getAvailableCharacters } from '@/lib/schedule-utils';
```

**Step 2: 添加"寻找角色"功能**

在 MapNavigation 中添加自动找到当前地点角色的功能：
```typescript
const availableChars = getAvailableCharacters(player.location, gameState);
```

**Step 3: 添加相遇触发**

当玩家进入新地点时，检查是否有角色在场并触发相遇：
```typescript
useEffect(() => {
    const charsHere = getAvailableCharacters(player.location, gameState);
    // Trigger events for characters here
}, [player.location]);
```

**Step 4: 运行构建验证**

```bash
npm run build
```

**Step 5: 提交更改**

```bash
git add src/components/game/MapNavigation.tsx
git commit -m "feat: add character schedule system to map navigation"
```

---

## Task 3: 集成关系阶段到 DialogueSystem

**Files:**
- Modify: `src/components/game/DialogueSystem.tsx`
- Import: `updateRelationshipAndCheckProgression` from `@/lib/relationship-utils`

**Step 1: 添加关系升级检查**

在每次互动后检查关系阶段变化：
```typescript
const { newStage, stageChanged } = updateRelationshipAndCheckProgression(
    gameState, charId, affectionChange
);
```

**Step 2: 添加阶段升级提示**

```typescript
if (stageChanged) {
    // Show stage progression message
    // Unlock new dialogue scripts
}
```

**Step 3: 运行构建验证**

```bash
npm run build
```

**Step 4: 提交更改**

```bash
git add src/components/game/DialogueSystem.tsx
git commit -m "feat: integrate relationship stage progression into dialogue system"
```

---

## Task 4: 实现 Save/Load System (IndexedDB)

**Files:**
- Create: `src/lib/services/storage.ts`
- Modify: `src/lib/store.ts`

**Step 1: 创建 IndexedDB 服务**

```typescript
// src/lib/services/storage.ts
export class IndexedDBService {
    private dbName = 'love-sim-db';
    private storeName = 'saves';

    async saveGame(slot: number, state: GameState): Promise<void> {
        // Save to IndexedDB
    }

    async loadGame(slot: number): Promise<GameState | null> {
        // Load from IndexedDB
    }

    async listSaves(): Promise<SaveSlot[]> {
        // List all save slots
    }
}
```

**Step 2: 更新 store.ts 使用 IndexedDB**

```typescript
import { IndexedDBService } from '@/lib/services/storage';

const storage = new IndexedDBService();

// Save on state change
useEffect(() => {
    storage.saveGame(currentSlot, state);
}, [state]);

// Load on mount
useEffect(() => {
    const state = storage.loadGame(slot);
    if (state) useGameStore.setState(state);
}, []);
```

**Step 3: 添加存档 UI 组件**

Create: `src/components/game/SaveSlot.tsx`

**Step 4: 运行构建验证**

```bash
npm run build
```

**Step 5: 提交更改**

```bash
git add src/lib/services/storage.ts src/components/game/SaveSlot.tsx
git commit -m "feat: implement IndexedDB save/load system"
```

---

## Task 5: 创建角色卡组件 (CharacterCard)

**Files:**
- Create: `src/components/game/CharacterCard.tsx`

**Step 1: 创建 CharacterCard 组件**

显示角色头像、名称、关系阶段、好感度进度条：
```typescript
import { getRelationshipStage, getProgressToNextStage } from '@/lib/relationship-utils';

const stage = getRelationshipStage(affection);
const progress = getProgressToNextStage(affection, stage);
```

**Step 2: 添加点击交互**

点击角色卡显示详细信息和可选操作。

**Step 3: 运行构建验证**

```bash
npm run build
```

**Step 4: 提交更改**

```bash
git add src/components/game/CharacterCard.tsx
git commit -m "feat: create character card component"
```

---

## 执行选项

**1. Subagent-Driven (本会话)** - 我将为每个任务派遣独立的子代理，任务间审查，快速迭代

**2. 并行会话** - 在独立工作区打开新会话使用 executing-plans 技能进行批量执行

**请回答选项 1 或 2**
