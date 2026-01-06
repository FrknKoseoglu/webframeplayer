import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Public endpoint to fetch upcoming events
export async function GET() {
  const now = new Date();
  
  // Get events from all providers that are upcoming (or recently started - within last 2 hours)
  const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  
  const events = await db.calendarEvent.findMany({
    where: {
      eventDate: {
        gte: twoHoursAgo,
      },
    },
    select: {
      id: true,
      title: true,
      channel: true,
      channelId: true,
      eventDate: true,
    },
    orderBy: { eventDate: 'asc' },
    take: 50, // Limit to 50 events
  });

  return NextResponse.json(events);
}
