# Love Sim Agent 优化实施计划

> **For Claude:** Use TDD workflow for each task. Test first, then implement.

**Goal:** 将 Love Sim 改造为基于 Agent 的恋爱模拟游戏，每个角色都有独立的性格、生活轨迹和实时对话能力

**Architecture:** 基于 Zustand 状态管理，每个角色是一个 Agent，拥有 personality、memory、mood、goal 等属性，通过事件系统驱动行为

**Tech Stack:** Next.js 16, React 19, Zustand 5, Google Gemini AI

---

## 任务清单

### 阶段 1: 核心基础设施（Week 1-2）

---

### Task 1: 更新类型定义

**Files:**
- Modify: `src/lib/game-data/types.ts`
- Create: `src/lib/agent/core.ts`

**Step 1: 更新类型定义**

在 `src/lib/game-data/types.ts` 中添加以下类型：

```typescript
// 性格特质
export type PersonalityTrait =
    | 'cold' | 'hot' | 'shy' | 'outgoing'
    | 'rational' | 'emotional' | 'formal' | 'casual';

export type AgentMood = {
    base: 'happy' | 'neutral' | 'sad' | 'angry' | 'anxious' | 'excited' | 'bored';
    intensity: number; // 0-100
    lastChangedAt?: Time;
    triggers: string[];
};

export type AgentGoal = {
    id: string;
    description: string;
    priority: number; // 1-10
    completed: boolean;
    targetType?: 'location' | 'character' | 'activity';
    targetId?: string;
};

export type AgentMemory = {
    id: string;
    type: 'event' | 'dialogue' | 'observation' | 'fact';
    content: string;
    timestamp: Time;
    emotionalValence: number; // -100 to +100
    strength: number; // 0-100
    associatedCharacters: CharacterId[];
};

export type AgentState = {
    // Core identity
    personality: PersonalityTrait[];
    coreValues: string[];

    // Memory system
    memory: AgentMemory[];
    recentInteractions: { charId: CharacterId; content: string; timestamp: Time }[];

    // Current state
    mood: AgentMood;
    currentGoal: AgentGoal | null;
    goalsQueue: AgentGoal[];

    // Contextual
    currentLocation: LocationId;
    currentActivity: string;

    // Social
    perceivedAffection: Record<CharacterId, number>;
    socialCircle: string[];
};
```

**Step 2: 运行 TypeScript 检查**

```bash
npx tsc --noEmit
```

**Expected:** No errors

---

### Task 2: 创建 Agent 核心逻辑

**Files:**
- Create: `src/lib/agent/core.ts`
- Test: `src/lib/agent/core.test.ts`

**Step 1: 编写测试文件**

```typescript
// src/lib/agent/core.test.ts

import { describe, it, expect } from 'vitest';
import { createAgentState, checkProactiveDialogue, decideAgentAction } from './core';

describe('Agent Core', () => {
    describe('createAgentState', () => {
        it('should create initial agent state', () => {
            const state = createAgentState('su_qingqian');
            expect(state.personality).toBeDefined();
            expect(state.memory).toEqual([]);
            expect(state.mood.base).toBe('neutral');
            expect(state.currentGoal).toBeNull();
        });
    });

    describe('checkProactiveDialogue', () => {
        it('should not trigger dialogue if locations differ', () => {
            const gameState = {
                agentStates: {
                    su_qingqian: {
                        currentLocation: 'library',
                        mood: { base: 'happy', intensity: 80 },
                        personality: [],
                        coreValues: [],
                        memory: [],
                        recentInteractions: [],
                        currentGoal: null,
                        goalsQueue: [],
                        perceivedAffection: {},
                        socialCircle: []
                    }
                },
                relationships: {
                    su_qingqian: { affection: 100, status: 'friend', eventsSeen: [] }
                },
                player: { location: 'cafeteria', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, name: 'Lin Xuan' },
                time: { day: 1, hour: 14, weekday: 0 }
            };

            const result = checkProactiveDialogue('su_qingqian', gameState);
            expect(result).toBe('IDLE');
        });
    });
});
```

**Step 2: 运行测试验证失败**

```bash
npx vitest run src/lib/agent/core.test.ts
```

**Expected:** FAIL - function not defined

**Step 3: 实现核心逻辑**

