---
description: Deeply researches the product vision, past task leftovers, postponed bugs, and technical debt to produce a prioritized list of developer tasks.
---

# Task Finder (Task-Finder) Workflow

This workflow systematically analyzes the product vision, archived task summaries, postponed JIRA tickets, and codebase technical debt to identify, categorize, and prioritize the next developer tasks. It is triggered by the `/task-finder` command or when the user asks to "find tasks".

## Steps

### 1. Product Vision & Roadmap Alignment

*   Read the product vision document: [docs/business/vision.md](../../docs/business/vision.md).
*   Read the project roadmap: [docs/business/roadmap.md](../../docs/business/roadmap.md).
*   Compare current features and their status against:
    *   **Phase Plans:** Identify features in the active or upcoming phases that are not yet implemented.
    *   **Feature Status List:** Extract features marked as `❌ Not implemented`, `🔲 Planned`, or `🚧 UI exists (Non-functional)`.
*   Identify high-impact product features that directly align with the core brand values (Focus, Power, Personalization, Motivation).

### 2. Research Past Task Leftovers

*   List and inspect the archived tasks under [docs/tasks/](../../docs/tasks/).
*   For recent tasks (or all of them), read the `walkthrough.md` and `verification.md` files.
*   Scan for comments, notes, or sections regarding:
    *   *Limitations* or *Known Issues* during verification.
    *   *Future Scope* or *Out of Scope* decisions.
    *   Keywords like: `todo`, `future`, `postponed`, `deferred`, `ertelenen`, `later`, `later iterations`.
*   Compile skipped items or items earmarked for follow-up.

### 3. Scan for Postponed Bugs & Active Issues

*   If `atlassian-mcp-server` is active, query JIRA using JQL:
    *   Query: `project = WFP AND status != Done AND issuetype = Bug` to retrieve active/backlog bugs.
    *   Query: `project = WFP AND (summary ~ "fix" OR description ~ "postpone" OR description ~ "defer")` to find postponed fixes and enhancements.
*   Review the "Current Technical Debt" section in [docs/business/roadmap.md](../../docs/business/roadmap.md) to locate postponed bug items.
*   Identify bugs that were temporarily bypassed or suppressed (e.g., LogBox warning suppressions).

### 4. Audit Technical Debt & Codebase Health

*   Read the prioritized tables under "Current Technical Debt" in [docs/business/roadmap.md](../../docs/business/roadmap.md).
*   Read the type-system debt documented in [docs/frontend/types/tech_debt.md](../../docs/frontend/types/tech_debt.md).
*   Perform ripgrep searches in the `src/` directory to identify codebase-level debt:
    *   **TODO/FIXME comments:** Run `grep_search` with Query `TODO` or `FIXME` across `src/`.
    *   **Loose Types:** Run `grep_search` with Query `: any` or `as any` in `.ts` and `.tsx` files to locate weak typing.
    *   **Hardcoded Values:** Check for hardcoded styling, configuration values, or mock API responses in service files.

### 5. Prioritization & Categorization Matrix

Categorize all identified items into one of the following groups:
*   **Category A: Vision Alignment (Product Value)** (e.g., new phase features, integrations).
*   **Category B: Past Task Leftovers (Unfinished Business)** (e.g., unresolved edge cases from recent tasks).
*   **Category C: Postponed Bugs (System Quality)** (e.g., UI clipping, console warnings, functional bugs).
*   **Category D: Technical Debt (Maintainability/Safety)** (e.g., RLS policies, type safety, modularization).

Assign a priority level (High, Medium, Low) to each item based on this rubric:
1.  **HIGH Priority:**
    *   Critical security risks (e.g., missing Row Level Security policies on tables).
    *   Critical bugs affecting core user flows (e.g., crashes, navigation lockups).
    *   Core MVP/Phase 1 features directly blocking release.
2.  **MEDIUM Priority:**
    *   Key feature enhancements (e.g., visual sharing cards, exercise video library).
    *   Major refactoring/code-smell resolutions (e.g., centralizing colors, state sync).
    *   Non-blocking UI bugs and warnings.
3.  **LOW Priority:**
    *   Long-term architectural migrations (e.g., Expo Router migration).
    *   General type system cleanup.
    *   Phase 2+ features (social feeds, coaching interactions).

### 6. Present Prioritized Backlog

Construct a prioritized report for the user (delivered in Turkish as per communication standards). For each recommended task, include:
1.  **Title & Suggested JIRA ID** (e.g., `[WFP-116] Setup Prisma Models`).
2.  **Category & Priority** (e.g., *Technical Debt / HIGH*).
3.  **Source Reference** (e.g., `docs/business/roadmap.md` Row 1, JIRA ticket, or code file `App.tsx` line 12).
4.  **Problem Statement & Goal** (Why this task is needed and what it accomplishes).
5.  **Draft Acceptance Criteria (AC)** (Clear, testable expectations for verification).

Request the user to select a task to proceed with, or approve the generated backlog for creation/transition in JIRA.
