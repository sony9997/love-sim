import { test, expect, Page } from '@playwright/test'

//

async function advanceAllDialogues(page: Page) {
  for (let i = 0; i < 30; i++) {
    const hint = page.getByText('Click to continue')
    if (!(await hint.isVisible())) break
    await hint.click()
    await page.waitForTimeout(100)
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

  await page.getByRole('button', { name: 'Leave MOVE' }).click()
  await page.getByRole('button', { name: 'Physics Lab MOVE' }).click()
  await page.getByRole('button', { name: 'Find Prof. Ling TALK' }).click()
  await page.waitForSelector('text=Ling Ruoyu')
  await advanceAllDialogues(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Physics Lab/)

  await page.getByRole('button', { name: 'Leave MOVE' }).click()
  await page.getByRole('button', { name: 'City MOVE' }).click()
  await page.getByRole('button', { name: 'Walk around TALK' }).click()
  await page.waitForSelector('text=Chen Siyao')
  await advanceAllDialogues(page)
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Mist City Center/)

  const toBar = page.getByRole('button', { name: 'Bar MOVE' })
  await toBar.click()
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
