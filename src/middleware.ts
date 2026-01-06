import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Admin routes
  if (nextUrl.pathname.startsWith('/admin')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/adm/login', nextUrl));
    }
    if (userRole !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
  }

  // Provider routes
  if (nextUrl.pathname.startsWith('/provider')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/provider/login', nextUrl));
    }
    if (userRole !== 'SERVICE_PROVIDER') {
      return NextResponse.redirect(new URL('/', nextUrl));
    }
  }

  // API Admin routes
  if (nextUrl.pathname.startsWith('/api/admin')) {
    if (!isLoggedIn || userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // API Provider routes
  if (nextUrl.pathname.startsWith('/api/provider')) {
    if (!isLoggedIn || userRole !== 'SERVICE_PROVIDER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return NextResponse.next();
});

// Force Node.js runtime (required for crypto/bcrypt compatibility)
export const runtime = 'nodejs';

export const config = {
  matcher: [
    // Protect admin routes except login
    '/admin/dashboard/:path*',
    '/admin/providers/:path*',
    '/admin/customers/:path*',
    // Protect provider routes except login
    '/provider/dashboard/:path*',
    '/provider/customers/:path*',
    '/provider/links/:path*',
    '/provider/calendar/:path*',
    '/provider/notifications/:path*',
    '/provider/magic-links/:path*',
    // Protect API routes
    '/api/admin/:path*',
    '/api/provider/:path*',
  ],
};
