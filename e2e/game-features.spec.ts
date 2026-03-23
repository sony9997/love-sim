import { test, expect } from '@playwright/test';

import {
  enableTestMode,
  clearGameState,
  setGameState,
  getGameState,
  loadGameState,
  advanceDialogues,
  completePrologue,
  createGameState,
  LOCATIONS,
  CHARACTER_IDS,
} from './test-helpers';

/**
 * E2E Tests for Game Features
 *
 * Tests:
 * 1. New Game Flow - Start game, verify prologue begins
 * 2. Character Dialogue Interaction - Navigate to character, trigger dialogue
 * 3. Save/Load System - Verify persistence and restoration
 * 4. Map Navigation and Exploration - Move between locations, verify time advances
 */

test.setTimeout(90000);

// ==========================================
// Test Suite 1: New Game Flow
// ==========================================
test.describe('New Game Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearGameState(page);
    await enableTestMode(page);
  });

  test('should display main menu with correct options', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Love Sim' })).toBeVisible();

    const newGameBtn = page.getByRole('button', { name: /New Game|开始游戏/ });
    await expect(newGameBtn).toBeVisible();
    await expect(newGameBtn).toBeEnabled();

    const continueBtn = page.getByRole('button', { name: /Continue|继续/ });
    await expect(continueBtn).toBeVisible();
    await expect(continueBtn).toBeDisabled();
  });

  test('should start new game and enter playing phase', async ({ page }) => {
    await page.getByRole('button', { name: /New Game|开始游戏/ }).click();

    const dialogueOverlay = page.getByTestId('dialogue-overlay');
    await expect(dialogueOverlay).toBeVisible({ timeout: 10000 });

    const prologueText = page.getByText(/September 1st|9月1日|arrived|到了/);
    await expect(prologueText.first()).toBeVisible({ timeout: 10000 });
  });

  test('should display prologue script correctly', async ({ page }) => {
    await page.getByRole('button', { name: /New Game|开始游戏/ }).click();

    const dialogueOverlay = page.getByTestId('dialogue-overlay');
    await expect(dialogueOverlay).toBeVisible({ timeout: 10000 });

    const prologueText = dialogueOverlay.getByText(
      /September 1st|9月1日|finally arrived|到了雾城大学|freshman|大一新生/
    );
    await expect(prologueText.first()).toBeVisible({ timeout: 10000 });

    const continuePrompt = dialogueOverlay.getByText(/Click to continue|点击继续/);
    await expect(continuePrompt).toBeVisible({ timeout: 5000 });
  });

  test('should show initial player stats after prologue', async ({ page }) => {
    await page.getByRole('button', { name: /New Game|开始游戏/ }).click();
    await completePrologue(page);

    await expect(page.getByText(/1000/)).toBeVisible({ timeout: 10000 });

    const heading = page.getByRole('heading', { level: 1 });
    await expect(heading).toBeVisible();
    expect(await heading.innerText()).toMatch(/Dorm|宿舍/);
  });

  test('should allow language switching on main menu', async ({ page }) => {
    const langBtn = page.getByRole('button', { name: /English|中文/ });
    await expect(langBtn).toBeVisible();

    const initialLang = await langBtn.innerText();
    await langBtn.click();

    const newLang = await langBtn.innerText();
    expect(newLang).not.toBe(initialLang);
  });
});

