# Navigation Rules

## App Router Structure
- Next.js 16 (App Router) is used for routing within `src/app`.
- **Primary Routes:**
  - `/login`: User authentication.
  - `/dashboard`: Main playback interface.
  - `/admin`: SuperAdmin and ServiceProvider dashboard (multi-tenant).
  - `/setup`: Initial onboarding or config parsing.
  - `/settings`: User preferences.
  - `/magic-link`: Handles direct magic link authentications.

## Electron Integration
- The Electron main process (`main.js`) spawns a window that points to Next.js (`localhost:3000` in dev). All UI routing is natively handled by the Next.js router. `layout.tsx` globally manages Next.js fonts and core HTML structure.
