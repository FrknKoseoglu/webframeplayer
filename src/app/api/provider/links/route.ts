export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateShortCode } from '@/lib/short-code';

export async function GET() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const links = await db.shortLink.findMany({
    where: {
      providerId: session.user.id,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(links);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { originalUrl } = body;

  if (!originalUrl) {
    return NextResponse.json({ error: 'URL gerekli' }, { status: 400 });
  }

  const shortCode = generateShortCode();

  const link = await db.shortLink.create({
    data: {
      originalUrl,
      shortCode,
      providerId: session.user.id,
    },
  });

  return NextResponse.json(link);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  // Verify ownership
  const existing = await db.shortLink.findFirst({
    where: { id, providerId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  await db.shortLink.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

