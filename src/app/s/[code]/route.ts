import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  const link = await db.shortLink.findUnique({
    where: { shortCode: code },
  });

  if (!link) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Increment clicks
  await db.shortLink.update({
    where: { id: link.id },
    data: { clicks: link.clicks + 1 },
  });

  return NextResponse.redirect(link.originalUrl);
}
