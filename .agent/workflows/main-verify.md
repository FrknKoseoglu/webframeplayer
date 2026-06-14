---
description: Verifies the health of the main branch and identifies the culprit branch/commit in case of failures.
---

# Main Branch Verification (Main-Verify) Workflow

This workflow is used to ensure the `main` branch remains stable and to quickly isolate the root cause when a regression is introduced. It is triggered by the `/main-verify` command.

## Steps

### 1. Main Branch Preparation

*   Switch to the main branch: `git checkout main`
*   Pull the latest updates: `git pull origin main`
*   Ensure dependencies are up to date (if package.json changed): `npm install`

### 2. Run Full Test Suite

*   Execute all unit and integration tests: `npm test`
*   **Result Check:**
    *   ✅ **PASS:** If all tests pass, report to the user: "Main branch is healthy and ready for deployment!"
    *   ❌ **FAIL:** If any test fails, proceed to **Step 3**.

### 3. Failure Analysis & Culprit Identification (Root Cause Analysis)

When tests fail on main, isolate the culprit branch or commit using the following steps:

1.  **Failure Clustering:** List the files/modules causing the failures.
2.  **Git History Scanning:**
    *   Examine the latest merge commits affecting the failing files: `git log --merges -n 5 -- <file_path>`
    *   Read merge commit messages to identify the source task branch (e.g., `task/wfp-68...`).
3.  **Blame Analysis:** Inspect recently modified lines in the failing file to identify the breaking commit.

### 4. Reporting & Resolution Plan

The agent presents a `main_health_report.md` containing:

*   🚨 **Failing Tests:** List of failing tests.
*   📉 **Regression Source:** The suspected branch/task and commit hash that introduced the issue.
*   🛠️ **Action Plan:**
    *   "Should we switch to the culprit branch to fix it there?"
    *   "Or should we apply an hotfix directly on main?"

### 5. Automatic Verification

*   If the issue is a simple import or type error, the agent can propose a hotfix and re-run tests.

---
**Critical Rule:** The main branch must never be left unhealthy. When a regression is identified, it must be resolved or reverted immediately.
