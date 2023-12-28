import { test, expect } from '@playwright/test';

test('Example1', async ({ page }) => {
  await page.goto('./tests/Example1.html');
  // wait for 1 second
  await page.waitForTimeout(6000);
  const editor = page.locator('#target');
  await expect(editor).toHaveAttribute('mark', 'good');
});