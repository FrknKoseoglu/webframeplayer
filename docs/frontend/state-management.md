# State Management

## Global State (Zustand)
- **Library:** Zustand (`src/store/usePlayerStore.ts`)
- **Persistence:** Local state is saved to IndexedDB (`idb-keyval`) via Zustand's `persist` middleware.

### `usePlayerStore` Responsibilities:
1. **Profile Management:** Handles multiple active credentials and profiles.
2. **Content Data:** Stores fetched M3U/Xtream `content` array and linearly builds a `searchIndex` for optimized client-side searching.
3. **Player State:** Controls `activeContent`, `isPlaying`, `playbackError`, and limits history tracking.
4. **UI State:** Tracks active categories, sidebar status, loading states, and favorites.
5. **EPG State:** Caches full EPG data per channel and prevents redundant fetching.

## Server State
- React Server Components fetch and mutate database data naturally. Next.js Server Actions are preferred for data mutations to reduce client-side footprint.
