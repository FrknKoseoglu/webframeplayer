import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'SUPER_ADMIN' | 'SERVICE_PROVIDER';
    } & DefaultSession['user'];
  }

  interface User {
    role: 'SUPER_ADMIN' | 'SERVICE_PROVIDER';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'SUPER_ADMIN' | 'SERVICE_PROVIDER';
  }
}
