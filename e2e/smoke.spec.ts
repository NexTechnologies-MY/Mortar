import { expect, test } from '@playwright/test'

test('sign up, add a note, delete it, sign out', async ({ page }) => {
  const email = `e2e-${Date.now()}@example.com`

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Ship the demo')
  await page.getByRole('link', { name: 'Get started' }).click()

  await page.getByLabel('Name').fill('E2E User')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password').fill('password123')
  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page).toHaveURL(/\/dashboard$/)

  await page.getByLabel('Title').fill('First note')
  await page.getByLabel('Details').fill('Created by the smoke test')
  await page.getByRole('button', { name: 'Add Note' }).click()
  await expect(page.getByRole('heading', { name: 'First note' })).toBeVisible()
  await expect(page.getByLabel('Title')).toHaveValue('')

  await page.getByRole('button', { name: 'Delete First note' }).click()
  await page.getByRole('button', { name: 'Confirm Delete' }).click()
  await expect(page.getByText('No notes yet')).toBeVisible()

  await page.getByRole('button', { name: 'Sign Out' }).click()
  await expect(page).toHaveURL('/')
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()
})

test('anonymous visitors are sent to sign-in', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/sign-in$/)
})
