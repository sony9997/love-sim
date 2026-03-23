import { Page, expect } from '@playwright/test';

/**
 * Shared Test Helpers for E2E Tests
 *
 * This module provides:
 * - Type definitions for game state
 * - Factory functions for creating test game states
 * - LocalStorage helpers for test setup/cleanup
 * - Dialogue and navigation helpers
 */

// ==========================================
// Constants
// ==========================================

export const CHARACTER_IDS = {
  SU_QINGQIAN: 'su_qingqian',
  CHEN_SIYAO: 'chen_siyao',
  LING_RUOYU: 'ling_ruoyu',
  LU_JIAXIN: 'lu_jiaxin',
} as const;

export const LOCATIONS = {
  DORM: 'dorm_room',
  CAMPUS: 'campus_map',
  LIBRARY: 'library',
  LAB: 'lab',
  BAR: 'bar',
  CLASSROOM: 'classroom',
  CITY: 'city_map',
  STUDENT_COUNCIL: 'student_council',
} as const;

export const DEFAULT_STATS = {
  intelligence: 10,
  charm: 10,
  fitness: 10,
  money: 1000,
} as const;

// ==========================================
// Types
// ==========================================

export interface GameStats {
  intelligence: number;
  charm: number;
  fitness: number;
  money: number;
}

export interface MoodState {
  base: string;
  intensity: number;
  triggers: string[];
}

export interface AgentState {
  mood: MoodState | string;
  currentGoal: string | null;
  memory: any[];
  currentLocation?: string;
  currentActivity?: string;
  personality?: string[];
  coreValues?: string[];
  goalsQueue?: any[];
  recentInteractions?: any[];
  perceivedAffection?: Record<string, number>;
  socialCircle?: string[];
}

export interface RelationshipState {
  affection: number;
  status: string;
  eventsSeen: string[];
}

export interface GameState {
  player: {
    name: string;
    stats: GameStats;
    location: string;
  };
  time: {
    day: number;
    hour: number;
    weekday: number;
  };
  relationships: Record<string, RelationshipState>;
  agentStates: Record<string, AgentState>;
  flags: Record<string, boolean>;
  currentScriptId: string | null;
  language: 'en' | 'zh';
}

export interface CreateGameStateOptions {
  location?: string;
  day?: number;
  hour?: number;
  weekday?: number;
  stats?: Partial<GameStats>;
  relationships?: Partial<Record<string, Partial<RelationshipState>>>;
  agentStatesFull?: boolean;
  agentLocations?: Record<string, string>;
  flags?: Record<string, boolean>;
  currentScriptId?: string | null;
  language?: 'en' | 'zh';
}

// ==========================================
// Default State Factories
// ==========================================

const ALL_CHARACTERS = Object.values(CHARACTER_IDS);

/**
 * Create default relationships for all characters
 */
export function createDefaultRelationships(
  overrides: Partial<Record<string, Partial<RelationshipState>>> = {}
): Record<string, RelationshipState> {
  const result: Record<string, RelationshipState> = {};
  for (const id of ALL_CHARACTERS) {
    result[id] = {
      affection: 0,
      status: 'stranger',
      eventsSeen: [],
      ...overrides[id],
    };
  }
  return result;
}

/**
 * Character default locations and moods
 */
const CHARACTER_DEFAULTS: Record<string, { mood: string; location: string }> = {
  [CHARACTER_IDS.SU_QINGQIAN]: { mood: 'neutral', location: LOCATIONS.LIBRARY },
  [CHARACTER_IDS.CHEN_SIYAO]: { mood: 'happy', location: LOCATIONS.CITY },
  [CHARACTER_IDS.LING_RUOYU]: { mood: 'neutral', location: LOCATIONS.LAB },
  [CHARACTER_IDS.LU_JIAXIN]: { mood: 'neutral', location: LOCATIONS.BAR },
};

/**
 * Create default agent states for all characters
 */
export function createDefaultAgentStates(
  options: { full?: boolean; locations?: Record<string, string> } = {}
): Record<string, AgentState> {
  const result: Record<string, AgentState> = {};

  for (const id of ALL_CHARACTERS) {
    const defaults = CHARACTER_DEFAULTS[id];
    result[id] = {
      mood: { base: defaults.mood, intensity: 50, triggers: [] },
      currentGoal: null,
      memory: [],
      ...(options.full && {
        currentLocation: options.locations?.[id] || defaults.location,
        currentActivity: 'idle',
        personality: [defaults.mood === 'happy' ? 'hot' : 'cold'],
        coreValues: [],
        goalsQueue: [],
        recentInteractions: [],
        perceivedAffection: {},
        socialCircle: [],
      }),
    };
  }
  return result;
}

/**
 * Create a complete game state with sensible defaults
 */
export function createGameState(options: CreateGameStateOptions = {}): GameState {
  return {
    player: {
      name: 'Lin Xuan',
      stats: { ...DEFAULT_STATS, ...options.stats },
      location: options.location || LOCATIONS.CAMPUS,
    },
    time: {
      day: options.day ?? 1,
      hour: options.hour ?? 9,
      weekday: options.weekday ?? 0,
    },
    relationships: createDefaultRelationships(options.relationships),
    agentStates: createDefaultAgentStates({
      full: options.agentStatesFull,
      locations: options.agentLocations,
    }),
    flags: options.flags || {},
    currentScriptId: options.currentScriptId ?? null,
    language: options.language || 'en',
  };
}

