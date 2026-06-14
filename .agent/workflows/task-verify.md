---
description: Automatically runs all unit and E2E browser tests during task verification or at key milestones.
---

# Task Verification (Task-Verify) Workflow

This workflow is used to verify that the implemented changes function correctly both logically (unit tests) and visually/interactively (UI tests). It supports verifying either the current active task (default) or a specific past/targeted task (`wfp-XXX`). It is triggered by the `/task-verify` command.

---

## Path 1: Default Task Verification (Current Task)

Use this path when verifying the task you are currently developing in your active workspace.

### Steps

#### 1. Run Unit Tests

*   Run unit and integration tests: `npm test`
*   If tests fail, apply the `test-fixing` skill to analyze and resolve the issues.
*   Verify that test coverage meets target thresholds (90%+ for critical files).

#### 2. UI Verification Setup

*   Verify if the local web dev server is running (`npm run dev`). If not, boot or prompt to boot the server.
*   Determine the local development URL (typically <http://localhost:3000>).

#### 3. Playwright E2E Browser Testing

*   Use `playwright-skill` to execute E2E tests for the interactive user scenarios outlined in your `implementation_plan`.
*   **Key Verification Points:**
    *   Target screens load without rendering errors.
    *   Form submissions and button clicks behave as expected.
    *   State changes (loading indicators, error blocks, success messages) are displayed correctly.
*   **Critical Rule:** You must always consult the user and obtain explicit permission before starting a Browser Subagent.
*   **Login Protocol:** Before running a Browser Subagent, **ALWAYS** read [./test-accounts.md](./test-accounts.md). You must explicitly include the provided email/password credentials in the subagent's task description with a strict warning: "ONLY use these credentials; do not register or generate new accounts."
*   Save screenshots of critical UI states in the `test-results/` or `playwright-report/` directory.

#### 4. Regression Check

*   Ensure changes do not break core application features (e.g., media playback, library scanning).

#### 5. Generate and Archive Verification Report

Create a `verification_report.md` artifact summarizing your verification findings. The report must contain the following sections and detail the **what** and the **why** of the changes:

*   **1. Business Rationale / İş Mantığı Raporu:**
    *   Explain what was done and why from a business perspective.
    *   Detail the product value, user experience improvement, and impact on the application's features.
    *   *Requirement:* Do not just state the feature was added; describe how it benefits the user, which business problems it solves, or why the design choices align with the product roadmap.
*   **2. Technical Rationale / Teknik Detaylar:**
    *   Explain what was done and why from a technical perspective.
    *   Detail the architectural changes, database changes/migrations, component design decisions, API structures, and type-safety changes.
    *   *Requirement:* Document the engineering design decisions. Explain why specific patterns (e.g. Server Actions, Zustand, Prisma) were chosen or why migrations were structured in a certain way, justifying the choices against technical debt.
*   **3. Test Results & Verification / Test ve Doğrulama Sonuçları:**
    *   ✅ Number of passing unit/integration tests (Jest).
    *   📸 Visual proof (screenshots and video recordings): Save temporarily under `./docs/tasks/<jira-id-or-branch-name>/`. Ensure all media is compressed to protect Jira quota limits (use **JPEG format with 75-80% quality** for screenshots, and lower resolution **.webm/.mp4** for videos). Upload them to the corresponding JIRA ticket, and then **delete them locally** to prevent git repository bloat. Provide links to the JIRA ticket instead of local files.
    *   ⚠️ Known limitations or areas that require manual verification by the developer/user.

Once the verification report is generated along with `task.md` and `walkthrough.md`, you must run the archiving command to move them to their permanent folder:
```bash
npm run archive-task -- -a <path-to-artifacts-dir>
```

---

## Path 2: Targeted Task Verification (`task-verify wfp-XXX`)

Use this path when the user requests verification of a specific past or different task by passing a JIRA ID (e.g. `/task-verify wfp-128`).

### Steps

#### 1. Inspect Archived Reports
*   Locate the archived task directory: `./docs/tasks/wfp-XXX/`.
*   Read `./docs/tasks/wfp-XXX/verification.md` (or the walkthrough/task files if available) to understand:
    *   The business and technical goals of the task.
    *   What tests (unit/E2E) were originally executed and how they were validated.
    *   Any specific setup or mock requirements.

#### 2. Switch to the Task's Environment
*   **Check Active Worktrees:** Run `git worktree list`.
    *   Look for a worktree path matching the branch or naming pattern for `wfp-XXX` (e.g. `<worktrees_dir>/webframeplayer/wfp-XXX-...`).
    *   If found, perform all subsequent test runs and code inspections in that worktree directory (by setting `Cwd` of your command executions to that path).
*   **Check Branch if No Worktree Exists:** If no active worktree contains `wfp-XXX`:
    *   Run `git branch -a` to locate a local or remote branch matching `wfp-XXX` (e.g. `origin/task/wfp-XXX-...` or `task/wfp-XXX-...`).
    *   If a branch is found, check if the current working directory is clean (`git status`).
        *   *If clean:* Switch to the branch using `git checkout <branch-name>`.
        *   *If dirty:* Warn the user about uncommitted changes and prompt them to stash/commit before checking out.

#### 3. Execute Tests
*   Run the unit tests: `npm test` (or task-specific test suites, e.g. `npm test -- src/__tests__/playbackLogic.test.ts`).
*   If Playwright E2E tests are associated with the task (as documented in its archived report):
    *   Start the local dev server in that environment context.
    *   Run E2E tests: `npm run test:e2e` (or run a specific Playwright test file).
*   Document test outputs, ensuring they all pass successfully.

#### 4. Present Findings
*   Instead of creating a new `verification_report.md` artifact (unless requested to re-archive), present a summary directly in your final response in Turkish.
*   The summary must include:
    *   A link to the archived [verification.md](./docs/tasks/wfp-XXX/verification.md) report.
    *   The status of the worktree/branch switch (e.g. "Switched to worktree X").
    *   Fresh test execution results (number of passing unit and E2E tests).
    *   Any visual findings or differences from the archived report.

---
**Critical Rule:** A task cannot be marked as complete if any tests fail. Failures must be resolved, and this verification workflow must be re-run and pass before closing the ticket.
