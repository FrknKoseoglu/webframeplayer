# Playwright E2E Token Optimization Rules

> **Status:** MANDATORY — These rules apply to ALL current and future E2E tasks performed by any agent on this project.
> **Skill Reference:** `.agents/skills/playwright-cli/SKILL.md`
> **Invocation:** Use `playwright-cli` (or `npx playwright-cli`) for all browser interactions during test development and debugging.

---

## 1. "Compile Time" Execution via Playwright CLI (No Autonomous Crawling)

You are an **E2E Test Writer**, NOT an autonomous web crawler.

- **Rule:** Do NOT use MCP browser tools to dynamically click through the app, dump accessibility trees (AOM), or request base64 screenshots. You must exclusively use the `playwright-cli` skill to run and evaluate tests.
- **Action:** Write deterministic, static Playwright TypeScript code under `src/__tests__/e2e/`. Run tests via the CLI and read the terminal trace/error outputs to fix failures.

### Correct workflow:
```bash
# 1. Write deterministic test code in src/__tests__/e2e/
# 2. Run headless E2E tests via npm script
npm run test:e2e

# 3. If debugging is needed, use playwright-cli ONLY to inspect state
playwright-cli open http://localhost:3000
playwright-cli snapshot --depth=4
playwright-cli close
```

### Prohibited workflow:
```
❌ MCP chrome-devtools-mcp → take_screenshot
❌ MCP chrome-devtools-mcp → get_accessibility_tree (AOM dump)
❌ Looping on "navigate → screenshot → describe" to discover UI
```

---

## 2. API-First State Management (Bypass UI for Setup)

Do not waste tokens and test execution time using the UI to set up state.

- **Rule:** Use backend service helpers or Prisma Client in `beforeAll` / `beforeEach` hooks to seed test data (creating users, items, etc.).
- **Action:** Only use Playwright page actions (`page.click()`, `page.fill()`) for the *exact user flow being tested*, never for setup teardown.

### Example pattern:
```typescript
// ✅ CORRECT: API-first setup
test.beforeAll(async () => {
  const prisma = new PrismaClient();
  await prisma.user.create({ data: { id: TEST_USER_ID, email: 'test@example.com' } });
});

// ❌ WRONG: UI-driven setup
test.beforeAll(async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('create-user-btn').click(); // Never for setup
});
```

---

## 3. Persistent Contexts for Authentication

Do not repeatedly log in via the UI in every test block.

- **Rule:** Utilize Playwright's `storageState` to save the Session (localStorage/cookies) after logging in **once** via API or a global setup script. Reuse this state across all tests.
- **Reference:** See `.agents/skills/playwright-cli/references/storage-state.md` for detailed patterns.

### Example pattern:
```typescript
// playwright.config.ts — global setup saves auth state once
globalSetup: './src/__tests__/e2e/global-setup.ts'

// global-setup.ts
export default async function globalSetup() {
  // Login logic here (e.g., via NextAuth API or direct DB session creation)
  await browser.storageState({ path: 'playwright/.auth/user.json' });
}

// Individual test files reuse saved state
test.use({ storageState: 'playwright/.auth/user.json' });
```

### playwright-cli command for state management:
```bash
playwright-cli state-save playwright/.auth/user.json
playwright-cli state-load playwright/.auth/user.json
```

---

## 4. Strict Selector Policy (`data-testid`)

Dumping raw HTML or complex DOM trees into the context window is **strictly forbidden**.

- **Rule:** Never locate elements by brittle CSS paths or frequently changing text content.
- **Action:** Add `data-testid` attributes to all components under test. Locate them **exclusively** using `page.getByTestId()`.

### Implementation:
```tsx
// ✅ Web/React — add data-testid attribute  
<button data-testid="submit-btn" onClick={handleSubmit}>
```

### Test usage:
```typescript
// ✅ CORRECT
await expect(page.getByTestId('submit-btn')).toBeVisible();
await page.getByTestId('email-input').fill('user@example.com');

// ❌ WRONG — brittle, token-expensive
await page.locator('div.container > form > button:nth-child(2)').click();
await page.getByText('Submit').click(); // text changes break tests
```

### Using playwright-cli for testid inspection:
```bash
# Verify testid attribute exists on an element
playwright-cli eval "el => el.getAttribute('data-testid')" e5
playwright-cli click "getByTestId('submit-btn')"
```

---

## 5. Zero Vision / No Screenshot Verification

Vision API models burn through quotas rapidly.

- **Rule:** Do NOT use `page.screenshot()` to visually verify the UI using LLM vision capabilities.
- **Action:** Rely **100%** on Playwright's DOM assertions (`expect(...).toBeVisible()`, `expect(...).toHaveText()`, `expect(...).toBeEnabled()`, etc.).

### Correct assertion patterns:
```typescript
// ✅ DOM assertions — zero token cost
await expect(page.getByTestId('player-title')).toBeVisible();
await expect(page.getByTestId('play-btn')).toBeEnabled();
await expect(page.getByTestId('error-banner')).toContainText('Invalid media');
await expect(page.getByTestId('nav-home')).toHaveClass(/active/);
```

### Screenshot usage — ONLY for CI artifact archival:
```typescript
// ✅ ONLY acceptable screenshot usage: CI failure artifact (compressed)
if (process.env.CI) {
  await page.screenshot({ path: 'test-results/failure.jpg', type: 'jpeg', quality: 80 });
}

// ❌ WRONG — screenshots fed to vision model for verification
const screenshot = await page.screenshot({ encoding: 'base64' }); // FORBIDDEN
```

---

## Summary Table

| Rule | Prohibited | Required |
|---|---|---|
| **Browser Interaction** | MCP AOM dumps / base64 screenshots | `playwright-cli` + static TypeScript tests |
| **Test State Setup** | UI-driven `beforeAll` flows | API / Prisma Client data seeding |
| **Authentication** | Repeated UI login per test | `storageState` file reuse |
| **Element Selection** | CSS paths, text locators, raw HTML dumps | `data-testid` + `page.getByTestId()` |
| **UI Verification** | `page.screenshot()` → LLM vision | Playwright DOM assertions only |

---

## Enforcement

These rules are **architectural constraints** defined by the Chief Architect. Violations must be flagged immediately in the agent's response and corrected before proceeding. Any agent detecting a violation in an existing test suite should raise a corrective sub-task.

**Skill:** `.agents/skills/playwright-cli/SKILL.md`  
**Testing Guide:** `docs/test/README.md`  
**Test Location:** `src/__tests__/e2e/`