```typescript
// src/lib/agent/core.ts

import { CharacterId, GameState, Time, PersonalityTrait, AgentMood, AgentGoal, AgentMemory } from '../game-data/types';

export type ProactiveResult = 'DIALOGUE' | 'IDLE' | 'WAIT';

export function createAgentState(charId: CharacterId): AgentState {
    const baseState: AgentState = {
        personality: getPersonalityTraits(charId),
        coreValues: getCoreValues(charId),
        memory: [],
        recentInteractions: [],
        mood: { base: 'neutral', intensity: 50, triggers: [] },
        currentGoal: null,
        goalsQueue: [],
        currentLocation: 'dorm_room',
        currentActivity: 'idle',
        perceivedAffection: {},
        socialCircle: []
    };

    // Set initial goal based on character
    if (charId === 'su_qingqian') {
        baseState.currentGoal = {
            id: 'manage_council',
            description: 'Manage Student Council',
            priority: 10,
            completed: false,
            targetType: 'activity',
            targetId: 'student_council'
        };
    } else if (charId === 'chen_siyao') {
        baseState.currentGoal = {
            id: 'practice_dance',
            description: 'Practice Dancing',
            priority: 10,
            completed: false,
            targetType: 'activity',
            targetId: 'campus_map'
        };
    } else if (charId === 'ling_ruoyu') {
        baseState.currentGoal = {
            id: 'solve_physics',
            description: 'Solve Physics Problem',
            priority: 10,
            completed: false,
            targetType: 'activity',
            targetId: 'lab'
        };
    } else if (charId === 'lu_jiaxin') {
        baseState.currentGoal = {
            id: 'ride_motorcycle',
            description: 'Ride Motorcycle',
            priority: 10,
            completed: false,
            targetType: 'activity',
            targetId: 'city_map'
        };
    }

    return baseState;
}

function getPersonalityTraits(charId: CharacterId): PersonalityTrait[] {
    const traits: Record<CharacterId, PersonalityTrait[]> = {
        su_qingqian: ['cold', 'rational', 'formal', 'outgoing'],
        chen_siyao: ['hot', 'emotional', 'casual', 'outgoing'],
        ling_ruoyu: ['cold', 'rational', 'formal', 'shy'],
        lu_jiaxin: ['hot', 'emotional', 'casual', 'outgoing']
    };
    return traits[charId] || ['neutral'];
}

function getCoreValues(charId: CharacterId): string[] {
    const values: Record<CharacterId, string[]> = {
        su_qingqian: ['Rules', 'Efficiency', 'Responsibility'],
        chen_siyao: ['Dream', 'Hardwork', 'Passion'],
        ling_ruoyu: ['Knowledge', 'Truth', 'Logic'],
        lu_jiaxin: ['Freedom', 'Independence', 'Passion']
    };
    return values[charId] || [];
}

export async function checkProactiveDialogue(
    agentId: CharacterId,
    gameState: GameState
): Promise<ProactiveResult> {
    const agentState = gameState.agentStates[agentId];
    const relationship = gameState.relationships[agentId];

    // Skip if player is far away
    if (agentState.currentLocation !== gameState.player.location) {
        return 'IDLE';
    }

    // Skip if relationship is too low
    if (relationship.affection < 15) {
        return 'IDLE';
    }

    // Skip if in middle of important activity
    const importantActivities = ['studying', 'performing', 'research'];
    if (importantActivities.includes(agentState.currentActivity)) {
        if (Math.random() < 0.2) {
            return 'WAIT';
        }
        return 'IDLE';
    }

    // Check mood - happy/excited agents more likely to initiate
    if (['happy', 'excited'].includes(agentState.mood.base)) {
        if (Math.random() * 100 < agentState.mood.intensity * 0.6) {
            return 'DIALOGUE';
        }
    }

    // Neutral mood based on affection
    if (agentState.mood.base === 'neutral') {
        const chance = 0.1 + (relationship.affection / 500);
        if (Math.random() < chance) {
            return 'DIALOGUE';
        }
    }

    return 'IDLE';
}

export function decideAgentAction(
    agentId: CharacterId,
    gameState: GameState,
    playerLocation: string
): { type: 'INTERACT' | 'MOVE' | 'IDLE'; target?: string } {
    const agentState = gameState.agentStates[agentId];
    const relationship = gameState.relationships[agentId];

    // If same location and affection is high, interact
    if (agentState.currentLocation === playerLocation && relationship.affection > 50) {
        const moodFactor = getMoodModifier(agentState.mood);
        if (moodFactor > 0.8 && Math.random() < 0.7) {
            return { type: 'INTERACT' };
        }
    }

    // Otherwise follow schedule
    return { type: 'IDLE' };
}

function getMoodModifier(mood: AgentMood): number {
    const modifiers: Record<string, number> = {
        'happy': 1.5,
        'excited': 1.3,
        'neutral': 1.0,
        'sad': 0.7,
        'angry': 0.5,
        'anxious': 0.8,
        'bored': 0.6
    };
    return modifiers[mood.base] || 1.0;
}
```

