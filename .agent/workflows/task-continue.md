---
description: Resumes work on a pending or interrupted task using the existing worktree and branch. Analyzes JIRA status and git changes to present a continuity report.
---

# Resume Task (Task-Continue) Workflow

This workflow is used to resume work on a task that was previously started but left unfinished (due to session reset, agent restart, etc.) without altering the existing worktree and branch setup. It is triggered by the `/task-continue` command.

## Steps

### 1. Workspace & Branch Verification

*   Run `git status` to verify the current worktree directory and branch.
*   **Do not create a new branch or worktree.** Work must continue directly within the current environment.
*   Extract the `JIRA-ID` from the active branch name (e.g., if branch is `task/wfp-74-task-start-...`, the ID is `WFP-74`).

### 2. Read Vardiya Defteri (PROGRESS.md)

*   **Fast-track context:** Read `PROGRESS.md` (and `DECISIONS.md` if present) from the root of the worktree first.
*   If `PROGRESS.md` is populated, use its "Devam ediyor" and "Sıradaki adımlar" sections to immediately reconstruct context, saving token count and API calls.

### 3. JIRA Task Analysis

*   Using the extracted `JIRA-ID`, call `getJiraIssue` to fetch the task's details (Title, Description, Acceptance Criteria).
*   Re-examine the core requirements and goals of the task.

### 4. Git Changes Analysis

*   Run `git status` to list all modified, staged, or untracked files.
*   Analyze the diff of current changes using `git diff` and `git diff --staged`.
*   If commits were already made, inspect recent history using `git log -n 5`.
*   Determine exactly where the previous development stopped (which files are complete, what logic is missing).

### 5. Continuity Report Creation

Based on JIRA details and existing code changes, present a summary report to the user containing:

*   **Workspace Environment:** Current worktree directory and active branch.
*   **Task Goal:** What the task intends to achieve.
*   **Accomplishments So Far:** Completed steps identified from the git diff.
*   **Remaining Steps / Plan:** Checklist of remaining sub-tasks to complete the ticket.

Present this report to the user and request confirmation before resuming execution.
