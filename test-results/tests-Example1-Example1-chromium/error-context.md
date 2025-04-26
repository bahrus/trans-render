# Test info

- Name: Example1
- Location: C:\git\trans-render\tests\Example1.spec.mjs:3:1

# Error details

```
Error: Timed out 5000ms waiting for expect(locator).toHaveAttribute(expected)

Locator: locator('#target')
Expected string: "good"
Received string: ""
Call log:
  - expect.toHaveAttribute with timeout 5000ms
  - waiting for locator('#target')
    9 × locator resolved to <div id="target"></div>
      - unexpected value "null"

    at C:\git\trans-render\tests\Example1.spec.mjs:8:24
```

# Page snapshot

```yaml
- text: bye bye
```

# Test source

```ts
  1 | import { test, expect } from '@playwright/test';
  2 |
  3 | test('Example1', async ({ page }) => {
  4 |   await page.goto('./tests/Example1.html');
  5 |   // wait for 1 second
  6 |   await page.waitForTimeout(2000);
  7 |   const editor = page.locator('#target');
> 8 |   await expect(editor).toHaveAttribute('mark', 'good');
    |                        ^ Error: Timed out 5000ms waiting for expect(locator).toHaveAttribute(expected)
  9 | });
```