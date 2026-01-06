import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import CustomersTable from '@/components/admin/CustomersTable';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminCustomersPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin/login');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-purple-300 hover:text-purple-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Panele Dön
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Tüm Müşteriler</h1>
          <p className="text-gray-300">Sistemdeki tüm müşterileri görüntüle</p>
        </div>

        <CustomersTable customers={customers} />
      </div>
    </div>
  );
}
