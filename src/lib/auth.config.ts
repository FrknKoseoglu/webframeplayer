import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: '/adm/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdminPanel = nextUrl.pathname.startsWith('/admin');
      const isOnProviderPanel = nextUrl.pathname.startsWith('/provider');
      
      if (isOnAdminPanel || isOnProviderPanel) {
        if (isLoggedIn) return true;
        return false;
      }
      
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as 'SUPER_ADMIN' | 'SERVICE_PROVIDER';
      }
      return session;
    },
  },
  providers: [], // Providers configured in auth.ts
} satisfies NextAuthConfig;

