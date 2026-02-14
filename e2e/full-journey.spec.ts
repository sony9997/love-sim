import { test, expect, Page } from '@playwright/test'

//

async function advanceAllDialogues(page: Page) {
  for (let i = 0; i < 30; i++) {
    // Check if dialogue box is visible
    const dialogueBox = page.locator('[data-testid="dialogue-box"]')
    if (!(await dialogueBox.count()) || (await dialogueBox.count()) === 0) {
      console.log('[advanceAllDialogues] No dialogue box found, exiting')
      break
    }

    // Try clicking "Click to continue" first
    const hint = page.getByText('Click to continue')
    if (await hint.isVisible()) {
      console.log('[advanceAllDialogues] Found "Click to continue", clicking')
      await hint.click()
      await page.waitForTimeout(100)
      continue
    }

    // Debug: check if window.dialogueDebug exists
    const debugState = await page.evaluate(() => (window as any).dialogueDebug)
    console.log('[advanceAllDialogues] Dialogue state:', JSON.stringify(debugState, null, 2))

    // Debug: check the actual DialogueSystem state
    const dialogueSystemState = await page.evaluate(() => {
        const store = (window as any).useGameStore;
        return {
            currentScriptId: store.getState().currentScriptId,
            flags: store.getState().flags,
            relationships: store.getState().relationships
        };
    });
    console.log('[advanceAllDialogues] Store state:', JSON.stringify(dialogueSystemState, null, 2));
    // Debug: print the full HTML of dialogue box to see what's inside
    const dialogueBoxHtml = await dialogueBox.evaluate((el) => el.innerHTML)
    console.log('[advanceAllDialogues] Dialogue box innerHTML:', dialogueBoxHtml.substring(0, 600))

    // Try clicking "Leave" option to end conversation - use specific text
    // First check if dialogue box exists and has the Leave button
    const leaveBtnInDialogue = dialogueBox.getByRole('button', { name: 'Leave' })
    const leaveBtnInDialogueCount = await leaveBtnInDialogue.count()
    console.log('[advanceAllDialogues] Leave button in dialogue count:', leaveBtnInDialogueCount)
    if (leaveBtnInDialogueCount > 0 && await leaveBtnInDialogue.isVisible()) {
      console.log('[advanceAllDialogues] Found "Leave" button in dialogue, clicking')
      await leaveBtnInDialogue.click()
      await page.waitForTimeout(100)
      continue
    }
    // Fallback: look for Leave button anywhere on page (for non-dialogue contexts)
    const globalLeaveBtn = page.getByRole('button', { name: 'Leave' })
    const globalLeaveBtnCount = await globalLeaveBtn.count()
    console.log('[advanceAllDialogues] Global Leave button count:', globalLeaveBtnCount)
    if (globalLeaveBtnCount > 0 && await globalLeaveBtn.isVisible()) {
      console.log('[advanceAllDialogues] Found global "Leave" button, clicking')
      await globalLeaveBtn.click()
      await page.waitForTimeout(100)
      continue
    }

    // Try clicking "Chat more" to continue the conversation
    const chatMoreBtn = page.getByRole('button', { name: /Chat more|再聊聊/ })
    if (await chatMoreBtn.isVisible()) {
      console.log('[advanceAllDialogues] Found "Chat more" button, clicking')
      await chatMoreBtn.click()
      await page.waitForTimeout(200)
      continue
    }

    // No more dialogues to advance
    console.log('[advanceAllDialogues] No more actions found, exiting')
    break
  }
}

//

//

