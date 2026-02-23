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

  const magicLinks = await db.magicLink.findMany({
    where: {
      providerId: session.user.id,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(magicLinks);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { 
    linkType, 
    m3uUrl, 
    xtreamHost, 
    xtreamUser, 
    xtreamPassword,
    serviceName,
    message, 
    logoUrl, 
    supportUrl,
    validUntil 
  } = body;

  // Validate required fields based on link type
  if (linkType === 'M3U' && !m3uUrl) {
    return NextResponse.json({ error: 'M3U URL gerekli' }, { status: 400 });
  }
  if (linkType === 'XTREAM' && (!xtreamHost || !xtreamUser || !xtreamPassword)) {
    return NextResponse.json({ error: 'Xtream bilgileri gerekli' }, { status: 400 });
  }

  const shortCode = generateShortCode();

  const magicLink = await db.magicLink.create({
    data: {
      shortCode,
      linkType: linkType || 'XTREAM',
      m3uUrl: linkType === 'M3U' ? m3uUrl : null,
      xtreamHost: linkType === 'XTREAM' ? xtreamHost : null,
      xtreamUser: linkType === 'XTREAM' ? xtreamUser : null,
      xtreamPassword: linkType === 'XTREAM' ? xtreamPassword : null,
      serviceName,
      message: message || 'IPTV hizmetiniz hazır!',
      logoUrl,
      supportUrl,
      validUntil: validUntil ? new Date(validUntil) : null,
      providerId: session.user.id,
    },
  });

  return NextResponse.json(magicLink);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  // Verify ownership
  const existing = await db.magicLink.findFirst({
    where: { id, providerId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Magic link not found' }, { status: 404 });
  }

  await db.magicLink.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