// ==========================================
// Test Suite 2: Character Dialogue Interaction
// ==========================================
test.describe('Character Dialogue Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearGameState(page);
    await enableTestMode(page);
  });

  test('should navigate to library and find Su Qingqian', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.CAMPUS,
        hour: 14,
        agentStatesFull: true,
        flags: { prologue_completed: true },
      })
    );

    await page.getByRole('button', { name: /Library|图书馆/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Library|图书馆/);

    const talkBtn = page.getByRole('button', { name: /Look for Su Qingqian|找苏清浅/ });
    await expect(talkBtn).toBeVisible();
    await talkBtn.click();

    await expect(page.getByTestId('dialogue-overlay')).toBeVisible({ timeout: 10000 });
  });

  test('should display dialogue options after character interaction', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.LIBRARY,
        hour: 14,
        relationships: {
          [CHARACTER_IDS.SU_QINGQIAN]: { affection: 20, status: 'acquaintance', eventsSeen: [] },
        },
        agentStatesFull: true,
        flags: { met_su_qingqian: true, prologue_completed: true },
      })
    );

    await page.getByRole('button', { name: /Look for Su Qingqian|找苏清浅/ }).click();

    const dialogueOverlay = page.getByTestId('dialogue-overlay');
    await expect(dialogueOverlay).toBeVisible({ timeout: 15000 });
    await expect(
      dialogueOverlay.getByText(/Test response|测试响应|Hello/).first()
    ).toBeVisible({ timeout: 10000 });

    const continuePrompt = page.getByText(/Click to continue|点击继续/);
    if (await continuePrompt.isVisible({ timeout: 500 }).catch(() => false)) {
      await continuePrompt.click({ force: true });
    }

    const chatMoreBtn = dialogueOverlay.getByRole('button', { name: /Chat more|再聊聊/ });
    const leaveBtn = dialogueOverlay.getByRole('button', { name: /^Leave$|^离开$/ });

    const hasChatMore = await chatMoreBtn.isVisible().catch(() => false);
    const hasLeave = await leaveBtn.isVisible().catch(() => false);
    expect(hasChatMore || hasLeave).toBe(true);
  });

  test('should allow player to input text during dialogue', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.STUDENT_COUNCIL,
        hour: 14,
        agentStatesFull: true,
        flags: { prologue_completed: true },
        currentScriptId: 'meet_su_qingqian',
      })
    );

    const dialogueOverlay = page.getByTestId('dialogue-overlay');
    await expect(dialogueOverlay).toBeVisible({ timeout: 10000 });

    await advanceDialogues(page, { maxIterations: 5 });

    const inputField = page.locator('input[type="text"][placeholder]');
    if (await inputField.isVisible()) {
      await inputField.fill('Hello, President!');
      const sendBtn = page.getByRole('button', { name: /Send|发送/ });
      await expect(sendBtn).toBeEnabled();
      await sendBtn.click();
    }
  });

  test('should exit conversation when choosing Leave option', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.LIBRARY,
        hour: 14,
        relationships: {
          [CHARACTER_IDS.SU_QINGQIAN]: { affection: 10, status: 'stranger', eventsSeen: [] },
        },
        agentStatesFull: true,
        flags: { met_su_qingqian: true, prologue_completed: true },
      })
    );

    await page.getByRole('button', { name: /Look for Su Qingqian|找苏清浅/ }).click();

    const dialogueOverlay = page.getByTestId('dialogue-overlay');
    await expect(dialogueOverlay).toBeVisible({ timeout: 15000 });

    // Wait for AI response
    const continuePrompt = page.getByText(/Click to continue|点击继续/);
    if (await continuePrompt.isVisible({ timeout: 500 }).catch(() => false)) {
      await continuePrompt.click({ force: true });
    }

    const leaveBtn = dialogueOverlay.getByRole('button', { name: /^Leave$|^离开$/ });
    if (await leaveBtn.isVisible()) {
      await leaveBtn.click();
      await expect(dialogueOverlay).toBeHidden({ timeout: 5000 });
    }
  });
});

// ==========================================
// Test Suite 3: Save/Load System
// ==========================================
test.describe('Save/Load System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearGameState(page);
    await enableTestMode(page);
  });

  test('should auto-save game state to localStorage', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.DORM,
        hour: 9,
        flags: { prologue_completed: true },
      })
    );

    // Navigate: dorm -> campus -> library
    await page.getByRole('button', { name: /Leave|离开/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Campus Map|校园地图/);

    await page.getByRole('button', { name: /Library|图书馆/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Library|图书馆/);

    const savedState = await getGameState(page);
    expect(savedState).not.toBeNull();
    expect(savedState!.player.location).toBe(LOCATIONS.LIBRARY);
  });

  test('should enable Continue button when save exists', async ({ page }) => {
    await setGameState(
      page,
      createGameState({
        location: LOCATIONS.BAR,
        day: 3,
        hour: 21,
        weekday: 2,
        stats: { intelligence: 25, charm: 30, fitness: 15, money: 500 },
        relationships: {
          [CHARACTER_IDS.SU_QINGQIAN]: { affection: 50, status: 'acquaintance', eventsSeen: [] },
          [CHARACTER_IDS.LU_JIAXIN]: { affection: 30, status: 'stranger', eventsSeen: [] },
        },
        flags: { prologue_completed: true, met_su_qingqian: true },
      })
    );

    await page.reload();
    await expect(page.getByRole('button', { name: /Continue|继续/ })).toBeEnabled();
  });

  test('should restore game state when loading save', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.LAB,
        day: 5,
        hour: 15,
        weekday: 4,
        stats: { intelligence: 40, charm: 35, fitness: 20, money: 2000 },
        relationships: {
          [CHARACTER_IDS.SU_QINGQIAN]: { affection: 100, status: 'friend', eventsSeen: ['event_1'] },
          [CHARACTER_IDS.CHEN_SIYAO]: { affection: 50, status: 'acquaintance', eventsSeen: [] },
          [CHARACTER_IDS.LING_RUOYU]: { affection: 75, status: 'friend', eventsSeen: [] },
        },
        flags: { prologue_completed: true, met_su_qingqian: true, met_ling_ruoyu: true },
      })
    );

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Physics Lab|物理实验室/);
    await expect(page.getByText(/Day 5|第 5 天/)).toBeVisible();
    await expect(page.getByText(/2000/)).toBeVisible();
  });

  test('should persist state across page reloads', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.DORM,
        hour: 8,
        flags: { prologue_completed: true },
      })
    );

    await page.getByRole('button', { name: /Leave|离开/ }).click();
    const stateBeforeReload = await getGameState(page);

    await page.reload();
    await page.getByRole('button', { name: /Continue|继续/ }).click();

    const stateAfterReload = await getGameState(page);
    expect(stateAfterReload!.player.location).toBe(stateBeforeReload!.player.location);
    expect(stateAfterReload!.time.day).toBe(stateBeforeReload!.time.day);
  });

  test('should start fresh when no save exists', async ({ page }) => {
    await clearGameState(page);
    await page.reload();

    const continueBtn = page.getByRole('button', { name: /Continue|继续/ });
    await expect(continueBtn).toBeDisabled();

    const newGameBtn = page.getByRole('button', { name: /New Game|开始游戏/ });
    await expect(newGameBtn).toBeEnabled();
  });
});

