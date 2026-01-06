import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import ProvidersList from '@/components/admin/ProvidersList';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ProvidersPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/adm/login');
  }

  const providers = await db.serviceProvider.findMany({
    include: {
      _count: {
        select: { customers: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen bg-[var(--iptv-background)] text-white">
      <div className="border-b border-white/5 bg-[var(--iptv-surface)] sticky top-0 z-40 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-px bg-white/10"></div>
          <h1 className="text-lg font-bold tracking-tight">Hizmet Sağlayıcıları</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Yönetim</h2>
          <p className="text-white/40">Tüm hizmet sağlayıcıları yönet, düzenle ve limitleri ayarla</p>
        </div>

        <ProvidersList providers={providers} />
      </div>
    </div>
  );
}
