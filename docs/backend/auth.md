# Authentication Flows

## NextAuth Implementation
- **Configuration:** Auth logic is split between `src/lib/auth.config.ts` (edge-compatible config) and `src/lib/auth.ts` (Prisma/DB connected handlers).
- **Version:** NextAuth v5 beta.
- **Adapters:** Prisma Postgres Adapter (`@prisma/adapter-pg`) handles session persistence.

## Roles & Mechanisms
- **Credentials Provider:** Basic Username/Password for `SuperAdmin` and `ServiceProvider`.
- **Magic Links:** Handled via unique short codes (in the `/magic-link` route) allowing quick customer onboarding without passwords.
- **Session Management:** Sessions are strictly validated in `Next.js Server Actions` and API routes using the `auth()` helper to prevent unauthorized database modifications.
