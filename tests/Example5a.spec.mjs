import { test, expect } from '@playwright/test';

test('Example5a', async ({ page }) => {
  await page.goto('./tests/Example5a.html');
  // wait for 1 second
  await page.waitForTimeout(2000);
  const editor = page.locator('#target');
  await expect(editor).toHaveAttribute('mark', 'good');
});