import { mkdir } from 'node:fs/promises'
import { chromium } from '@playwright/test'

await mkdir('docs/assets', { recursive: true })
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
})
await page.goto('http://127.0.0.1:4180')
await page.waitForTimeout(1500)
await page.screenshot({ path: 'docs/assets/dashboard-preview.png', fullPage: true })
await browser.close()
