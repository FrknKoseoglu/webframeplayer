import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { verifyPassword } from '@/lib/password';

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
  providers: [
    Credentials({
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        userType: { label: 'User Type', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password || !credentials?.userType) {
          return null;
        }

        const username = credentials.username as string;
        const password = credentials.password as string;
        const userType = credentials.userType as string;

        try {
          if (userType === 'SUPER_ADMIN') {
            const admin = await db.superAdmin.findUnique({
              where: { username },
            });

            if (!admin) return null;

            const isValid = await verifyPassword(password, admin.password);
            if (!isValid) return null;

            return {
              id: admin.id,
              name: admin.username,
              email: admin.email,
              role: 'SUPER_ADMIN',
            };
          } else if (userType === 'SERVICE_PROVIDER') {
            const provider = await db.serviceProvider.findUnique({
              where: { username },
            });

            if (!provider) return null;

            const isValid = await verifyPassword(password, provider.password);
            if (!isValid) return null;

            return {
              id: provider.id,
              name: provider.username,
              email: provider.email,
              role: 'SERVICE_PROVIDER',
            };
          }
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;