// ==========================================
// LocalStorage Helpers
// ==========================================

/**
 * Enable test mode for mock AI responses
 */
export async function enableTestMode(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.setItem('love-sim-test-mode', 'true');
  });
}

/**
 * Clear all game state from localStorage
 */
export async function clearGameState(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('love-sim-save');
    localStorage.removeItem('love-sim-test-mode');
  });
}

/**
 * Get current game state from localStorage
 */
export async function getGameState(page: Page): Promise<GameState | null> {
  return await page.evaluate(() => {
    const state = localStorage.getItem('love-sim-save');
    return state ? JSON.parse(state) : null;
  });
}

/**
 * Set game state in localStorage
 */
export async function setGameState(
  page: Page,
  gameState: GameState
): Promise<void> {
  await page.evaluate((state) => {
    localStorage.setItem('love-sim-save', JSON.stringify(state));
  }, gameState);
}

/**
 * Set game state, reload page, and click Continue button
 */
export async function loadGameState(
  page: Page,
  gameState: GameState
): Promise<void> {
  await setGameState(page, gameState);
  await page.reload();
  await page.getByRole('button', { name: /Continue|继续/ }).click();
}

// ==========================================
// Dialogue Helpers
// ==========================================

/**
 * Advance through dialogues by clicking continue prompts
 */
export async function advanceDialogues(
  page: Page,
  options: { maxIterations?: number; handleChoices?: boolean } = {}
): Promise<void> {
  const { maxIterations = 20, handleChoices = false } = options;

  for (let i = 0; i < maxIterations; i++) {
    const continuePrompt = page.getByText(/Click to continue|点击继续/);

    if (await continuePrompt.isVisible({ timeout: 500 }).catch(() => false)) {
      await continuePrompt.click({ force: true });
      continue;
    }

    const inputField = page.locator('input[type="text"][placeholder]');
    if (await inputField.isVisible({ timeout: 500 }).catch(() => false)) {
      await inputField.fill('Hello!');
      const sendBtn = page.getByRole('button', { name: /Send|发送/ });
      if (await sendBtn.isEnabled()) {
        await sendBtn.click();
      }
      continue;
    }

    if (handleChoices) {
      const choiceBtn = page.locator('[data-testid="dialogue-overlay"] button').first();
      if (await choiceBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await choiceBtn.click();
        continue;
      }
    }

    break;
  }
}

/**
 * Advance through all dialogues including AI responses (comprehensive version)
 */
export async function advanceAllDialogues(page: Page): Promise<void> {
  let sendAttempts = 0;

  for (let i = 0; i < 50; i++) {
    const overlay = page.locator('[data-testid="dialogue-overlay"]');
    if (!(await overlay.isVisible())) break;

    // Continue prompt
    const continueBtn = page.getByText('Click to continue', { exact: false });
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      continue;
    }

    // Leave button
    const leaveBtn = overlay.getByRole('button', { name: /^Leave$|^离开$/ });
    if (await leaveBtn.count() > 0) {
      await leaveBtn.click();
      continue;
    }

    // Chat more button
    const chatMoreBtn = overlay.getByRole('button', { name: /Chat more|再聊聊/ });
    if (await chatMoreBtn.count() > 0) {
      await chatMoreBtn.click();
      continue;
    }

    // Input field + send
    const inputField = page.locator('input[type="text"][placeholder]');
    const sendBtn = page.getByRole('button', { name: /Send|发送/ });
    if (await inputField.isVisible() && sendAttempts < 2) {
      sendAttempts++;
      await inputField.evaluate((el: HTMLInputElement) => {
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
          window.HTMLInputElement.prototype,
          'value'
        )!.set;
        nativeInputValueSetter!.call(el, 'Hello!');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
      if (await sendBtn.isEnabled()) {
        await sendBtn.click();
      }
      continue;
    }

    break;
  }
}

/**
 * Complete the prologue by clicking through to dorm choice
 */
export async function completePrologue(page: Page): Promise<void> {
  const dialogueOverlay = page.getByTestId('dialogue-overlay');
  await expect(dialogueOverlay).toBeVisible({ timeout: 10000 });

  for (let i = 0; i < 20; i++) {
    const dormChoice = page.getByRole('button', {
      name: /Go straight to the Dorm|直接去宿舍/,
    });
    if (await dormChoice.isVisible({ timeout: 500 }).catch(() => false)) {
      await dormChoice.click();

      // Advance remaining dialogues
      for (let j = 0; j < 10; j++) {
        const continuePrompt = page.getByText(/Click to continue|点击继续/);
        if (await continuePrompt.isVisible({ timeout: 500 }).catch(() => false)) {
          await continuePrompt.click({ force: true });
        } else {
          break;
        }
      }
      break;
    }

    const continuePrompt = page.getByText(/Click to continue|点击继续/);
    if (await continuePrompt.isVisible({ timeout: 500 }).catch(() => false)) {
      await continuePrompt.click({ force: true });
    }
  }
}

