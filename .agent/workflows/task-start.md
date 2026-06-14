---
description: Automatically syncs the main branch, transitions the JIRA ticket status, creates a standardized git branch/worktree, and initializes the implementation plan.
---

# Start Task (Task-Start) Workflow

This workflow automates the standard setup steps when beginning a new development task. It is triggered by the `/task-start` command or when the user issues a command like "start-task WFP-XX".

Refer to [.agents/workflows/test-accounts.md](./test-accounts.md) for test credentials and browser testing guidelines.

## Steps

### 0. WIP/VCR Validation Check (CRITICAL)

*   **Mandatory Gate:** Before doing anything else, run the WIP validation script:
    `node scripts/verify-wip.js --check-vcr`
*   If this script fails (returns exit code 1), it means there are either multiple active features or the VCR is less than 100% (unfinished tasks exist). **You must stop immediately and ask the user to resolve or complete the unfinished tasks.** Do not transition JIRA tickets or create branches.

### 1. Fetch JIRA Task Details

*   Call `getJiraIssue` to retrieve the details (Title, Type, Description) for the specified JIRA-ID.
*   Determine the task type (`task` or `bug`).

### 2. Transition JIRA Issue Status

*   Transition the JIRA issue status to "In Progress" using `transitionJiraIssue`.

### 3. Main Branch Synchronization

*   **Crucial:** Before creating a new worktree, run the following commands in the root directory to keep the local `main` branch up to date:
    *   `git fetch origin`
    *   `git checkout main`
    *   `git pull origin main`
*   *Exception:* If already inside an active worktree and `main` is locked elsewhere, run `git fetch origin main:main` to update the local main branch tracking reference.
*   *Rebasing:* Rebase your current working branch on top of the updated `main`: `git rebase main`.

### 4. Worktree & Branch Management

*   Construct the standard branch name using the rules in `rules.md` Section 6:
    `<type>/<JIRA-ID>-<slug>-<YYYYMMDD>`
*   **New Worktree:** If working in the root directory, create a new worktree tracking the updated main: `git worktree add <path> <branch>`.
*   **Existing Workspace:** If working in an already active worktree, standardize its branch name using: `git branch -m <new-name>`.
*   **Verification:** Validate that both the working directory path and active branch name match the `rules.md` requirements.

### 5. Preliminary Research

*   Read `docs/README.md` and related module documentation.
*   Review technical constraints and coding conventions in `rules.md`.

### 6. Create Implementation Plan

*   Generate an `implementation_plan` artifact detailing the technical approach and test plan.
*   **The Test Strategy Must Include:**
    *   **Unit Tests:** Functions, utility helpers, and services targeted for testing.
    *   **UI Verification:** Target screens and key interactive user flows (buttons, form inputs) to verify with Playwright.
*   **Test Standards:** Ensure test creation aligns with the rules and file naming patterns defined in [.agents/workflows/write-tests.md](./write-tests.md).

### 7. Initialize PROGRESS.md

*   Create `PROGRESS.md` in the root of the worktree tracking the current task state.
*   **PROGRESS.md Template:**
    ```markdown
    # Proje İlerleme

    _Son güncelleme: <YYYY-MM-DD HH:MM> — vardiya açılışı_

    ## Şu anki durum
    - Branch: <type>/<JIRA-ID>-<slug>-<YYYYMMDD>
    - JIRA: <JIRA-ID> — <JIRA-TITLE>
    - Son commit: (henüz yok)
    - Testler: —
    - Lint: —

    ## Tamamlandı
    (boş)

    ## Devam ediyor
    - [ ] Implementation plan oluştur

    ## Bilinen sorunlar
    (boş)

    ## Sıradaki adımlar
    1. Implementation plan'ı oluştur ve kullanıcıya sun
    2. Onay sonrası uygulamaya başla

    ## Açık sorular
    (boş)
    ```

---
**Important Reminder:** Always sync the main branch (fetch + pull) before setting up a new worktree. Create workspace directories and branch names exactly as specified in `rules.md` Section 6. Refer to `.agents/workflows/write-tests.md` as your guide when developing unit and E2E test scripts.
