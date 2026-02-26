import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ShortLinkManager from '@/components/admin/ShortLinkManager';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function AdminShortLinksPage() {
  const session = await auth();
  
  if (!session || session.user.role !== 'SUPER_ADMIN') {
    redirect('/adm/login');
  }

  return (
    <div className="min-h-screen bg-[var(--iptv-background)]">
      {/* Header matching other admin pages */}
      <div className="bg-[var(--iptv-surface)] border-b border-white/5 sticky top-0 z-50 backdrop-blur-xl bg-opacity-80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/dashboard"
              className="text-white/40 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-lg font-bold tracking-tight text-white">Link Kısaltıcı</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ShortLinkManager />
      </div>
    </div>
  );
}
