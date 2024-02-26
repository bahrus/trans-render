import { test, expect } from '@playwright/test';

test('Example8g', async ({ page }) => {
  await page.goto('./tests/Example8g.html');
  // wait for 1 second
  await page.waitForTimeout(2000);
  const editor = page.locator('#target');
  await expect(editor).toHaveAttribute('mark', 'good');
});