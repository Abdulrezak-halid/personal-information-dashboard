import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

test('creates a deterministic demo dashboard', async ({ page }) => {
  await expect(page.getByText('How do you want to start?')).toBeVisible()
  await page.getByRole('button', { name: /Demo Dashboard/ }).click()
  await page.getByRole('button', { name: /Continue/ }).click()
  await expect(page.getByText('Choose initial widgets')).toBeVisible()
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.getByRole('button', { name: /Open dashboard/ }).click()
  await expect(page.getByText('System efficiency')).toBeVisible()
  await expect(page.getByText('Demo data').first()).toBeVisible()
})

test('blank mode opens an editable empty canvas', async ({ page }) => {
  await page.getByRole('button', { name: /Blank Dashboard/ }).click()
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.getByRole('button', { name: /Continue/ }).click()
  await page.getByRole('button', { name: /Open dashboard/ }).click()
  await expect(page.getByText('Your canvas is ready')).toBeVisible()
  await page
    .getByRole('button', { name: /Add Widget/i })
    .first()
    .click()
  await expect(page.getByRole('dialog')).toContainText('Clock')
})
