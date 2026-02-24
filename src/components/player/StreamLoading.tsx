'use client';

import { Loader2 } from 'lucide-react';
import { ChannelIcon } from '@/components/ui/ChannelIcon';

interface StreamLoadingProps {
  name?: string;
  logo?: string;
  isLive?: boolean;
  message?: string;
}

/**
 * Shared loading overlay for stream resolving / MPV loading.
 * VOD: large poster image. Live: small ChannelIcon.
 */
export function StreamLoading({ name, logo, isLive = false, message = 'Yükleniyor...' }: StreamLoadingProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-black text-center p-8">
      {!isLive && logo ? (
        <>
          <img src={logo} alt="" className="w-48 h-64 object-cover rounded-xl mb-4 shadow-2xl border border-white/10" />
          {name && <p className="text-white font-semibold text-lg mb-3 text-center max-w-xs truncate">{name}</p>}
        </>
      ) : (
        <>
          <ChannelIcon name={name || ''} logo={logo} className="w-16 h-16 text-2xl mb-3" imgClassName="w-14 h-14 object-contain" />
          {name && <p className="text-white font-semibold mb-2">{name}</p>}
        </>
      )}
      <Loader2 className="w-10 h-10 text-[var(--iptv-primary)] animate-spin mb-2" />
      <p className="text-white/50 text-sm">{message}</p>
    </div>
  );
}
