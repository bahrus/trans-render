import { test, expect } from '@playwright/test';

test('test1', async ({ page }) => {
  await page.goto('./tests/xtal-editor-test1.html');
  // wait for 10 seconds
  await page.waitForTimeout(10000);
  const editor = page.locator('xtal-editor');
  await expect(editor).toHaveAttribute('mark', 'approved');
});