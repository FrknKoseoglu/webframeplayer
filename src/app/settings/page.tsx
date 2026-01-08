'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ArrowLeft } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const activeProfile = usePlayerStore(s => s.activeProfile);

  useEffect(() => {
    // Redirect to login if no profile is selected
    if (!activeProfile) {
      router.push('/login');
    }
  }, [activeProfile, router]);

  if (!activeProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--iptv-background)]">
      {/* Header */}
      <div className="sticky top-0 z-50 flex items-center gap-3 px-4 py-3 bg-[var(--iptv-surface-dark)] border-b border-white/10">
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <span className="text-lg font-bold text-white">Ayarlar</span>
      </div>
      
      {/* Settings Content */}
      <SettingsPanel />
    </div>
  );
}
