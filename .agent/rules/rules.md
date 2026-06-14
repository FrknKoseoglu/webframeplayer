---
trigger: always_on
---

# webframeplayer Agent Rules

This document defines the core working rules and standards for AI agents (Claude, Antigravity, Cursor, etc.) working on the webframeplayer project.

## 1. General Development Workflow

1. **Research and Understand:** Before starting a task, always read the `docs/` directory. In particular, inspect `docs/README.md` and the document related to the module you are working on. Also, check the [map.md](../../docs/map/map.md) file to understand the project structure and file map.
2. **Planning:** Outline proposed changes in your mind (or via an `implementation_plan` artifact) first. Do not violate the existing architecture (Next.js Server Actions, Zustand, Service Layer).
3. **Implementation:** Write code in small, testable chunks.
4. **Verification:** Run the tests using the `npm test` command after making modifications.
5. **Documentation:** Update the corresponding files under `docs/` for any logical changes made. Also update [map.md](../../docs/map/map.md) if files are added or deleted.
6. **Clean Workspace:** Adding unnecessary reports, data, rules, or temporary files to the root directory is forbidden. Such files must never be pushed to the repository.
7. **Language Standard:** Perform all internal development tasks, implementation plans, checklists, code comments, and commit messages in English to minimize token consumption and maintain consistency. However, the agent's final response and direct communication to the user must be written in Turkish.
8. **WIP=1 and VCR Constraints:** Before starting any new task, run `node scripts/verify-wip.js --check-vcr` to ensure all previously activated features are completed and verified (VCR = 100%). You are strictly prohibited from activating more than one feature concurrently in `docs/features.json`. When a feature is completed, **do NOT manually write `state: "passing"` in features.json** — run `npm run mark-passing <feature-id>` instead. This script runs the feature's verification command and only transitions to passing if it exits 0.

## 2. Coding Standards

### TypeScript & Language Usage

* **Strict Types:** The use of `any` is forbidden. Always define an interface or type. Use `src/types.ts` or relevant feature folders as the central types repository.
* **Naming:** Use `camelCase` for variable and function names, and `PascalCase` for React component names.

### React, Next.js & Electron

* **Components:** Use only Functional Components.
* **Styling:** Use standard CSS modules or Tailwind CSS and stay faithful to the project's design system. Avoid ad-hoc (inline) styles.
* **Platform Compatibility:** The application runs on Electron (Desktop) and Web. Handle IPC (Inter-Process Communication) carefully when bridging Web to Desktop. Use `isElectron` or similar environment checks when necessary.

### State Management & Data

* **Zustand:** Use Zustand stores for global state management.
* **Services & Actions:** Do not perform database calls directly in client components. Use a service layer or Next.js Server Actions under `src/services/` or `app/actions/`.

## 3. Testing Principles & Agent Responsibility

* **Agent Testing Responsibility:** The agent must draft a test plan during the `/task-start` phase for each task and verify implementations using the `/task-verify` workflow (Unit + UI) before completion.
* **Test Location:** All tests must reside under `src/__tests__/`.
* **E2E Testing Constraint:** Whenever you are tasked with writing, modifying, or debugging Playwright E2E tests, you MUST first read and strictly adhere to the token optimization boundaries defined in [playwright-e2e-rules.md](./playwright-e2e-rules.md).
* **Critical Logic:** Core utilities, services, and business logic must be tested.
* **UI Verification:** Critical user flows must be visually verified on the Web build using Playwright.
* **Mocking:** External dependencies must always be mocked in tests.
* **Coverage:** Target 90%+ code coverage for critical logic files.
* **Proof Submission:** A task is not complete until test results are presented to the user via a `verification_report.md` artifact. This report must clearly detail **what was done and why (both from a business perspective and a technical perspective)** to justify the implementation choices and product value. Specifically, it must contain:
    1. **Business Rationale / İş Mantığı Raporu**: Explain what was done and why from a product, user experience, and feature perspective, detailing the value added to the application.
    2. **Technical Rationale / Teknik Detaylar**: Explain what was done and why from a system design, architectural, database schema, and type-safety perspective.
    Reports missing either of these two sections, or providing only generic/empty explanations, will be considered non-compliant and will cause task verification to fail.
* **Progressive Testing & Browser Subagent Usage:** To save tokens and avoid infinite loops, follow this order of verification:
    1. Always run **Headless Playwright** tests first (most efficient and cost-effective).
    2. If errors occur, inspect error logs and automated screenshots.
    3. Use the **Browser Subagent (Headed mode)** only as a last resort for complex visual errors or when stuck in logical loops.
* **Browser Subagent Credentials:** Before starting a Browser Subagent, if login is required, read `.agents/workflows/test-accounts.md` and explicitly include valid credentials in the subagent's task description. Never allow the subagent to generate test accounts on its own.

## 4. Prisma & Database

* **Migrations:** Use Prisma migrations (`npx prisma migrate dev`).
* **Security:** Ensure queries are properly authorized. Use NextAuth or custom session validation at the server action / API route level.
* **Error Handling:** Catch database errors inside `try-catch` blocks and return friendly (or loggable) feedback to the user.

## 5. Documentation Rules

