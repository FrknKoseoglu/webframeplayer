import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const events = await db.calendarEvent.findMany({
    where: {
      providerId: session.user.id,
    },
    orderBy: { eventDate: 'asc' },
  });

  return NextResponse.json(events);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { title, channel, channelId, eventDate, description } = body;

  if (!title || !channel || !eventDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const event = await db.calendarEvent.create({
    data: {
      title,
      channel,
      channelId: channelId || null,
      eventDate: new Date(eventDate),
      description,
      providerId: session.user.id,
    },
  });

  return NextResponse.json(event);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  // Verify ownership
  const existing = await db.calendarEvent.findFirst({
    where: { id, providerId: session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 });
  }

  await db.calendarEvent.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
