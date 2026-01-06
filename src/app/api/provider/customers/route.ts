import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateShortCode } from '@/lib/short-code';

export async function GET() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const customers = await db.customer.findMany({
    where: {
      providerId: session.user.id,
    },
    include: {
      magicLink: {
        select: {
          id: true,
          shortCode: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(customers);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check user limit
  const provider = await db.serviceProvider.findUnique({
    where: { id: session.user.id },
    include: {
      _count: { select: { customers: true } },
    },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  if (provider._count.customers >= provider.userLimit) {
    return NextResponse.json(
      { error: 'Kullanıcı limitinize ulaştınız. Yöneticinizle iletişime geçin.' },
      { status: 403 }
    );
  }

  const body = await request.json();
  const { name, type, xtreamUsername, xtreamPassword, xtreamHost, m3uUrl, expiryDate, createMagicLink, customMessage, customLogo } = body;

  if (!name || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (type === 'XTREAM' && (!xtreamUsername || !xtreamHost || !xtreamPassword)) {
    return NextResponse.json({ error: 'Xtream Code için gerekli alanlar eksik' }, { status: 400 });
  }

  if (type === 'M3U' && !m3uUrl) {
    return NextResponse.json({ error: 'M3U URL gerekli' }, { status: 400 });
  }

  // Create magic link first if requested
  let magicLinkId: string | null = null;
  if (createMagicLink) {
    const shortCode = generateShortCode();
    
    const magicLink = await db.magicLink.create({
      data: {
        shortCode,
        linkType: type,
        m3uUrl: type === 'M3U' ? m3uUrl : null,
        xtreamHost: type === 'XTREAM' ? xtreamHost : null,
        xtreamUser: type === 'XTREAM' ? xtreamUsername : null,
        xtreamPassword: type === 'XTREAM' ? xtreamPassword : null,
        serviceName: name,
        // Use custom values if provided, otherwise use provider defaults
        message: customMessage || provider.defaultMagicMessage || `${name} için IPTV hizmeti`,
        logoUrl: customLogo || provider.defaultMagicLogo || null,
        providerId: session.user.id,
      },
    });
    magicLinkId = magicLink.id;
  }

  const customer = await db.customer.create({
    data: {
      name,
      type,
      xtreamUsername: type === 'XTREAM' ? xtreamUsername : null,
      xtreamPassword: type === 'XTREAM' ? xtreamPassword : null,
      xtreamHost: type === 'XTREAM' ? xtreamHost : null,
      xtreamPort: null,
      m3uUrl: type === 'M3U' ? m3uUrl : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      providerId: session.user.id,
      magicLinkId,
    },
    include: {
      magicLink: {
        select: {
          id: true,
          shortCode: true,
        },
      },
    },
  });

  return NextResponse.json(customer);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, type, xtreamUsername, xtreamPassword, xtreamHost, m3uUrl, expiryDate } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
  }

  // Verify ownership
  const existing = await db.customer.findFirst({
    where: { id, providerId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  const customer = await db.customer.update({
    where: { id },
    data: {
      name,
      type,
      xtreamUsername: type === 'XTREAM' ? xtreamUsername : null,
      xtreamPassword: type === 'XTREAM' ? xtreamPassword : null,
      xtreamHost: type === 'XTREAM' ? xtreamHost : null,
      xtreamPort: null,
      m3uUrl: type === 'M3U' ? m3uUrl : null,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    },
  });

  return NextResponse.json(customer);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
  }

  // Verify ownership
  const existing = await db.customer.findFirst({
    where: { id, providerId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  await db.customer.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