**Step 4: 运行测试验证通过**

```bash
npx vitest run src/lib/agent/core.test.ts
```

**Expected:** PASS - All tests pass

**Step 5: Commit**

```bash
git add src/lib/agent/core.ts src/lib/agent/core.test.ts src/lib/game-data/types.ts
git commit -m "feat: add agent core logic and state management"
```

---

### Task 3: 创建关系引擎

**Files:**
- Create: `src/lib/agent/relationship.ts`
- Test: `src/lib/agent/relationship.test.ts`

**Step 1: 编写测试**

```typescript
// src/lib/agent/relationship.test.ts

import { describe, it, expect } from 'vitest';
import { updateRelationshipStatus, calculateAffectionChange, checkRelationshipUnlock } from './relationship';

describe('Relationship Engine', () => {
    describe('updateRelationshipStatus', () => {
        it('should update status correctly', () => {
            expect(updateRelationshipStatus(25)).toBe('stranger');
            expect(updateRelationshipStatus(75)).toBe('acquaintance');
            expect(updateRelationshipStatus(150)).toBe('friend');
            expect(updateRelationshipStatus(250)).toBe('crush');
            expect(updateRelationshipStatus(350)).toBe('lover');
        });
    });

    describe('calculateAffectionChange', () => {
        it('should calculate change based on mood', () => {
            const gameState = {
                relationships: {
                    su_qingqian: { affection: 50, status: 'acquaintance', eventsSeen: [] }
                },
                agentStates: {
                    su_qingqian: {
                        mood: { base: 'happy', intensity: 80 },
                        personality: [],
                        coreValues: [],
                        memory: [],
                        recentInteractions: [],
                        currentGoal: null,
                        goalsQueue: [],
                        currentLocation: '',
                        perceivedAffection: {},
                        socialCircle: []
                    }
                },
                player: { location: '', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, name: '' },
                time: { day: 1, hour: 12, weekday: 0 }
            };

            const change = calculateAffectionChange('su_qingqian', 'respected', true, gameState);
            expect(change).toBeGreaterThan(0);
        });
    });
});
```

**Step 2: 实现关系引擎**

