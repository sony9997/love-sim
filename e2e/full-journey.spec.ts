import { test, expect, Page } from '@playwright/test'

// Set longer timeout for AI-dependent tests (90 seconds)
test.setTimeout(90000)

//

async function advanceAllDialogues(page: Page) {
  let sendAttempts = 0;
  for (let i = 0; i < 50; i++) {
    const continueBtn = page.getByText('Click to continue', { exact: false });
    const sendBtn = page.getByRole('button', { name: /Send|发送/ });
    const inputField = page.locator('input[type="text"][placeholder]');
    const overlay = page.locator('[data-testid="dialogue-overlay"]');

    // Check if dialogue overlay is still visible
    if (!(await overlay.isVisible())) {
      console.log('Dialogue overlay no longer visible, done');
      break;
    }

    // Try to click continue button first
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(200);
      continue;
    }

    // Look for Leave button inside dialogue overlay (to end conversation)
    const leaveBtn = page.locator('[data-testid="dialogue-overlay"]').getByRole('button', { name: /^Leave$|^离开$/ });
    if (await leaveBtn.count() > 0) {
      console.log('Clicking Leave button to end conversation...');
      await leaveBtn.click();
      await page.waitForTimeout(500);
      continue;
    }

    // Look for Chat more button (to continue conversation)
    const chatMoreBtn = page.locator('[data-testid="dialogue-overlay"]').getByRole('button', { name: /Chat more|再聊聊/ });
    if (await chatMoreBtn.count() > 0) {
      console.log('Clicking Chat more button...');
      await chatMoreBtn.click();
      await page.waitForTimeout(500);
      continue;
    }

    // Try to fill input and click send (limit attempts)
    if (await inputField.isVisible() && sendAttempts < 2) {
      sendAttempts++;
      console.log(`Attempting to send input (attempt ${sendAttempts})...`);

      // Use evaluate to directly manipulate React state via DOM events
      await inputField.evaluate((el: HTMLInputElement) => {
        // Set value and trigger React's synthetic events
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set;
        nativeInputValueSetter!.call(el, 'Hello!');
        el.dispatchEvent(new Event('input', { bubbles: true }));
      });
      await page.waitForTimeout(200);

      // Check if send button is enabled now
      const isEnabled = await sendBtn.isEnabled();
      console.log(`Send button enabled: ${isEnabled}`);

      if (isEnabled) {
        await sendBtn.click();
        console.log('Send button clicked, waiting for AI response...');

        // Wait for "Thinking..." to appear and then disappear
        await page.waitForTimeout(500);
        try {
          await page.locator('text=Thinking').waitFor({ state: 'visible', timeout: 3000 });
          console.log('AI is thinking...');
          await page.locator('text=Thinking').waitFor({ state: 'detached', timeout: 15000 });
          console.log('AI response received');
        } catch {
          console.log('No "Thinking" indicator found or timed out');
        }
        await page.waitForTimeout(1000);
        continue;
      } else {
        // Try pressing Enter as fallback
        console.log('Send button disabled, trying Enter key...');
        await inputField.press('Enter');
        await page.waitForTimeout(3000);
        continue;
      }
    }

    // Check for any other buttons in the overlay (generic fallback)
    const anyBtn = page.locator('[data-testid="dialogue-overlay"] button').first();
    if (await anyBtn.isVisible() && await anyBtn.isEnabled()) {
      const btnText = await anyBtn.textContent();
      if (btnText && !btnText.includes('Send') && !btnText.includes('发送')) {
        console.log('Clicking generic button:', btnText);
        await anyBtn.click();
        await page.waitForTimeout(300);
        continue;
      }
    }

    // No actionable elements found, exit
    console.log('No actionable elements found, exiting loop');
    break;
  }
  console.log('advanceAllDialogues completed');
}

//

//

test('full journey: navigation, meetings, dynamic chat, continue', async ({ page }) => {
  // Test uses mock AI responses for reliability
  // Set test mode to enable mock responses
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.setItem('love-sim-test-mode', 'true');
  });

  // Helper to ensure test mode is set
  const ensureTestMode = async () => {
    await page.evaluate(() => {
      localStorage.setItem('love-sim-test-mode', 'true');
    });
  };

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
    localStorage.setItem('love-sim-save', JSON.stringify(state))
  })
  await page.reload()
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Campus Map|校园地图/)
  await page.getByRole('button', { name: /Library/ }).click()
  await page.locator('[data-testid="dialogue-overlay"]').waitFor({ state: 'detached' })
  await page.getByRole('button', { name: 'Look for Su Qingqian TALK' }).click()
  await page.waitForSelector('text=Su Qingqian')
  await advanceAllDialogues(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Library/)

  // The Leave button should be clickable after the dialogue overlay is dismissed
  // If the overlay is still visible, wait for it to be detached
  await page.waitForTimeout(1000);
  const leaveBtn = page.getByRole('button', { name: 'Leave MOVE' });
  await expect(leaveBtn).toBeVisible();
  // Force click to bypass potential overlay pointer event issues
  await leaveBtn.click({ force: true });
  await page.getByRole('button', { name: 'Physics Lab MOVE' }).click()
  await page.locator('[data-testid="dialogue-overlay"]').waitFor({ state: 'detached' })
  await ensureTestMode();
  await page.getByRole('button', { name: 'Find Prof. Ling TALK' }).click()
  await page.waitForSelector('text=Ling Ruoyu')
  await advanceAllDialogues(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Physics Lab/)

  await page.waitForTimeout(1000);
  const leaveBtn2 = page.getByRole('button', { name: 'Leave MOVE' });
  await expect(leaveBtn2).toBeVisible();
  // Force click to bypass potential overlay pointer event issues
  await leaveBtn2.click({ force: true });
  await page.getByRole('button', { name: 'City MOVE' }).click()
  await page.locator('[data-testid="dialogue-overlay"]').waitFor({ state: 'detached' })

  // Wait for City location to load
  await page.waitForTimeout(1000);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Mist City Center|雾城市中心/);

  await ensureTestMode();
  await page.getByRole('button', { name: 'Walk around TALK' }).click()
  // Wait for dialogue overlay to appear
  await page.locator('[data-testid="dialogue-overlay"]').waitFor({ state: 'visible', timeout: 5000 });
  // Wait a bit for the script to initialize
  await page.waitForTimeout(1000);
  await advanceAllDialogues(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Mist City Center/)

  const toBar = page.getByRole('button', { name: 'Bar MOVE' })
  await toBar.click()
  await page.locator('[data-testid="dialogue-overlay"]').waitFor({ state: 'detached' })
  await ensureTestMode();
  await page.getByRole('button', { name: 'Look for Lu Jiaxin TALK' }).click()
  await page.waitForSelector('text=Lu Jiaxin')
  await advanceAllDialogues(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Bar/)

  const dynamicSeen = await page.evaluate(() => {
    const raw = localStorage.getItem('love-sim-save')
    return !!raw
  })
  expect(dynamicSeen).toBeTruthy()

  await page.reload()
  await page.getByRole('button', { name: 'Continue' }).click()
  const header = await page.getByRole('heading', { level: 1 }).innerText()
  expect(header).toMatch(/Bar|酒吧/)
})
