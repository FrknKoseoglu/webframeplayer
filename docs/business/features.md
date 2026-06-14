# Feature Specifications

See `docs/features.json` for the programmatic state of currently active features and WIP limits.

## Active & Completed Features
As per the current backlog in `features.json`:
- **TASK-001 (Harness Engineering Altyapısının Kurulması):** The base infrastructure for AI agents, rules, and documentation structure. This is complete.

## Core Domain Logic
1. **Media Playback:** Orchestrated by `usePlayerStore.ts` and `MasterPlayer.tsx`. Supports HLS, MP4 via Web engines, and robust codecs via MPV.
2. **EPG Parsing:** Managed by `src/lib/m3u-parser.ts` and `src/lib/xtream-adapter.ts`.
3. **Authentication:** Decoupled into `lib/auth.ts` focusing on NextAuth with Prisma.