```typescript
// src/lib/agent/relationship.ts

import { CharacterId, GameState, RelationshipStatus, Time, Stats, AgentMood } from '../game-data/types';
import { CHARACTERS } from '../game-data/characters';

export type RelationshipStatus =
    | 'stranger'      // 0-50 affection
    | 'acquaintance'  // 50-100
    | 'friend'        // 100-200
    | 'crush'         // 200-300
    | 'lover'         // 300-500
    | 'enemy';        // <0 (rare)

export interface Relationship {
    affection: number;
    status: RelationshipStatus;
    history: RelationshipEvent[];
    lockedFeatures: string[];
    lastInteraction?: Time;
}

export interface RelationshipEvent {
    id: string;
    type: 'dialogue' | 'gift' | 'time_spent' | 'shared_secret';
    timestamp: Time;
    location: string;
    impact: number;
    description: string;
}

export function updateRelationshipStatus(affection: number): RelationshipStatus {
    if (affection >= 300) return 'lover';
    if (affection >= 200) return 'crush';
    if (affection >= 100) return 'friend';
    if (affection >= 50) return 'acquaintance';
    if (affection > 0) return 'stranger';
    return 'enemy';
}

export function calculateAffectionChange(
    agentId: CharacterId,
    playerInput: string,
    isPositive: boolean,
    gameState: GameState
): number {
    const relationship = gameState.relationships[agentId];
    const agentState = gameState.agentStates[agentId];

    // Base change
    let baseChange = isPositive ? 5 : -3;

    // Diminishing returns
    const affectionFactor = 1 - (relationship.affection / 200);
    baseChange *= affectionFactor;

    // Personality compatibility
    const personalityFactor = getPersonalityCompatibility(agentState.personality, playerInput);
    baseChange *= personalityFactor;

    // Mood modifier
    const moodFactor = getMoodModifier(agentState.mood);
    baseChange *= moodFactor;

    // Time-based decay
    const daysSinceLastInteraction = calculateDaysSinceLastInteraction(
        relationship.lastInteraction,
        gameState.time
    );
    if (daysSinceLastInteraction > 3) {
        baseChange *= (1 - (daysSinceLastInteraction - 3) * 0.1);
    }

    return Math.round(baseChange * 10) / 10;
}

function getPersonalityCompatibility(personality: string[], playerInput: string): number {
    const keywords: Record<string, number> = {
        'rational': 1.2,
        'emotional': 0.8,
        'formal': 1.1,
        'casual': 0.9,
        'respectful': 1.3,
        'rude': 0.5,
        'cold': 0.8,
        'hot': 1.2
    };

    let factor = 1.0;
    for (const [key, value] of Object.entries(keywords)) {
        if (playerInput.toLowerCase().includes(key)) {
            factor *= value;
        }
    }

    return factor;
}

function getMoodModifier(mood: AgentMood): number {
    const modifiers: Record<string, number> = {
        'happy': 1.5,
        'excited': 1.3,
        'neutral': 1.0,
        'sad': 0.7,
        'angry': 0.5,
        'anxious': 0.8,
        'bored': 0.6
    };
    return modifiers[mood.base] || 1.0;
}

function calculateDaysSinceLastInteraction(lastInteraction?: Time, currentTime?: Time): number {
    if (!lastInteraction || !currentTime) return 999;
    return currentTime.day - lastInteraction.day;
}

export function checkRelationshipUnlock(
    agentId: CharacterId,
    gameState: GameState
): RelationshipUnlock | null {
    const relationship = gameState.relationships[agentId];
    const agentState = gameState.agentStates[agentId];

    // Status-based unlocks
    if (relationship.status === 'stranger' && relationship.affection >= 50) {
        return { type: 'STATUS_UPGRADE', newStatus: 'acquaintance', reward: 'basic_dialogue' };
    }
    if (relationship.status === 'acquaintance' && relationship.affection >= 100) {
        return { type: 'STATUS_UPGRADE', newStatus: 'friend', reward: 'personal_questions' };
    }
    if (relationship.status === 'friend' && relationship.affection >= 200) {
        return { type: 'STATUS_UPGRADE', newStatus: 'crush', reward: 'private_moments' };
    }
    if (relationship.status === 'crush' && relationship.affection >= 300) {
        return { type: 'STATUS_UPGRADE', newStatus: 'lover', reward: 'romantic_events' };
    }

    // Personality-based unlocks
    if (agentId === 'su_qingqian' && relationship.affection >= 150) {
        return { type: 'PERSONALITY', unlock: 'iceberg_cracked', reward: 'private_thoughts' };
    }
    if (agentId === 'chen_siyao' && relationship.affection >= 150) {
        return { type: 'PERSONALITY', unlock: 'secret_revealed', reward: 'idol_identity' };
    }
    if (agentId === 'ling_ruoyu' && relationship.affection >= 150) {
        return { type: 'PERSONALITY', unlock: 'vulnerable_moment', reward: 'personal_struggles' };
    }
    if (agentId === 'lu_jiaxin' && relationship.affection >= 200) {
        return { type: 'PERSONALITY', unlock: 'heart_opened', reward: 'family_background' };
    }

    return null;
}

export interface RelationshipUnlock {
    type: 'STATUS_UPGRADE' | 'PERSONALITY';
    newStatus?: RelationshipStatus;
    unlock: string;
    reward: string;
}
```

**Step 3: 运行测试并提交**

```bash
npx vitest run src/lib/agent/relationship.test.ts
```

---

### 阶段 2: 每日日程系统（Week 3）

---

### Task 4: 创建日程调度器

**Files:**
- Create: `src/lib/agent/scheduler.ts`
- Test: `src/lib/agent/scheduler.test.ts`

**Step 1: 编写测试**

