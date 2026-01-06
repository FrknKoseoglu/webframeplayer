import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notifications = await db.notification.findMany({
    where: {
      providerId: session.user.id,
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, message, targetType, targetIds } = body;

  if (!title || !message || !targetType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const notification = await db.notification.create({
    data: {
      title,
      message,
      targetType,
      targetIds: targetIds || [],
      providerId: session.user.id,
    },
  });

  return NextResponse.json(notification);
}
