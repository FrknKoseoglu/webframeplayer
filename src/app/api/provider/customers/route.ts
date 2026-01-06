import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { generateShortCode } from '@/lib/short-code';

// Constants
const LOCK_MINUTES = 15; // Minutes after which critical fields are locked

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

  // Check credits
  const provider = await db.serviceProvider.findUnique({
    where: { id: session.user.id },
  });

  if (!provider) {
    return NextResponse.json({ error: 'Provider not found' }, { status: 404 });
  }

  if (provider.credits <= 0) {
    return NextResponse.json(
      { error: 'Yetersiz bakiye. Kredi yüklemek için yöneticinizle iletişime geçin.' },
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

  try {
    // Use transaction for atomic credit deduction
    const result = await db.$transaction(async (tx) => {
      // 1. Decrement credits
      // 1. Decrement credits (Atomic check inside transaction)
      await tx.serviceProvider.update({
        where: { 
          id: session.user.id,
          credits: { gt: 0 } // PREVENTS DOUBLE SPEND / RACE CONDITION
        },
        data: { credits: { decrement: 1 } },
      });

      // 2. Create magic link if requested
      let magicLinkId: string | null = null;
      if (createMagicLink) {
        const shortCode = generateShortCode();
        
        const magicLink = await tx.magicLink.create({
          data: {
            shortCode,
            linkType: type,
            m3uUrl: type === 'M3U' ? m3uUrl : null,
            xtreamHost: type === 'XTREAM' ? xtreamHost : null,
            xtreamUser: type === 'XTREAM' ? xtreamUsername : null,
            xtreamPassword: type === 'XTREAM' ? xtreamPassword : null,
            serviceName: name,
            message: customMessage || provider.defaultMagicMessage || `${name} için IPTV hizmeti`,
            logoUrl: customLogo || provider.defaultMagicLogo || null,
            providerId: session.user.id,
          },
        });
        magicLinkId = magicLink.id;
      }

      // 3. Create customer
      const customer = await tx.customer.create({
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

      // 4. Create credit log
      await tx.creditLog.create({
        data: {
          amount: -1,
          description: `Yeni kullanıcı: ${name}`,
          providerId: session.user.id,
        },
      });

      return customer;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'İşlem başarısız' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, name, type, xtreamUsername, xtreamPassword, xtreamHost, m3uUrl, expiryDate, notes, regenerateMagicLink } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing customer ID' }, { status: 400 });
  }

  // Verify ownership and get createdAt
  const existing = await db.customer.findFirst({
    where: { id, providerId: session.user.id },
    include: { magicLink: true },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
  }

  // Calculate time difference in minutes
  const now = new Date();
  const createdAt = new Date(existing.createdAt);
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);

  // Check if we're past the lock period
  const isLocked = diffMinutes > LOCK_MINUTES;

  // Critical fields that get locked
  const criticalFieldsChanged = 
    (xtreamUsername && xtreamUsername !== existing.xtreamUsername) ||
    (xtreamHost && xtreamHost !== existing.xtreamHost) ||
    (m3uUrl && m3uUrl !== existing.m3uUrl);

  if (isLocked && criticalFieldsChanged) {
    return NextResponse.json(
      { 
        error: 'Kötüye kullanımı önlemek amacıyla kullanıcı adı ve sunucu adresi 15 dakika sonra kilitlenir. Yeni kullanıcı oluşturun.',
        code: 'FIELDS_LOCKED'
      },
      { status: 403 }
    );
  }

  // Build update data based on lock status
  const updateData: Record<string, unknown> = {
    name,
    expiryDate: expiryDate ? new Date(expiryDate) : null,
    notes: notes || null,
  };

  // Always allow password update
  if (type === 'XTREAM') {
    updateData.xtreamPassword = xtreamPassword || null;
  }

  // Only update critical fields if not locked
  if (!isLocked) {
    updateData.type = type;
    if (type === 'XTREAM') {
      updateData.xtreamUsername = xtreamUsername || null;
      updateData.xtreamHost = xtreamHost || null;
      updateData.xtreamPort = null;
      updateData.m3uUrl = null;
    } else {
      updateData.m3uUrl = m3uUrl || null;
      updateData.xtreamUsername = null;
      updateData.xtreamPassword = null;
      updateData.xtreamHost = null;
      updateData.xtreamPort = null;
    }
  }

  // Handle magic link regeneration
  if (regenerateMagicLink) {
    // Delete old magic link if exists
    if (existing.magicLinkId) {
      await db.magicLink.delete({
        where: { id: existing.magicLinkId },
      });
    }

    // Create new magic link
    const provider = await db.serviceProvider.findUnique({
      where: { id: session.user.id },
    });

    const shortCode = generateShortCode();
    const newMagicLink = await db.magicLink.create({
      data: {
        shortCode,
        linkType: type || existing.type,
        m3uUrl: type === 'M3U' ? (m3uUrl || existing.m3uUrl) : null,
        xtreamHost: type === 'XTREAM' ? (xtreamHost || existing.xtreamHost) : null,
        xtreamUser: type === 'XTREAM' ? (xtreamUsername || existing.xtreamUsername) : null,
        xtreamPassword: type === 'XTREAM' ? (xtreamPassword || existing.xtreamPassword) : null,
        serviceName: name || existing.name,
        message: provider?.defaultMagicMessage || `${name || existing.name} için IPTV hizmeti`,
        logoUrl: provider?.defaultMagicLogo || null,
        providerId: session.user.id,
      },
    });

    updateData.magicLinkId = newMagicLink.id;
  }

  const customer = await db.customer.update({
    where: { id },
    data: updateData,
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

  // Delete customer - NO credit refund (burn strategy)
  await db.customer.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
