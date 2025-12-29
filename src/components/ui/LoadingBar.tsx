'use client';

import { usePlayerStore } from '@/store/usePlayerStore';

export function LoadingBar() {
  const { isLoading, loadingStep } = usePlayerStore();

  if (!isLoading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Progress bar */}
      <div className="h-0.5 bg-[var(--iptv-primary)]/20">
        <div 
          className="h-full bg-[var(--iptv-primary)] animate-pulse transition-all duration-300"
          style={{ width: '100%' }}
        />
      </div>
      {/* Loading indicator animation */}
      <div className="h-0.5 bg-transparent overflow-hidden">
        <div className="h-full w-1/3 bg-gradient-to-r from-transparent via-[var(--iptv-primary)] to-transparent animate-[loading_1s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
