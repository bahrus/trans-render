import { test, expect } from '@playwright/test';

test('dss/AllTests', async ({ page }) => {
  await page.goto('./tests/dss/AllTests.html');
  // wait for 1 second
  await page.waitForTimeout(500);
  const editor = page.locator('#target');
  await expect(editor).toHaveAttribute('mark', 'good');
});