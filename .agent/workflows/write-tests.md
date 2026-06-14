---
description: Automatically drafts, updates, and executes unit (Jest) and E2E (Playwright) tests for current codebase modifications.
---

# Write Tests Workflow

This workflow analyzes recent codebase changes and automatically writes or updates both **unit** and **E2E/UI** test scripts in compliance with the guidelines in `rules.md`.

## Steps

### 1. Identify Target Areas for Testing

Review recent git changes (`git diff`) and identify components or logic that require tests:

*   **Unit Tests:**
    *   **Utilities:** Pure helper functions (e.g. `formatTime.ts`, `routineUtils.ts`).
    *   **Services:** Database and API data wrappers (e.g. `exerciseApi.ts`, `authService.ts`).
    *   **Business Logic:** Context-based calculations, mathematical helpers, or custom hook state machines.
*   **E2E (UI) Browser Tests:**
    *   **Screens:** Verify that new or modified screens render correctly.
    *   **Interactions:** Button clicks, form entries, scrolling, and navigation flows.
    *   **State Changes:** Visual rendering of loading, empty, success, and error UI states.

### 2. Inspect Existing Test Suite

*   Locate Jest unit/integration tests under `src/__tests__/unit/` or `src/__tests__/integration/`.
*   Locate Playwright E2E browser tests under `src/__tests__/e2e/`.
*   Determine if modifications broke existing tests, or if new test files/blocks should be added.

### 3. Implement Test Logic

#### A. Jest Unit & Integration Tests
*   **Location:** Under `src/__tests__/unit/` or `src/__tests__/integration/`.
*   **Mocking:** Mock external services like Supabase client, RapidAPI, sound engines, or timers.
*   **Coverage:** Ensure you cover both typical "happy paths" and edge cases (empty states, database errors, boundary conditions).

#### B. Playwright E2E Tests
*   **Location:** Under `src/__tests__/e2e/`.
*   **User Journeys:** Target the interactive flows outlined in your `implementation_plan`.
*   **Credentials:** Always use test account credentials defined in [.agents/workflows/test-accounts.md](./test-accounts.md).
*   **Mockup Shell:** Ensure interactions work within the `WebPhone` mockup container structure simulated on web builds.

### 4. Execute & Verify Tests

*   **Unit Tests:** Run `npm test` and ensure all tests pass.
*   **UI Tests:** Execute Playwright tests using `npx playwright test` (or the `playwright-skill` tool) and verify test outcomes.
*   If test failures are encountered, use the `test-fixing` skill or inspect test logs to debug and resolve them.

### 5. Coverage & Verification Report

*   Ensure critical business logic files meet the 90%+ test coverage threshold.
*   Document test outcomes and present the verification details to the user.

---
**Critical Rule:** A task cannot be marked as complete without test coverage (both logic/unit testing and interactive/visual UI verification). All tests must remain isolated and use mock data to ensure predictable, reproducible test runs.