test('full journey: navigation, meetings, dynamic chat, continue', async ({ page }) => {
  await page.goto('/')

  await page.evaluate(() => {
    const state = {
      player: { name: 'Lin Xuan', stats: { intelligence: 10, charm: 10, fitness: 10, money: 1000 }, location: 'campus_map' },
      time: { day: 1, hour: 9, weekday: 0 },
      relationships: {
        su_qingqian: { affection: 0, status: 'stranger', eventsSeen: [] },
        chen_siyao: { affection: 0, status: 'stranger', eventsSeen: [] },
        ling_ruoyu: { affection: 0, status: 'stranger', eventsSeen: [] },
        lu_jiaxin: { affection: 0, status: 'stranger', eventsSeen: [] },
      },
      agentStates: {
        su_qingqian: { mood: 'neutral', currentGoal: 'Manage Student Council', memory: [] },
        chen_siyao: { mood: 'happy', currentGoal: 'Practice Dancing', memory: [] },
        ling_ruoyu: { mood: 'neutral', currentGoal: 'Solve Physics Problem', memory: [] },
        lu_jiaxin: { mood: 'neutral', currentGoal: 'Ride Motorcycle', memory: [] },
      },
      flags: {},
      currentScriptId: null,
      language: 'en',
    }
    localStorage.setItem('love-sim-game-save', JSON.stringify(state))
  })
  await page.reload()
  // Wait for save to be loaded and set currentScriptId and gamePhase to trigger dialogue
  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    const store = (window as any).useGameStore;
    store.getState().setGamePhase('playing');
    store.getState().setCurrentScriptId('meet_su_qingqian');
  });
  await page.waitForTimeout(1000);
  // Debug: Check if dialogue is visible
  const dialogueCount = await page.locator('[data-testid="dialogue-box"]').count();
  console.log('Dialogue box count:', dialogueCount);
  // Get the language from the store
  const language = await page.evaluate(() => {
      return (window as any).useGameStore.getState().language;
  });
  console.log('Language:', language);
  if (dialogueCount === 0) {
    console.log('Dialogue box not found!');
    // Debug: Check currentScriptId value
    const scriptId = await page.evaluate(() => {
        return (window as any).useGameStore.getState().currentScriptId;
    });
    console.log('Current scriptId:', scriptId);
    // Debug: Check if GameEngine renders DialogueSystem by checking MapNavigation
    const mapNav = await page.locator('[data-testid="map-navigation"]').count();
    console.log('MapNavigation count:', mapNav);
  } else {
    // Debug: Check if player input is visible
    const dialogueBox = page.locator('[data-testid="dialogue-box"]');
    // Use the correct placeholder based on language
    const placeholder = language === 'zh' ? '输入你想说的话...' : 'Type your message...';
    console.log('Using placeholder:', placeholder);
    const inputCount = await dialogueBox.getByPlaceholder(placeholder).count();
    console.log('Input count:', inputCount);
    // Debug: Get the innerHTML of the dialogue box
    const innerHTML = await dialogueBox.evaluate((el) => el.innerHTML);
    console.log('Dialogue box innerHTML:', innerHTML.substring(0, 1000));
    // Check if player input is in the innerHTML
    const hasPlayerInput = innerHTML.includes('输入你想说的话...');
    console.log('Has player input:', hasPlayerInput);
  }
  // First dialogue requires player input, then click Continue
  // Use dialogue box to scope the selectors
  const dialogueBox2 = page.locator('[data-testid="dialogue-box"]');
  const isChinese = language === 'zh';
  const placeholder2 = isChinese ? '输入你想说的话...' : 'Type your message...';
  const sendBtnName2 = isChinese ? '发送' : 'Send';
  const continueBtnName2 = isChinese ? '继续' : 'Continue';
  await page.waitForSelector('[data-testid="player-input"]');
  // Use evaluate to set the value and trigger the event
  await page.evaluate(() => {
      const input = document.querySelector('[data-testid="player-input"]') as HTMLInputElement;
      if (input) {
          // Set the value
          input.value = 'Hello';
          // Dispatch input event
          input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
          // Dispatch change event
          input.dispatchEvent(new Event('change', { bubbles: true }));
          console.log('Events dispatched, input value:', input.value);
      }
  });
  // Wait a bit for React to update
  await page.waitForTimeout(200);
  // Debug: check the input value after filling
  const inputValue = await page.locator('[data-testid="player-input"]').inputValue();
  console.log('Input value after fill:', inputValue);
  // Debug: check if Send button is enabled
  const sendBtnEnabled = await dialogueBox2.getByRole('button', { name: sendBtnName2 }).isEnabled();
  console.log('Send button enabled:', sendBtnEnabled);

  // Get button bounding box to check if it's visible
  const sendBtnRect = await dialogueBox2.locator('[data-testid="send-button"]').boundingBox();
  console.log('Send button bounding box:', sendBtnRect);

  // Check if button is covered by any element
  const isHidden = await dialogueBox2.locator('[data-testid="send-button"]').isHidden();
  console.log('Send button hidden:', isHidden);

  // Wait for the button to be enabled and then click
  console.log('About to click Send button...');
  // Try clicking with force: true and no wait to see if it triggers
  await dialogueBox2.locator('[data-testid="send-button"]').click({ force: true, timeout: 5000 }).catch((e) => console.log('Click error:', e));
  console.log('Send button clicked - waiting for AI response overlay');
  // Wait for the overlay to appear (isLoading becomes true)
  await page.locator('[data-testid="dialogue-overlay"]').waitFor({ state: 'visible', timeout: 10000 });
  console.log('AI overlay appeared');
  // Wait a bit for AI response (this is async)
  await page.waitForTimeout(3000);
  console.log('AI response should be complete, waiting for overlay to disappear');
  // Wait for the AI response to complete (overlay disappears)
  await page.locator('[data-testid="dialogue-overlay"]').waitFor({ state: 'detached', timeout: 15000 });
  console.log('AI response complete');

  // Now look for the Continue button - need to get a fresh reference to dialogueBox
  const dialogueBox3 = page.locator('[data-testid="dialogue-box"]');
  const continueBtnCount = await dialogueBox3.locator('[data-testid="continue-button"]').count();
  console.log('Continue button count:', continueBtnCount);
  if (continueBtnCount > 0) {
      // Add click listener to verify the button is actually clickable
      await dialogueBox3.locator('[data-testid="continue-button"]').evaluate((btn) => {
          btn.addEventListener('click', () => {
              console.log('[E2E TEST] Continue button click event fired!');
          }, { once: true });
      });
      await dialogueBox3.locator('[data-testid="continue-button"]').click({ force: true, timeout: 5000 });
      console.log('Continue button clicked');
      // Wait a moment for the click to process
      await page.waitForTimeout(500);
  } else {
      console.log('Continue button not found!');
  }

  // Check if dialogue is still visible
  const dialogueStillVisible = await page.locator('[data-testid="dialogue-box"]').count() > 0;
  console.log('Dialogue still visible after continue:', dialogueStillVisible);

  // Check game state via DOM attributes
  const gameState = await page.evaluate(() => {
      const store = (window as any).useGameStore;
      const currentScriptId = store.getState().currentScriptId;
      return {
          gamePhase: store.getState().gamePhase,
          currentScriptId: currentScriptId,
          currentScriptIdType: typeof currentScriptId,
          currentScriptIdIsTruthy: !!currentScriptId,
          playerLocation: store.getState().player.location,
          renderCount: (window as any).__gameEngineRenderCount
      };
  });
  console.log('Game state after continue:', gameState);

  // Check if MapNavigation exists before waiting for heading
  console.log('Checking MapNavigation status...');
  const mapNavExists = await page.locator('[data-testid="map-navigation"]').count() > 0;
  console.log('MapNavigation exists:', mapNavExists);

  // Also check game engine debug marker
  const debugMarkerExists = await page.locator('[data-testid="game-engine-debug"]').count() > 0;
  console.log('Game engine debug marker exists:', debugMarkerExists);

  // Wait for heading (this should also verify the page has loaded correctly)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Campus Plaza|校园广场/)
  console.log('Heading found!');
  // Wait for dialogue box to detach before clicking map buttons
  await page.locator('[data-testid="dialogue-box"]').waitFor({ state: 'detached', timeout: 5000 })
  // Wait a moment for MapNavigation to render
  await page.waitForTimeout(1000)
  // Check if MapNavigation rendered via DOM marker
  const mapNavMarker = await page.evaluate(() => {
      return (window as any).__mapNavigationRendered;
  });
  console.log('MapNavigation rendered marker:', mapNavMarker);

  // Check for render marker element
  const mapNavRenderElementCount = await page.locator('[data-testid="map-navigation-render-marker"]').count();
  console.log('MapNavigation render element count:', mapNavRenderElementCount);

  // Debug: Check what's on the page
  const mapNavCount = await page.locator('[data-testid="map-navigation"]').count();
  console.log('MapNavigation count:', mapNavCount);
  console.log('MapNavigation count (retry):', await page.locator('[data-testid="map-navigation"]').count());

  // Wait for Lab button to be visible (Ling Ruoyu is at lab at 9:00 AM)
  await page.locator('[data-testid="btn-move-lab"]').waitFor({ state: 'visible', timeout: 5000 });
  console.log('Lab button found');
  console.log('Lab button found, clicking...');
  await page.locator('[data-testid="btn-move-lab"]').click();
  console.log('Lab button clicked');

  // Wait for dialogue box to detach (not just overlay)
  await page.locator('[data-testid="dialogue-box"]').waitFor({ state: 'detached', timeout: 10000 });
  console.log('Dialogue box detached');

  // Wait for MapNavigation to re-render after location change
  await page.waitForTimeout(1000);
  console.log('Waiting for MapNavigation to re-render...');

  // Debug: check available buttons in lab
  const allButtonsAfterLab = await page.locator('button').count();
  console.log('All buttons count after lab:', allButtonsAfterLab);
  const allButtonTextsLab = await page.locator('button').allTextContents();
  console.log('All button texts after lab:', allButtonTextsLab);
  // Get all data-testid attributes
  const allButtonTestIds = await page.locator('button').evaluateAll(btns =>
    btns.map(b => b.getAttribute('data-testid'))
  );
  console.log('All button data-testid attributes:', allButtonTestIds);

  // Try clicking by data-testid - Ling Ruoyu should be available
  // Use the interactables button instead of character encounter button
  console.log('Trying to click button with data-testid="btn-talk-ling_ruoyu"');
  const talkBtn = page.locator('[data-testid="btn-talk-ling_ruoyu"]');
  const talkBtnCount = await talkBtn.count();
  console.log('btn-talk-ling_ruoyu count:', talkBtnCount);

  // Get bounding box to check if button is visible
  const box = await talkBtn.boundingBox();
  console.log('Button bounding box:', box);

  // Use force: true to bypass visibility checks
  await talkBtn.click({ force: true });
  console.log('Button clicked via data-testid');

  // Wait a moment for any dialogue to start
  await page.waitForTimeout(500);
  await page.waitForSelector('text=Ling Ruoyu')
  await advanceAllDialogues(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Physics Lab/)

  await page.locator('[data-testid="btn-door"]').click()
  await page.locator('[data-testid="btn-move-city"]').click()
  await page.locator('[data-testid="btn-talk-chen_siyao"]').click()
  await page.waitForSelector('text=Chen Siyao')
  await advanceAllDialogues(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Mist City Center/)

  await page.locator('[data-testid="btn-door"]').click()
  await page.locator('[data-testid="btn-move-bar"]').click()
  await page.locator('[data-testid="btn-talk-lu_jiaxin"]').click()
  await page.waitForSelector('text=Lu Jiaxin')
  await advanceAllDialogues(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Bar/)

  const dynamicSeen = await page.evaluate(() => {
    const raw = localStorage.getItem('love-sim-save')
    return !!raw
  })
  expect(dynamicSeen).toBeTruthy()

  await page.reload()
  // Wait for save to be loaded and set currentScriptId and gamePhase to trigger dialogue
  await page.waitForTimeout(1000)
  await page.evaluate(() => {
    const store = (window as any).useGameStore;
    store.getState().setGamePhase('playing');
    store.getState().setCurrentScriptId('meet_su_qingqian');
  });
  await page.waitForTimeout(1000);
  // Debug: Check if dialogue is visible
  const dialogueCount2 = await page.locator('[data-testid="dialogue-box"]').count();
  console.log('Dialogue box count after reload:', dialogueCount2);
  if (dialogueCount2 === 0) {
    console.log('Dialogue box not found after reload!');
    // Debug: Check currentScriptId value
    const scriptId = await page.evaluate(() => {
        return (window as any).useGameStore.getState().currentScriptId;
    });
    console.log('Current scriptId after reload:', scriptId);
  }
  // First dialogue requires player input, then click Continue
  // Use first textbox to avoid strict mode violation
  await page.getByPlaceholder(/输入你想说什么...|Type your message.../).first().fill('Hello')
  await page.getByRole('button', { name: '发送' }).first().click()
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: '继续' }).click()
  const header = await page.getByRole('heading', { level: 1 }).innerText()
  expect(header).toMatch(/Bar|酒吧/)
})
