import { test, expect } from '@playwright/test';

test('Example2a', async ({ page }) => {
  await page.goto('./tests/Example2a.html');
  // wait for 1 second
  await page.waitForTimeout(6000);
  const editor = page.locator('#target');
  await expect(editor).toHaveAttribute('mark', 'good');
});