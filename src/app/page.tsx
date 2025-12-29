'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { activeProfile, profiles } = usePlayerStore();

  useEffect(() => {
    // If there's an active profile, go to dashboard
    if (activeProfile) {
      router.replace('/dashboard');
      return;
    }

    // If there are saved profiles but none active, go to login to select
    // If no profiles at all, go to login to create one
    router.replace('/login');
  }, [activeProfile, profiles, router]);

  // Loading state while redirecting
  return (
    <div className="min-h-screen bg-[var(--iptv-background)] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-[var(--iptv-primary)] animate-spin" />
        <p className="text-white/60 text-sm">Yükleniyor...</p>
      </div>
    </div>
  );
}
