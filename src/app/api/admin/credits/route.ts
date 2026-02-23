import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// POST - Add credits to a provider (Admin only)
export async function POST(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { providerId, amount, description } = body;

  if (!providerId || !amount || amount <= 0) {
    return NextResponse.json({ error: 'Missing required fields or invalid amount' }, { status: 400 });
  }

  try {
    // Use transaction for atomic credit addition
    const result = await db.$transaction(async (tx) => {
      // 1. Increment credits
      const provider = await tx.serviceProvider.update({
        where: { id: providerId },
        data: { credits: { increment: amount } },
      });

      // 2. Create credit log
      await tx.creditLog.create({
        data: {
          amount: amount,
          description: description || `${amount} kredi eklendi`,
          providerId: providerId,
        },
      });

      return provider;
    });

    return NextResponse.json({ 
      success: true, 
      credits: result.credits,
      message: `${amount} kredi başarıyla eklendi` 
    });
  } catch (error) {
    console.error('Error adding credits:', error);
    return NextResponse.json({ error: 'Kredi ekleme başarısız' }, { status: 500 });
  }
}

// GET - Get credit history for a provider (Admin only)
export async function GET(request: NextRequest) {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const providerId = searchParams.get('providerId');

  if (!providerId) {
    return NextResponse.json({ error: 'Missing providerId' }, { status: 400 });
  }

  const logs = await db.creditLog.findMany({
    where: { providerId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(logs);
}