* **README Currency:** Update the respective README file under `docs/` when a new module or service is added.
* **Project Map Currency:** Update [map.md](../../docs/map/map.md) with the file name and description when a new screen, component, service, util, or document is added/deleted. **Yeni bir klasör veya modül eklendiğinde map.md güncellenmelidir.**
* **Test Notes Template:** Synchronize the test template with the latest architecture by updating `docs/test-notes-template.md` whenever a screen, component, or feature is added/modified.
* **Comments:** Use JSDoc comments to describe complex business logic. Avoid comment noise for simple code.
* **Task Archiving:** Upon completing a task, you must archive the task documentation using:

    ```bash
    npm run archive-task -- -a <path-to-artifacts-dir>
    ```

    This moves `task.md`, `verification_report.md` (as `verification.md`), `walkthrough.md`, `PROGRESS.md`, and `DECISIONS.md` to `docs/tasks/<jira-id-or-branch-name>/`. Root versions of `PROGRESS.md` and `DECISIONS.md` are automatically deleted upon archiving to prevent git merge conflicts. The archived `verification.md` file must serve as a comprehensive log detailing **both the business and technical rationale** (explaining both what was done and why from a product and engineering perspective, not just how it was verified) and how it was verified. All archived documents should be committed before pushing. **This step is mandatory and programmatically enforced by the commit script.** If not completed, any commit or push attempt on task/bug branches will fail.
* **Media and Screenshot Policy (Jira Integration & Compression):**
  * To prevent repository bloat, **DO NOT commit raw screenshots, images, or videos** to GitHub.
  * **Compress All Media:** Do not upload raw/uncompressed media.
    * *Screenshots:* Capture screenshots in **JPEG format with 75-80% quality** (e.g. `page.screenshot({ type: 'jpeg', quality: 80 })`) instead of PNG. This reduces size by up to 90% while keeping text perfectly readable.
    * *Videos:* Record E2E test runs or manual videos in lower resolution (e.g., max 1280x720) and use highly compressed formats like `.webm` or compressed `.mp4`.
  * During the verification phase, store these compressed visual proofs temporarily under `docs/tasks/<jira-id-or-branch-name>/`.
  * **Upload these media files to the corresponding JIRA ticket** (as attachments or in comments) as the single source of truth for visual verification.
  * **Delete the local media files** from `docs/tasks/<jira-id-or-branch-name>/` before committing and pushing.
  * In the `verification.md` and `walkthrough.md` files, include a clear link to the JIRA ticket/comments where the visual proof resides instead of referencing local files.

### Markdown Links & Relative Paths

* **No Absolute Path Links:** Do **NOT** use absolute file paths or Windows paths like `file:///c:/dev/webframeplayer/...` or `file:///C:/Users/...` when linking to files in this repository.
* **Use Relative Paths:** Always use relative paths starting with dot (`.`), e.g., `./docs/map/map.md` or `./docs/README.md`.

## 6. Git, Worktree, and Branch Management

* **Naming Convention:** Worktree and branch names must follow this format: `<type>/<JIRA-ID>-<slug>-<YYYYMMDD>`
  * `<type>`: `task` or `bug`
  * `<JIRA-ID>`: Lowercase (e.g., `wfp-21`)
  * `<slug>`: Short English summary derived from the JIRA title.
  * `<YYYYMMDD>`: Date format.
  * *Example:* `task/wfp-21-add-login-20240520` or `bug/wfp-22-fix-timer-20240520`
* **Workspace:** A dedicated **git worktree** must be created for each task.
  * Check active worktrees with `git worktree list` before starting.
  * If a workspace was created with an incorrect name or left half-finished, clean it up (`git worktree remove`) before opening a new one.
  * Worktrees must always be opened in the `.worktree` folder within the root directory (e.g., `./.worktree/<branch-name>`).
  * Work on the `main` branch. Create and work on a directory following the naming standards under `./.worktree/<branch-name>`.
  * To open and work in the worktree, use the following command to navigate to it in Terminal:

         ```powershell
         cd "C:/dev/webframeplayer/.worktree/<branch-name>"
         ```

         Or open it in VS Code:

         ```powershell
         code "C:/dev/webframeplayer/.worktree/<branch-name>"
         ```

* **Completion and Push:**
  * Commit and push changes to the remote branch once complete.
  * **Commit Message Standard:** Use Conventional Commits and include the JIRA ID. Put the issue URL in the commit body.
    * *Format:* `<type>(<scope>): [<JiraID>] <commit message>`
    * *Body:* `Jira Task: https://furkankoseoglux.atlassian.net/browse/<JiraID>`
    * *Example:*

            ```text
            fix(player): [WFP-12] update video synchronization

            Jira Task: https://furkankoseoglux.atlassian.net/browse/WFP-12
            ```

  * Always use the `-u` (set-upstream) flag when pushing (`git push -u origin <branch-name>`) to keep local and remote branches tracked, allowing the IDE to show status sync correctly.
  * **PR Link:** Provide the Pull Request URL (from the git push output) to the user once pushed.
  * **Task Link:** Always provide the JIRA Task Link to the user after pushing.

## 7. Project-Specific Notes

* **MPV Player Integration:** Pay attention to the MPV Player C++ Addon bridging when working on media playback features. Native bindings must be gracefully handled or mocked during Next.js builds.
* **Electron IPC:** When communicating between the Next.js renderer and Electron main process, use secure and pre-defined IPC channels (`contextBridge`). Avoid injecting Node.js APIs directly into the renderer.
* **Next.js Hydration:** Ensure server-side rendered elements strictly match client-side hydration, particularly for components relying on window or electron context.
