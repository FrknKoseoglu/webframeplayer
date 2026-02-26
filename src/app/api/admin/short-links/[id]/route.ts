import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { originalUrl } = body;

    if (!originalUrl) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const { id } = await params;

    const link = await db.adminShortLink.update({
      where: { id },
      data: { originalUrl },
    });

    return NextResponse.json(link);
  } catch (error) {
    console.error('[ADMIN_SHORTLINK_PUT]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== 'SUPER_ADMIN') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { id } = await params;

    await db.adminShortLink.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[ADMIN_SHORTLINK_DELETE]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
