# Current Architecture

## 1. Technology Stack
- **Core Framework:** Next.js 16.1.1 (App Router) + React 18
- **Desktop Environment:** Electron 39.2.7
- **Database / ORM:** PostgreSQL + Prisma 7.2.0 (`@prisma/adapter-pg`)
- **State Management:** Zustand 5.0.9
- **Authentication:** NextAuth (v5 beta) with credentials & magic link mechanisms.
- **Styling:** Tailwind CSS v4, Radix UI (shadcn-ui approach), lucide-react.
- **Media/Video Pipeline:** Hybrid approach using both web-based players (`video.js`, `plyr`, `artplayer`, `@vidstack/react`, `hls.js`) and a highly specialized native C++ integration (`node-addon-api`) linking against MPV (`libmpv-2.dll`, `mpv_renderer.node`).
- **Data Parsing:** `iptv-playlist-parser`, `fast-xml-parser` for handling M3U playlists and EPG (XMLTV) data.

## 2. Navigation & Routing
- Handled entirely by the **Next.js App Router** (`src/app`).
- The Electron main process (`main.js`) spawns a window that loads either `localhost:3000` (in dev) or static output, offloading routing logic to Next.js.
- Modular route separation: `/login`, `/dashboard`, `/admin`, `/setup`, `/settings`.

## 3. State Management
- Relies on **Zustand** (`src/store/usePlayerStore.ts`) to manage global application state.
- This approach avoids deep React Context provider hell and ensures optimal performance for frequent updates (like player progress, channel switching, and EPG syncing).

## 4. Current Bottlenecks & Legacy Patterns
- **Player Fragmentation:** The project includes numerous player dependencies (`video.js`, `plyr`, `artplayer`, `vidstack`) alongside a custom MPV native implementation. This redundancy likely causes bundle bloat and maintenance confusion. Harmonizing around a single primary player (or standardizing the interface between web and native MPV) is a major architectural concern.
- **Native Module Overhead:** The project utilizes `node-gyp` and a custom `binding.gyp` for `mpv_renderer.node`. This introduces cross-platform build friction, meaning the CI/CD pipeline and local developer environments need extensive setup (e.g., specific Node versions, Python, C++ build tools).
- **Database Choice in a Desktop App:** Using PostgreSQL for an Electron-based desktop app may add significant overhead if it requires a local PG server instance, compared to the standard SQLite offline-first approach. If this app also acts as a centralized server or web interface, the PG choice makes sense, but the hybrid context requires strict boundary management.
- **IPC (Inter-Process Communication):** Relying on Next.js alongside Electron inherently means managing complex state syncs between Node.js (Electron Main), Native C++ addons (MPV), and the browser context (Next.js/React Renderer). 

## 5. Summary
The project operates as a heavy, multi-layered desktop media application. It blends modern web technologies (Next.js, Tailwind, Zustand) with high-performance native system layers (Electron, C++ MPV bindings). Standardizing the media pipeline and simplifying the build process are the primary targets for moving toward Harness Engineering standards.
