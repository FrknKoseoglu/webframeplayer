import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const provider = await db.serviceProvider.findUnique({
    where: { id: session.user.id },
    select: {
      defaultMagicMessage: true,
      defaultMagicLogo: true,
      defaultMagicHost: true,
      defaultSupportUrl: true,
    },
  });

  return NextResponse.json({
    defaultMagicMessage: provider?.defaultMagicMessage || '',
    defaultMagicLogo: provider?.defaultMagicLogo || '',
    defaultMagicHost: provider?.defaultMagicHost || '',
    defaultSupportUrl: provider?.defaultSupportUrl || '',
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { defaultMagicMessage, defaultMagicLogo, defaultMagicHost, defaultSupportUrl } = body;

  await db.serviceProvider.update({
    where: { id: session.user.id },
    data: {
      defaultMagicMessage: defaultMagicMessage || null,
      defaultMagicLogo: defaultMagicLogo || null,
      defaultMagicHost: defaultMagicHost || null,
      defaultSupportUrl: defaultSupportUrl || null,
    },
  });

  return NextResponse.json({ success: true });
}
