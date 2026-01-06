import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { hashPassword } from '@/lib/password';

export async function GET() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const providers = await db.serviceProvider.findMany({
    include: {
      _count: {
        select: { customers: true },
      },
    },
  });

  return NextResponse.json(providers);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { username, password, email, userLimit } = body;

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const hashedPassword = await hashPassword(password);

  const provider = await db.serviceProvider.create({
    data: {
      username,
      password: hashedPassword,
      email: email || null,
      userLimit: userLimit || 10,
    },
  });

  return NextResponse.json(provider);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, email, userLimit, password } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing provider ID' }, { status: 400 });
  }

  // Build update data
  const updateData: { email: string | null; userLimit: number; password?: string } = {
    email: email || null,
    userLimit,
  };

  // Only update password if provided
  if (password && password.trim() !== '') {
    updateData.password = await hashPassword(password);
  }

  const provider = await db.serviceProvider.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json(provider);
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'Missing provider ID' }, { status: 400 });
  }

  await db.serviceProvider.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
