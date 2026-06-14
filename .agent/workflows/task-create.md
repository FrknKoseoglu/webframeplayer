---
description: Transforms user requests into detailed JIRA tasks using the jira-pm skill, defines execution sequence/parallelism, and optionally creates them in JIRA.
---

# Create Task (Task-Create) Workflow

This workflow takes ambiguous user requests, analyzes them technically using the principles in the `jira-pm` skill, and converts them into developer-ready JIRA tasks. It automatically detects if a request contains multiple tasks and generates separate tickets for each.

## Steps

### 1. Requirements Analysis & Task Breakdown

The agent analyzes the user request and determines **how many separate tasks** are needed:

*   Examine the `src/` and `docs/` directories to understand the technical scope of the request.
*   Decide whether to **split the request into multiple tasks** based on the following criteria:
    *   **Different Architectural Layers:** Independent parts such as a database migration + service update + UI changes.
    *   **Different Areas of Responsibility:** Separate features or different screens.
    *   **Sequential Dependencies:** If the completion of one item is a prerequisite for another, open separate tasks.
    *   **Single Responsibility:** Tightly coupled, atomic changes should be kept in a single task.

**Breakdown Decision:**
*   Single task → Proceed to Step 2.
*   Multiple tasks → Apply Step 2 to each task individually, then proceed to Step 3.

### 2. Apply Jira-PM Skill (For Each Task)

Draft **each task individually** using the format and principles of the `jira-pm` skill:

*   **Title & Issue Type:** Define a clear title and Issue Type (e.g., Task, Bug, Story).
*   **LLM Model Recommendation:** Suggest the optimal model based on the Antigravity Model Selection Guide (refer to the guide in the `jira-pm` skill or the table below, e.g., Claude Sonnet 4.6 (Thinking), Poolside Laguna M.1, etc.).
*   **Technical Details:** List the specific files (`src/...`) to be changed and architectural layers (Service, Context, UI) affected.
*   **Acceptance Criteria (AC):** Provide clear, testable criteria.
*   **Test Scenarios:** Define the unit and E2E browser test cases needed under `src/__tests__/`.
*   **Dependencies (If any):** Outline relationships between tickets, specifying `Blocks` or `Depends on` constraints.

> If there are multiple tasks, first list all of them in markdown:
> Number them clearly (e.g., `## Task 1: ...`, `## Task 2: ...`) and summarize their relationships.
> **Execution Order & Parallelism:** Explicitly outline the roadmap (sequence) for implementing these tasks and highlight which ones can be developed **in parallel** without blockers.

### 3. Request User Confirmation

If multiple tasks are detected, ask the user before creating them in JIRA:

> "I have identified X separate tasks: [list]. Would you like me to create all of them in JIRA, or would you prefer to select specific ones?"

*   If user approves **all** → Create them in JIRA sequentially in Step 4.
*   If user selects **specific tasks** → Create only the selected tasks.
*   If user declines or has no JIRA integration → Present only the markdown specifications.

### 4. Create in JIRA (Optional)

If `atlassian-mcp-server` is active and the user approves:

*   Call the `createJiraIssue` tool for each approved task.
*   Use the project key (`projectKey: WFP`) and required metadata fields.
*   For multiple tasks, link dependent issues using the `createIssueLink` tool with `Blocks` / `is blocked by` relationships.

### 5. Summary & Roadmap

*   Present the markdown specifications of all created tasks.
*   If JIRA tickets were created, provide direct links to them.
*   **Implementation Roadmap:** Present a clear schedule showing the execution sequence (Sequence) and parallel groups (Parallel) of tasks.
*   If dependencies exist, summarize which task blocks another.

---
**Critical Note:** When defining tasks, never recommend designs that violate the project's `rules.md` (e.g., bypass strict typing, avoid service layer). Always advocate for the project's existing architectural standards.

## Antigravity Model Selection Guide

When recommending a model for a task, refer to the following table and criteria to balance capability, speed, and quota/cost optimization:

### Model Comparison Table

| Model Group | Model Name | Speed / Latency | Reasoning Capability | Best Suited Tasks | Quota / Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Heavyweight / Leader** | Claude Opus 4.6 (Thinking) | Low (Slow) | Highest (⭐⭐⭐⭐⭐) | From-scratch architecture, massive bug hunting, algorithm design | Very High |
| **Industry Standard** | Claude Sonnet 4.6 (Thinking) | Medium-Fast | High (⭐⭐⭐⭐) | Complex refactoring, multi-file logic changes, daily core coding | Balanced / Premium |
| **Large Context** | Gemini 3.1 Pro (Low / High) | Medium | Advanced (⭐⭐⭐) | Devasa codebase/dokümantasyon tarama, uzun log analizi | Medium |
| **Speed and Routine** | Gemini 3.5 Flash (Low/Med/High) | Very Fast | Basic / Medium (⭐⭐) | Boilerplate writing, CSS/Tailwind, quick component creation | Economic |
| **Open Source Alt** | GPT-OSS 120B (Medium) | Medium | Standard (⭐⭐) | General coding, standard test writing, alternative logic search | Medium |
| **Free / Quota Friendly** | NVIDIA Nemotron 3 Super | Fast | Good (Specialized) | General coding, SQL, data manipulation (No main quota usage) | Free |
| **Free / Code Focused** | Poolside Laguna M.1 | Fast | Good (Code Focused) | Fast function completion, routine bug-fix (No main quota usage) | Free |

### Guidelines: Which Model to Recommend?

1. **Claude 4.6 Series (Thinking) - Complex Logic & Architecture:**
   * **Claude Sonnet 4.6 (Thinking):** The gold standard for coding. Recommend this for setting up state management from scratch, backend-frontend integrations, or major refactoring tasks.
   * **Claude Opus 4.6 (Thinking):** Reserved for the heaviest, most complex tasks. Use this when Sonnet fails on nested/isolated critical bugs or advanced performance optimizations. It is slow but highly precise.
2. **Gemini 3.1 Pro (Low / High) - Large Context & Deep Analysis:**
   * Recommend this when the task requires scanning a large codebase or analyzing thousands of lines of legacy code, logs, or extensive documentation to produce integration plans.
3. **Gemini 3.5 Flash Series - Speed & UI Tweaks:**
   * Recommend this for routine iterations, UI styling, CSS/Tailwind adjustments, and writing quick unit tests to preserve premium quota.
4. **GPT-OSS 120B (Medium) - Alternative Approach:**
   * Recommend this when seeking an alternative coding perspective or standard test coverage.
5. **Free Models (Laguna & Nemotron) - Routine Tasks & Quota Saving:**
   * **Poolside Laguna M.1:** Ideal for routine coding, quick function implementations, and simple bug fixes.
   * **NVIDIA Nemotron 3 Super:** Best for data manipulation, JSON operations, SQL writing, and algorithmic sub-functions.
