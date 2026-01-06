import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { Users, FileText, LogOut } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/admin/login');
  }

  const providersCount = await db.serviceProvider.count();
  const customersCount = await db.customer.count();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">IPTV Yönetim Paneli</h1>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/admin/login' });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Çıkış
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Hoş Geldiniz, {session.user.name}</h2>
          <p className="text-gray-300">Tüm sistem verilerinize buradan erişebilirsiniz</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Users className="w-8 h-8 text-purple-300" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Toplam Hizmet Sağlayıcı</p>
                <p className="text-4xl font-bold text-white">{providersCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-500/20 rounded-xl">
                <FileText className="w-8 h-8 text-pink-300" />
              </div>
              <div>
                <p className="text-gray-300 text-sm">Toplam Müşteri</p>
                <p className="text-4xl font-bold text-white">{customersCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/providers"
            className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-6 hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <h3 className="text-xl font-bold text-white mb-2">Hizmet Sağlayıcıları Yönet</h3>
            <p className="text-purple-100">Tüm hizmet sağlayıcılarını görüntüle ve yönet</p>
          </Link>

          <Link
            href="/admin/customers"
            className="bg-gradient-to-br from-pink-600 to-orange-600 rounded-2xl p-6 hover:shadow-2xl transform hover:scale-105 transition-all"
          >
            <h3 className="text-xl font-bold text-white mb-2">Tüm Müşteriler</h3>
            <p className="text-pink-100">Sistemdeki tüm müşterileri görüntüle</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
