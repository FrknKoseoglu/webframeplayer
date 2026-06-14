---
description: Manages updates to an active task (due to failed session context, scope expansion, or auto-enrichment of a raw task ID) in the existing worktree/branch. Syncs JIRA, checks git state, and generates an updated implementation plan.
---

# Update Task (Task-Update) Workflow

This workflow is used in three main scenarios:

1.  **Failed Context:** An agent session crashed or context was lost, leaving the task incomplete.
2.  **Scope Modification (Extension/Reduction/Change):** The user wants to add new requirements, modify existing ones, or remove items from the active task while preserving its core context and intent.
3.  **Task Enrichment / Detailing:** The user shares only a task ID (e.g., `WFP-XXX`) without instructions. The workflow fetches, details, and structures the task to be developer-ready.

Triggered by the `/task-update` command. Usage: `/task-update WFP-XX` or run `/task-update` directly from within an active worktree.

---

## Steps

### 1. Identify the Active Workspace & Input Type

*   Run `git worktree list` to see all current worktrees.
*   If called with a `JIRA-ID` (e.g., `WFP-XX`) and no specific instructions:
    *   Treat this as a **Task Enrichment** scenario.
    *   If no active worktree exists for this ID, initiate the `/task-start` workflow instead.
    *   If an active worktree exists, proceed with steps below to fetch and enrich it.
*   If called with instructions (e.g., "add X and remove Y") or within an active worktree:
    *   Treat as **Scope Modification** or **Failed Context**.
*   **Critical:** Do not create a new branch or worktree unless none exists. Work must continue in the **existing** workspace.

### 2. Fetch & Analyze JIRA Task Details

*   Call `getJiraIssue` using the identified `JIRA-ID`.
*   Record the following:
    *   **Title & Description:** What is the scope?
    *   **Acceptance Criteria (AC):** What needs to be met?
    *   **Current Status:** Current JIRA ticket status.
*   If the issue status is not "In Progress", transition it using `transitionJiraIssue`.

### 3. Apply Task Enrichment & Standardizing (Auto-Detailing)

If the task lacks details, or if the scenario is **Task Enrichment** (e.g., user just provided `WFP-XXX`):
*   Apply the `jira-pm` and `/task-create` standards to format and detail the task.
*   The detailed task MUST include:
    *   **Title & Issue Type**
    *   **LLM Model Recommendation:** Recommended model group based on the Antigravity Model Selection Guide (e.g. Claude Sonnet 4.6 (Thinking), Gemini 3.5 Flash, etc.).
    *   **Technical Details:** Target files, affected architectural layers (Service, Context, UI).
    *   **Acceptance Criteria (AC):** Clear, testable bullet points.
    *   **Test Scenarios:** Unit and E2E browser test cases.
*   If the issue in JIRA was not detailed, update the JIRA issue description using `editJiraIssue` with the enriched markdown.

### 4. Analyze Scope Changes (User-guided Modifications)

If the user has provided specific instructions to add, modify, or remove items:
*   Identify additions, modifications, and deletions.
*   **Core Context Check:** Verify that the requested changes do not break or deviate from the main purpose/intent of the original task.
*   Detail the requested changes into specific Technical Details, Acceptance Criteria, and Test Scenarios.
*   If the scope change is too large or constitutes a completely new feature, recommend opening a separate JIRA ticket.

### 5. Inspect Current Code & Worktree State

*   Show recent commits: `git log -n 10 --oneline`
*   List unstaged/staged files: `git status`
*   Analyze the content of active changes: `git diff HEAD`
*   Identify **which steps are complete** (committed) and **which steps are pending** (staged/unstaged).

### 6. Update JIRA

Apply at least one of the following:
*   **Add a Comment:** Use `addCommentToJiraIssue` to post progress updates or documented changes.
*   **Edit Issue Details:** Update the description/AC in JIRA using `editJiraIssue` to reflect the updated or enriched scope.

### 7. Generate/Update Implementation Plan

Create or update the `implementation_plan.md` artifact containing:

```markdown
# [JIRA-ID] [Task Title]

## 🔄 Task Update Report

**Worktree:** <directory-path>
**Branch:** <branch-name>
**JIRA-ID:** <WFP-XX>
**Scenario:** Failed Context / Scope Modification / Task Enrichment

---
### ✅ Completed Steps
- [x] Step 1 — commit: <hash> / <description>

---
### 🔧 Pending Steps (Remaining)
- [ ] Step 2 — <description>

---
### ➕ Scope Additions / ➖ Deletions (If any)
- **Add:** <description>
- **Remove:** <description>

---
### 🧪 Test Strategy
- **Unit:** <functions/services to be tested>
- **UI:** <screens and user interactions to verify via Playwright E2E>
```

### 8. Request Confirmation & Execute

*   Present the update report and implementation plan to the user.
*   Ask: **"Planı onaylıyor musunuz? Devam edeyim mi?"**
*   Once confirmed, update the `task.md` file in the artifact directory to reflect the new/modified tasks, and proceed with coding.

---
**Reminders:**
*   Do not open new branches or worktrees. Work within the active workspace.
*   If the scope change is too large, recommend opening a new JIRA ticket.
*   Run the `/task-verify` workflow once development is complete.
*   Push using `git push -u origin <branch-name>` and share the PR URL with the user.
