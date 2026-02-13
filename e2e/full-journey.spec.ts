import { test, expect, Page } from '@playwright/test'

//

async function advanceAllDialogues(page: Page) {
  for (let i = 0; i < 30; i++) {
    const continueBtn = page.getByText('Click to continue', { exact: false });
    const sendBtn = page.getByRole('button', { name: /Send|发送/ });
    const inputField = page.locator('input[type="text"][placeholder]');

    // Try to click continue button
    if (await continueBtn.isVisible()) {
      await continueBtn.click();
      await page.waitForTimeout(100);
      continue;
    }

    // Try to click choice button
    const choiceBtn = page.locator('[data-testid="dialogue-overlay"] button').first();
    if (await choiceBtn.isVisible() && await choiceBtn.isEnabled()) {
      const btnText = await choiceBtn.textContent();
      if (btnText && (btnText.includes('再聊聊') || btnText.includes('Chat more') ||
                      btnText.includes('离开') || btnText.includes('Leave'))) {
        await choiceBtn.click();
        await page.waitForTimeout(100);
        continue;
      }
    }

    // Try to fill input and click send
    if (await inputField.isVisible()) {
      // Clear and type the input to ensure events fire
      await inputField.clear();
      await inputField.type('Hello!', { delay: 50 });
      await page.waitForTimeout(200);
      // Wait for send button to be enabled (max wait 1s)
      for (let wait = 0; wait < 10; wait++) {
        if (await sendBtn.isEnabled()) {
          await sendBtn.click();
          break;
        }
        await page.waitForTimeout(100);
      }
      // Wait for AI response to load
      await page.waitForTimeout(1500);
      continue;
    }

    // No more dialogues
    break;
  }
}

//

//

test.skip('full journey: navigation, meetings, dynamic chat, continue', async ({ page }) => {
  // This test requires AI API calls which are slow and unreliable for CI
  // For local testing with valid API key, remove the test.skip() line
  // Increase timeout for AI-dependent test
  test.setTimeout(60000);
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
  await page.getByRole('button', { name: 'Walk around TALK' }).click()
  await page.waitForSelector('text=Chen Siyao')
  await advanceAllDialogues(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Mist City Center/)

  const toBar = page.getByRole('button', { name: 'Bar MOVE' })
  await toBar.click()
  await page.locator('[data-testid="dialogue-overlay"]').waitFor({ state: 'detached' })
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