```typescript
// src/lib/agent/scheduler.test.ts

import { describe, it, expect } from 'vitest';
import { getScheduledLocation, CHARACTER_SCHEDULES } from './scheduler';

describe('Scheduler', () => {
    describe('getScheduledLocation', () => {
        it('should return correct location based on time', () => {
            // Su Qingqian at 10:00 should be at student_council
            const location = getScheduledLocation('su_qingqian', { day: 1, hour: 10, weekday: 0 });
            expect(location).toBe('student_council');
        });
    });
});
```

**Step 2: 实现调度器**

```typescript
// src/lib/agent/scheduler.ts

import { CharacterId, LocationId, Time, LocalizedText, Stats } from '../game-data/types';

export interface DailySchedule {
    timeSlot: string; // "06:00-08:00"
    defaultLocation: LocationId;
    activities: Activity[];
}

export interface Activity {
    id: string;
    name: LocalizedText;
    duration: number; // hours
    requiredLocation: LocationId;
    impact: {
        affection?: number;
        stats?: Partial<Stats>;
        moodChange?: string;
    };
}

export const CHARACTER_SCHEDULES: Record<CharacterId, DailySchedule[]> = {
    su_qingqian: [
        { timeSlot: '06:00-08:00', defaultLocation: 'dorm_room', activities: [] },
        { timeSlot: '08:00-12:00', defaultLocation: 'classroom', activities: [
            { id: 'study', name: 'Study', duration: 4, requiredLocation: 'classroom', impact: { stats: { intelligence: 2 } } }
        ]},
        { timeSlot: '12:00-14:00', defaultLocation: 'cafeteria', activities: [
            { id: 'lunch', name: 'Lunch', duration: 2, requiredLocation: 'cafeteria', impact: { moodChange: 'neutral' } }
        ]},
        { timeSlot: '14:00-18:00', defaultLocation: 'student_council', activities: [
            { id: 'council', name: 'Student Council', duration: 4, requiredLocation: 'student_council', impact: { stats: { charm: 1 } } }
        ]},
        { timeSlot: '18:00-22:00', defaultLocation: 'library', activities: [
            { id: 'read', name: 'Read', duration: 4, requiredLocation: 'library', impact: { stats: { intelligence: 3 } } }
        ]},
        { timeSlot: '22:00-06:00', defaultLocation: 'dorm_room', activities: [] },
    ],
    chen_siyao: [
        { timeSlot: '07:00-09:00', defaultLocation: 'dorm_room', activities: [] },
        { timeSlot: '09:00-12:00', defaultLocation: 'campus_map', activities: [
            { id: 'practice', name: 'Practice', duration: 3, requiredLocation: 'campus_map', impact: { stats: { charm: 2, fitness: 2 } } }
        ]},
        { timeSlot: '12:00-14:00', defaultLocation: 'cafeteria', activities: [] },
        { timeSlot: '14:00-17:00', defaultLocation: 'classroom', activities: [] },
        { timeSlot: '17:00-21:00', defaultLocation: 'city_map', activities: [
            { id: 'idol', name: 'Idol Work', duration: 4, requiredLocation: 'city_map', impact: { moodChange: 'excited' } }
        ]},
        { timeSlot: '21:00-07:00', defaultLocation: 'dorm_room', activities: [] },
    ],
    ling_ruoyu: [
        { timeSlot: '05:00-09:00', defaultLocation: 'lab', activities: [
            { id: 'research', name: 'Research', duration: 4, requiredLocation: 'lab', impact: { stats: { intelligence: 4 } } }
        ]},
        { timeSlot: '09:00-12:00', defaultLocation: 'classroom', activities: [
            { id: 'teach', name: 'Teach', duration: 3, requiredLocation: 'classroom', impact: { charm: 1 } }
        ]},
        { timeSlot: '12:00-18:00', defaultLocation: 'cafeteria', activities: [] },
        { timeSlot: '18:00-23:00', defaultLocation: 'lab', activities: [
            { id: 'research', name: 'Research', duration: 5, requiredLocation: 'lab', impact: { stats: { intelligence: 3 } } }
        ]},
        { timeSlot: '23:00-05:00', defaultLocation: 'dorm_room', activities: [] },
    ],
    lu_jiaxin: [
        { timeSlot: '09:00-12:00', defaultLocation: 'campus_map', activities: [] },
        { timeSlot: '12:00-15:00', defaultLocation: 'biker_club', activities: [
            { id: 'ride', name: 'Ride Motorcycle', duration: 3, requiredLocation: 'biker_club', impact: { moodChange: 'excited' } }
        ]},
        { timeSlot: '15:00-18:00', defaultLocation: 'city_map', activities: [] },
        { timeSlot: '18:00-22:00', defaultLocation: 'bar', activities: [
            { id: 'sing', name: 'Sing', duration: 4, requiredLocation: 'bar', impact: { charm: 2, money: 500 } }
        ]},
        { timeSlot: '22:00-09:00', defaultLocation: 'dorm_room', activities: [] },
    ]
};

export function getScheduledLocation(agentId: CharacterId, time: Time): LocationId {
    const schedules = CHARACTER_SCHEDULES[agentId];

    for (const schedule of schedules) {
        const [start, end] = schedule.timeSlot.split('-').map(parseTime);
        if (time.hour >= start && time.hour < end) {
            return schedule.defaultLocation;
        }
    }

    return 'campus_map'; // Default fallback
}

function parseTime(timeStr: string): number {
    const [hour] = timeStr.split(':').map(Number);
    return hour;
}
```

