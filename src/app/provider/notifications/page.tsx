
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import NotificationManager from '@/components/provider/NotificationManager';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ProviderNotificationsPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    redirect('/provider/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          href="/provider/dashboard"
          className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Panele Dön
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Duyurular</h1>
          <p className="text-gray-300">Kullanıcılarınıza bildirim gönderin</p>
        </div>

        <NotificationManager />
      </div>
    </div>
  );
}
