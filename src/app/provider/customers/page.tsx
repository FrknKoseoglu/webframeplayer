import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import CustomerManager from '@/components/provider/CustomerManager';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ProviderCustomersPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    redirect('/provider/login');
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

  const provider = await db.serviceProvider.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  });

  return (
    <div className="min-h-screen bg-[var(--iptv-background)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/provider/dashboard"
          className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Panele Dön
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">Kullanıcı Yönetimi</h1>
          <p className="text-zinc-400">Kullanıcılarınızı ekle, düzenle ve yönet</p>
        </div>

        <CustomerManager
          customers={customers}
          currentCount={customers.length}
          credits={provider?.credits || 0}
        />
      </div>
    </div>
  );
}
