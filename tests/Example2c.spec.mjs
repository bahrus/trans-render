import { test, expect } from '@playwright/test';

test('Example2c', async ({ page }) => {
  await page.goto('./tests/Example2c.html');
  // wait for 1 second
  await page.waitForTimeout(2000);
  const editor = page.locator('#target');
  await expect(editor).toHaveAttribute('mark', 'good');
});