---

### Task 5: 创建事件系统

**Files:**
- Create: `src/lib/event-system.ts`
- Test: `src/lib/event-system.test.ts`

**Step 1: 编写测试**

```typescript
// src/lib/event-system.test.ts

import { describe, it, expect } from 'vitest';
import { EventSystem, EventType } from './event-system';

describe('Event System', () => {
    it('should handle event subscription and emission', () => {
        const system = new EventSystem();
        let receivedEvent: any = null;

        system.subscribe('TEST_EVENT', (event) => {
            receivedEvent = event;
        });

        system.emit({
            type: 'TEST_EVENT',
            payload: { test: true },
            timestamp: { day: 1, hour: 12, weekday: 0 },
            id: 'test_1'
        });

        expect(receivedEvent).toBeDefined();
        expect(receivedEvent.payload.test).toBe(true);
    });
});
```

**Step 2: 实现事件系统**

```typescript
// src/lib/event-system.ts

import { GameState, Time } from '../game-data/types';

export type EventType =
    | 'TIME_ADVANCE'
    | 'LOCATION_CHANGE'
    | 'DIALOGUE_COMPLETE'
    | 'AFFECTION_CHANGE'
    | 'STATUS_UPGRADE'
    | 'RANDOM_EVENT'
    | 'AGENT_ACTION'
    | 'PLAYER_ACTION';

export interface GameEvent {
    type: EventType;
    payload: any;
    timestamp: Time;
    id: string;
}

export class EventSystem {
    private subscribers: Map<EventType, Set<(event: GameEvent) => void>> = new Map();
    private eventQueue: GameEvent[] = [];

    subscribe(eventType: EventType, handler: (event: GameEvent) => void) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, new Set());
        }
        this.subscribers.get(eventType)!.add(handler);
    }

    unsubscribe(eventType: EventType, handler: (event: GameEvent) => void) {
        const handlers = this.subscribers.get(eventType);
        if (handlers) {
            handlers.delete(handler);
        }
    }

    emit(event: GameEvent) {
        this.eventQueue.push(event);

        const handlers = this.subscribers.get(event.type);
        if (handlers) {
            // Clone handlers to avoid modification during iteration
            for (const handler of [...handlers]) {
                handler(event);
            }
        }
    }

    async processQueue(gameState: GameState): Promise<GameState> {
        let state = gameState;

        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift()!;

            // Process event-based state changes
            switch (event.type) {
                case 'AFFECTION_CHANGE':
                    state = this.handleAffectionChange(state, event);
                    break;
                case 'STATUS_UPGRADE':
                    state = this.handleStatusUpgrade(state, event);
                    break;
                case 'LOCATION_CHANGE':
                    state = this.handleLocationChange(state, event);
                    break;
                case 'TIME_ADVANCE':
                    state = this.handleTimeAdvance(state, event);
                    break;
            }
        }

        return state;
    }

    private handleAffectionChange(state: GameState, event: GameEvent): GameState {
        const { agentId, change } = event.payload;
        const relationship = state.relationships[agentId];
        const newAffection = Math.max(0, relationship.affection + change);

        return {
            ...state,
            relationships: {
                ...state.relationships,
                [agentId]: {
                    ...relationship,
                    affection: newAffection,
                    lastInteraction: state.time
                }
            }
        };
    }

    private handleStatusUpgrade(state: GameState, event: GameEvent): GameState {
        const { agentId, newStatus, reward } = event.payload;

        // Unlock features based on reward
        const updatedRelationship = {
            ...state.relationships[agentId],
            status: newStatus,
            lockedFeatures: [...state.relationships[agentId].lockedFeatures, reward]
        };

        return {
            ...state,
            relationships: {
                ...state.relationships,
                [agentId]: updatedRelationship
            }
        };
    }

    private handleLocationChange(state: GameState, event: GameEvent): GameState {
        const { agentId, location } = event.payload;
        const agentState = state.agentStates[agentId];

        // Check for chance encounters
        if (agentId !== 'player' && location === state.player.location) {
            const chance = 0.3 + (state.relationships[agentId].affection / 500);

            if (Math.random() < chance) {
                // Queue a dialogue event
                this.emit({
                    type: 'AGENT_ACTION',
                    payload: { agentId, action: 'proactive_dialogue' },
                    timestamp: state.time,
                    id: `encounter_${Date.now()}`
                });
            }
        }

        return {
            ...state,
            agentStates: {
                ...state.agentStates,
                [agentId]: {
                    ...agentState,
                    currentLocation: location
                }
            }
        };
    }

    private handleTimeAdvance(state: GameState, event: GameEvent): GameState {
        // Update agent locations based on new time
        const newAgentStates = { ...state.agentStates };

        for (const charId of Object.keys(CHARACTERS) as CharacterId[]) {
            const scheduledLoc = getScheduledLocation(charId, state.time);
            if (scheduledLoc && newAgentStates[charId].currentLocation !== scheduledLoc) {
                newAgentStates[charId].currentLocation = scheduledLoc;
                newAgentStates[charId].currentActivity = 'scheduled';
            }
        }

        return {
            ...state,
            agentStates: newAgentStates
        };
    }
}
```

