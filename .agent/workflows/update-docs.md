---
description: Standardized steps to verify sitemap synchronization and update documentation when codebase changes occur.
---

# Documentation Update and Sitemap Synchronization (Update-Docs) Workflow

This workflow ensures the repository's documentation directory (`docs/`) and the central sitemap ([map.md](../../docs/map/map.md)) remain up-to-date and consistent with the actual filesystem structure. It must be executed whenever new modules, folders, screens, components, services, or utilities are added or modified.

## Steps

### 1. Identify Workspace Changes

*   Analyze git status and file additions/deletions:
    ```bash
    git status
    ```
*   Determine if any new directories, components, screens, services, or utilities were created or deleted during implementation.

### 2. Update the Project Map ([map.md](../../docs/map/map.md))

*   **Folder Tree Alignment:** If a new folder or directory is created under `src/`, `docs/`, or any other top-level section, add it to the **📂 Directory Tree Overview** section of [map.md](../../docs/map/map.md).
*   **File Reference Registration:** Add the file path (using relative syntax, e.g., `./src/components/NewComponent.tsx`) and a concise description of its purpose under the appropriate section of [map.md](../../docs/map/map.md).
*   **Critical Rule:** Do **NOT** use absolute or local paths (such as `file:///c:/...` or `C:\Users\...`). Always use relative paths starting with a dot (e.g., `./docs/map/map.md` or `./docs/README.md`).

### 3. Maintain Documentation Files (`docs/`)

*   **README Currency:** If a new feature, service, or module is introduced, update the respective directory README (e.g., [docs/README.md](../../docs/README.md) or [docs/backend/README.md](../../docs/backend/README.md)) to reflect its existence and usage.
*   **Database Schema Updates:** If schema or migration files are added under `docs/migrations/`, make sure to document new tables, relationships, or RLS policies in [docs/db/schema/schema.md](../../docs/db/schema/schema.md).
*   **Test Notes Synchronization:** If a screen, component, or critical feature has been added or modified, update [docs/test-notes-template.md](../../docs/test-notes-template.md) to keep it in sync with the latest architecture.

### 4. Verification Check

Before concluding a task, run a self-check verification:
*   Ensure that all newly added files are present in [map.md](../../docs/map/map.md).
*   Ensure that no absolute paths were accidentally committed to the documentation files.
*   Verify formatting and links in all edited/created `.md` files.

### 5. Task Archiving (Mandatory Completion Step)

Upon completing a task, you must run the archiving command to move task tracking documents from the brain directory to the permanent repository location:
```bash
npm run archive-task -- -a <path-to-artifacts-dir>
```
*   This command programmatically checks and transitions `task.md`, `verification_report.md` (renamed as `verification.md`), and `walkthrough.md` into `docs/tasks/<jira-id-or-branch-name>/`.
*   Ensure all archived documents are committed and pushed.
