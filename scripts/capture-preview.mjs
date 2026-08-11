import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

await mkdir('docs/assets', { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
})
await page.goto('http://127.0.0.1:4180')
await page.evaluate('localStorage.clear()')
await page.reload()
await page.getByRole('button', { name: /Demo Dashboard/ }).click()
for (let step = 0; step < 3; step += 1) await page.getByRole('button', { name: /Continue/ }).click()
await page.getByRole('button', { name: /Open dashboard/ }).click()
await page.waitForTimeout(800)
await page.screenshot({ path: 'docs/assets/dashboard-preview.png', fullPage: true })
await browser.close()
