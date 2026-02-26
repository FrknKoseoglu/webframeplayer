import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';
import { nanoid } from 'nanoid';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const links = await db.adminShortLink.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('[ADMIN_SHORTLINK_GET]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { originalUrl, customCode } = body;

    if (!originalUrl) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    let shortCode = customCode;
    if (!shortCode) {
      // Generate a random 6-character code
      shortCode = nanoid(6);
    }

    const existingCode = await db.adminShortLink.findUnique({
      where: { shortCode },
    });

    if (existingCode) {
      return new NextResponse('Shortcode already exists', { status: 400 });
    }

    const shortLink = await db.adminShortLink.create({
      data: {
        originalUrl,
        shortCode,
      },
    });

    return NextResponse.json(shortLink);
  } catch (error) {
    console.error('[ADMIN_SHORTLINK_POST]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
