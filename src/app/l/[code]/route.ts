import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    // First try to find AdminShortLink
    const adminLink = await db.adminShortLink.findUnique({
      where: { shortCode: code },
    });

    if (adminLink) {
      await db.adminShortLink.update({
        where: { id: adminLink.id },
        data: { clicks: { increment: 1 } },
      });
      return NextResponse.redirect(adminLink.originalUrl);
    }

    // Fallback: try to find Provider's ShortLink
    const providerLink = await db.shortLink.findUnique({
      where: { shortCode: code },
    });

    if (providerLink) {
      await db.shortLink.update({
        where: { id: providerLink.id },
        data: { clicks: { increment: 1 } },
      });
      return NextResponse.redirect(providerLink.originalUrl);
    }

    return NextResponse.redirect(new URL('/404', request.url));
  } catch (error) {
    console.error('[SHORTLINK_GET_ERROR]', error);
    return NextResponse.redirect(new URL('/500', request.url));
  }
}
