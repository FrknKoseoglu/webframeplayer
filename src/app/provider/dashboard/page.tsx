import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { Users, Calendar, Bell, Sparkles, LogOut, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default async function ProviderDashboard() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SERVICE_PROVIDER') {
    redirect('/provider/login');
  }

  const provider = await db.serviceProvider.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          customers: true,
          calendarEvents: true,
          magicLinks: true,
        },
      },
    },
  });

  if (!provider) {
    redirect('/provider/login');
  }

  // Get expiring customers
  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(today.getDate() + 30);

  const expiringCustomers = await db.customer.findMany({
    where: {
      providerId: session.user.id,
      expiryDate: {
        lte: in30Days,
        gte: today,
      },
    },
    orderBy: {
      expiryDate: 'asc',
    },
  });

  const urgent = expiringCustomers.filter((c) => {
    if (!c.expiryDate) return false;
    const diffDays = Math.ceil((c.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 1;
  });

  const soon = expiringCustomers.filter((c) => {
    if (!c.expiryDate) return false;
    const diffDays = Math.ceil((c.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 1 && diffDays <= 7;
  });

  const upcoming = expiringCustomers.filter((c) => {
    if (!c.expiryDate) return false;
    const diffDays = Math.ceil((c.expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 7 && diffDays <= 30;
  });

  return (
    <div className="min-h-screen bg-[var(--iptv-background)]">
      {/* Header */}
      <div className="bg-[var(--iptv-surface)]/50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">IPTV Hizmet Sağlayıcı Paneli</h1>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/provider/login' });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
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
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">Hoş Geldiniz, {session.user.name}</h2>
          <p className="text-zinc-400">Kullanıcılarınızı ve hizmetlerinizi buradan yönetin</p>
        </div>

        {/* Customer Limit Warning */}
        {provider._count.customers >= provider.userLimit && (
          <div className="mb-6 p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400" />
            <p className="text-orange-300">
              Kullanıcı limitinize ulaştınız ({provider._count.customers}/{provider.userLimit}). 
              Yeni kullanıcı eklemek için yöneticinizle iletişime geçin.
            </p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[var(--iptv-surface)]/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <Users className="w-8 h-8 text-purple-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Kullanıcılar</p>
                <p className="text-3xl font-bold text-white">
                  {provider._count.customers} <span className="text-zinc-500 text-lg">/ {provider.userLimit}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--iptv-surface)]/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                <Sparkles className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm">Kalan Kullanım Hakkı</p>
                <p className="text-3xl font-bold text-white">{provider.userLimit - provider._count.customers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Renewal Warnings */}
        {expiringCustomers.length > 0 && (
          <div className="mb-8 bg-[var(--iptv-surface)]/50 backdrop-blur-xl rounded-2xl p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-purple-400" />
              Yenileme Uyarıları
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {urgent.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                  <p className="text-red-300 font-semibold mb-1">Acil ({urgent.length})</p>
                  <p className="text-red-400/80 text-sm">1 gün veya daha az kaldı</p>
                </div>
              )}
              
              {soon.length > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                  <p className="text-orange-300 font-semibold mb-1">Yakında ({soon.length})</p>
                  <p className="text-orange-400/80 text-sm">1-7 gün arası kaldı</p>
                </div>
              )}
              
              {upcoming.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                  <p className="text-yellow-300 font-semibold mb-1">Gelecek ({upcoming.length})</p>
                  <p className="text-yellow-400/80 text-sm">7-30 gün arası kaldı</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <Link
            href="/provider/customers"
            className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-6 hover:shadow-2xl hover:shadow-purple-500/20 transform hover:scale-[1.02] transition-all"
          >
            <Users className="w-8 h-8 text-white mb-3" />
            <h3 className="text-xl font-bold text-white mb-1">Kullanıcı Yönetimi</h3>
            <p className="text-purple-200">Kullanıcı ekle, düzenle ve yönet</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
