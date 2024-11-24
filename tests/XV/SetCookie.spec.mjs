import { test, expect } from '@playwright/test';

test('SetCookie', async ({ page }) => {
  await page.goto('./tests/XV/SetCookie.html');
  // wait for 1 second
  await page.waitForTimeout(1000);
  const editor = page.locator('#target');
  await expect(editor).toHaveAttribute('mark', 'good');
});