// ==========================================
// Test Suite 4: Map Navigation and Exploration
// ==========================================
test.describe('Map Navigation and Exploration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearGameState(page);
    await enableTestMode(page);
  });

  test('should display current location name and description', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.DORM,
        hour: 10,
        flags: { prologue_completed: true },
      })
    );

    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Dorm Room|宿舍/);
    await expect(page.getByText(/small but cozy|小窝/)).toBeVisible();
  });

  test('should navigate from dorm to campus map', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.DORM,
        hour: 10,
        flags: { prologue_completed: true },
      })
    );

    await page.getByRole('button', { name: /Leave|离开/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Campus Map|校园地图/);
  });

  test('should display available interactables at each location', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.CAMPUS,
        hour: 12,
        flags: { prologue_completed: true },
      })
    );

    await expect(page.getByRole('button', { name: /Dorm|宿舍/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Library|图书馆/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Classroom|教室/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /City|市区/ })).toBeVisible();

    const moveButtons = page.getByText('MOVE');
    expect(await moveButtons.count()).toBeGreaterThan(3);
  });

  test('should advance time when moving between locations', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.DORM,
        hour: 10,
        flags: { prologue_completed: true },
      })
    );

    const initialTime = await getGameState(page);
    const initialHour = initialTime!.time.hour;

    await page.getByRole('button', { name: /Leave|离开/ }).click();

    const updatedTime = await getGameState(page);
    expect(updatedTime!.time.hour).toBeGreaterThanOrEqual(initialHour + 0.5);
  });

  test('should navigate to city and access bar location', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.CAMPUS,
        hour: 20,
        flags: { prologue_completed: true },
      })
    );

    await page.getByRole('button', { name: /City|市区/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Mist City Center|雾城市中心/);

    await page.getByRole('button', { name: /Bar|酒吧/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Bar|酒吧/);
    await expect(page.getByRole('button', { name: /Lu Jiaxin|陆嘉欣/ })).toBeVisible();
  });

  test('should navigate to physics lab and find Ling Ruoyu', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.CAMPUS,
        hour: 14,
        flags: { prologue_completed: true },
      })
    );

    await page.getByRole('button', { name: /Physics Lab|物理实验室/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Physics Lab|物理实验室/);
    await expect(page.getByRole('button', { name: /Prof\. Ling|凌教授/ })).toBeVisible();
  });

  test('should show TALK action for character interactions', async ({ page }) => {
    await loadGameState(
      page,
      createGameState({
        location: LOCATIONS.LIBRARY,
        hour: 14,
        flags: { prologue_completed: true },
      })
    );

    const talkButton = page.getByRole('button', { name: /Look for Su Qingqian|找苏清浅/ });
    await expect(talkButton).toBeVisible();

    const parent = talkButton.locator('..');
    await expect(parent.getByText('TALK')).toBeVisible();
  });
});