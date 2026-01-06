import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import CustomersTable from '@/components/admin/CustomersTable';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminCustomersPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/adm/login');
  }

  const customers = await db.customer.findMany({
    include: {
      provider: {
        select: {
          username: true,
        },
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
          <h1 className="text-lg font-bold tracking-tight">Tüm Müşteriler</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <p className="text-white/40">Sistemdeki tüm müşterileri görüntüle</p>
        </div>

        <CustomersTable customers={customers} />
      </div>
    </div>
  );
}
