import { test, expect } from '@playwright/test';

test('Object$tring', async ({ page }) => {
  await page.goto('./tests/Object$tring/Object$tring.html');
  // wait for 1 second
  await page.waitForTimeout(500);
  const editor = page.locator('#target');
  await expect(editor).toHaveAttribute('mark', 'good');
});