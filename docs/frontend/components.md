# Frontend Components & UI Architecture

## Styling & Tokens
- **Framework:** Tailwind CSS v4
- **Component Library:** Radix UI primitives (`src/components/ui/` such as `dialog.tsx`, `select.tsx`, `tabs.tsx`)
- **Icons:** `lucide-react`

## Player Component Hierarchy
Located in `src/components/player/`, the media pipeline is highly modularized:
- **`MasterPlayer.tsx`**: The overarching component bridging different playback engines.
- **`MpvPlayer.tsx`**: Handles native C++ `mpv_renderer.node` bindings.
- **`VideoPlayer.tsx` & `VodPlayer.tsx`**: Web-based fallback players.
- **`PlayerPreview.tsx` & `StreamLoading.tsx`**: UI states for buffering and preview modes.

## Component Guidelines
- Reusable, atomic design elements strictly live in `src/components/ui/`.
- Heavy, stateful modules reside in their respective feature folders.
- Modals like `CorsErrorModal.tsx` and `UnsupportedCodecModal.tsx` intercept playback errors globally.
