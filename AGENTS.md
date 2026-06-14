# AI Agent Entrypoint & Core Context

Welcome. If you are an AI agent working on this project, **you must read this file before doing anything else.** This file serves as the absolute single source of truth for the project's architecture, documentation structure, and rules.

## High-Level Architecture Overview

This project is a hybrid media application combining modern web technologies and a high-performance native system layer:

- **Core Framework:** Next.js 16.1.1 (App Router) + React 18
- **Desktop Environment:** Electron 39.2.7
- **Database / ORM:** PostgreSQL + Prisma 7.2.0 (`@prisma/adapter-pg`)
- **State Management:** Zustand 5.0.9
- **Authentication:** NextAuth (v5 beta) with credentials & magic link mechanisms
- **Styling:** Tailwind CSS v4, Radix UI (shadcn-ui approach), lucide-react
- **Media/Video Pipeline:** Hybrid approach using both web-based players and a highly specialized native C++ integration (`node-addon-api`) linking against MPV.

For more architectural details, refer to [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md).

## Documentation Map

The repository's documentation is modularly organized under the `/docs` directory. **Always navigate to the appropriate folder to read or update documentation.**

- **[`docs/map/map.md`](./docs/map/map.md)** - **Crucial:** Codebase sitemap listing every important file and folder with a short description. Consult this index to quickly locate files without scanning the entire repository.
- **[`docs/business/`](./docs/business/)** - Product vision, user stories, feature specifications, roadmap, phase plans, and general business logic rules.
- **[`docs/frontend/`](./docs/frontend/)** - UI architecture, screens, components, design systems, styling tokens, state management, and navigation rules.
- **[`docs/backend/`](./docs/backend/)** - API endpoints, server architecture, external integrations, services, authentication flows, and business logic implementation details.
- **[`docs/db/`](./docs/db/)** - Database schema definitions, tables, relationships, constraints, and security policies.
- **[`docs/migrations/`](./docs/migrations/)** - Database migration notes and SQL scripts.
- **[`docs/test/`](./docs/test/)** - Testing strategies, E2E test guides, unit test guides, and manual testing templates.
- **[`docs/tasks/`](./docs/tasks/)** - Archival folder for completed development tasks.

## Agent Guidelines & Workflow
1. **Understand Context:** Always check this file and [`docs/map/map.md`](./docs/map/map.md) first to ground yourself in the project.
2. **Read Specific Docs:** Navigate to the `/docs/` subdirectories to find specific details about the area you are working on.
3. **Follow Standard Processes:** Ensure you follow the project's strict guidelines (e.g., WIP=1, VCR=100%, strict TypeScript, robust testing before committing) as defined by user prompts and existing conventions.
4. **Update Documentation:** Whenever you add a feature, update the corresponding documentation file in its specific domain folder. Ensure you update [`docs/map/map.md`](./docs/map/map.md) whenever a file is added or removed.
