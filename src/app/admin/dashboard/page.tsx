import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { redirect } from 'next/navigation';
import { signOut } from '@/lib/auth';
import { Users, FileText, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/adm/login');
  }

  const providersCount = await db.serviceProvider.count();
  const customersCount = await db.customer.count();

  return (
    <div className="min-h-screen bg-[var(--iptv-background)] text-white">
      {/* Header */}
      <div className="bg-[var(--iptv-surface)] border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[var(--iptv-primary)]/20 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-[var(--iptv-primary)]" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">Frame Admin</h1>
                <p className="text-[10px] text-white/40 font-mono tracking-wider">SYSTEM PANEL</p>
              </div>
            </div>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/adm/login' });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Çıkış</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-2">Hoş Geldiniz, <span className="text-[var(--iptv-primary)]">{session.user.name}</span></h2>
          <p className="text-white/40">Sistem genel durumunu buradan takip edebilirsiniz.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Service Providers Stat */}
          <div className="bg-[var(--iptv-surface)] p-6 rounded-2xl border border-white/5 hover:border-[var(--iptv-primary)]/20 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[var(--iptv-primary)]/10 rounded-xl group-hover:scale-105 transition-transform">
                <Users className="w-8 h-8 text-[var(--iptv-primary)]" />
              </div>
              <div>
                <p className="text-white/40 text-sm font-medium">Hizmet Sağlayıcılar</p>
                <p className="text-4xl font-bold mt-1 font-mono">{providersCount}</p>
              </div>
            </div>
          </div>

          {/* Customers Stat */}
          <div className="bg-[var(--iptv-surface)] p-6 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:scale-105 transition-transform">
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <p className="text-white/40 text-sm font-medium">Toplam Müşteri</p>
                <p className="text-4xl font-bold mt-1 font-mono">{customersCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/admin/providers"
            className="group relative bg-[var(--iptv-surface)] border border-white/5 rounded-2xl p-6 hover:border-[var(--iptv-primary)]/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-[var(--iptv-primary)]/10 rounded-xl group-hover:bg-[var(--iptv-primary)]/20 transition-colors">
                <Users className="w-6 h-6 text-[var(--iptv-primary)]" />
              </div>
              <div className="bg-white/5 px-2 py-1 rounded text-xs text-white/40 group-hover:bg-white/10 transition-colors">Yönet</div>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-[var(--iptv-primary)] transition-colors">Hizmet Sağlayıcıları</h3>
            <p className="text-white/40 text-sm">Satıcıları yönet, kredi ekle veya düzenle.</p>
          </Link>

          <Link
            href="/admin/customers"
            className="group relative bg-[var(--iptv-surface)] border border-white/5 rounded-2xl p-6 hover:border-blue-500/50 transition-all duration-300"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl group-hover:bg-blue-500/20 transition-colors">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="bg-white/5 px-2 py-1 rounded text-xs text-white/40 group-hover:bg-white/10 transition-colors">Görüntüle</div>
            </div>
            <h3 className="text-xl font-bold mb-2 group-hover:text-blue-400 transition-colors">Tüm Müşteriler</h3>
            <p className="text-white/40 text-sm">Sistemdeki tüm müşterileri görüntüle ve filtrele.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