---

### 阶段 3: 实时对话优化（Week 4）

---

### Task 6: 创建记忆系统

**Files:**
- Create: `src/lib/agent/memory.ts`
- Test: `src/lib/agent/memory.test.ts`

---

### Task 7: 更新 AI 服务

**Files:**
- Modify: `src/lib/ai-service.ts`

---

### 阶段 4: Agent 调度器（Week 5）

---

### Task 8: 创建 AgentManager 组件

**Files:**
- Create: `src/components/game/AgentManager.tsx`

---

### Task 9: 更新 GameEngine

**Files:**
- Modify: `src/components/game/GameEngine.tsx`

---

### Task 10: 更新 DialogueSystem

**Files:**
- Modify: `src/components/game/DialogueSystem.tsx`

---

### 阶段 5: 奖励系统完善（Week 6）

---

### Task 11: 更新 AgentPrompts

**Files:**
- Create: `src/lib/game-data/agent-prompts.ts`

---

### Task 12: 创建可视化组件

**Files:**
- Create: `src/components/game/AgentVisualization.tsx`

---

### Task 13: 编写 E2E 测试

**Files:**
- Create: `e2e/agent-behavior.spec.ts`

---

## 测试策略

### 单元测试
- 使用 Vitest 进行单元测试
- 目标覆盖率：80%+
- 测试文件位置：`src/lib/agent/*.test.ts`

### 集成测试
- 测试 Agent 之间的交互
- 测试时间推进对 Agent 的影响
- 测试对话系统与状态管理的集成

### E2E 测试
- 测试完整的 Agent 行为流程
- 测试关系系统和奖励解锁
- 测试主动对话触发

---

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| AI 调用延迟 | 高 | 添加加载状态，使用缓存 |
| 状态管理复杂度 | 中 | 使用immer保证不可变性 |
| 多角色并发 | 中 | 使用事件系统解耦 |
| 性能问题 | 中 | 虚拟化、Web Worker、防抖 |

---

## 实施检查点

- [ ] Week 2 结束：Agent 核心逻辑完成，测试通过
- [ ] Week 3 结束：日程系统和事件系统完成
- [ ] Week 4 结束：对话系统优化完成
- [ ] Week 5 结束：Agent 调度器集成完成
- [ ] Week 6 结束：奖励系统和 E2E 测试完成
