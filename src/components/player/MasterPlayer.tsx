'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { VideoPlayer } from './VideoPlayer';
import { VodPlayer } from './VodPlayer';
import { Tv } from 'lucide-react';
import { getStreamUrl } from '@/lib/url-helper';

interface MasterPlayerProps {
  autoPlay?: boolean;
}

export function MasterPlayer({ autoPlay = false }: MasterPlayerProps) {
  const activeContent = usePlayerStore((state) => state.activeContent);
  const isPlaying = usePlayerStore((state) => state.isPlaying);

  // No content selected
  if (!activeContent) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-center p-8">
        <Tv className="w-20 h-20 text-white/20 mb-6" />
        <h3 className="text-white/60 text-xl font-medium mb-2">İçerik Seçin</h3>
        <p className="text-white/40 text-sm max-w-sm">
          Sol taraftaki listeden izlemek istediğiniz kanalı veya içeriği seçin
        </p>
      </div>
    );
  }

  // Build the stream URL using smart proxy helper
  const streamUrl = activeContent.type === 'live'
    ? activeContent.url
    : getStreamUrl(activeContent.url);

  // Live TV → Vidstack
  if (activeContent.type === 'live') {
    return (
      <VideoPlayer
        src={streamUrl}
        title={activeContent.name}
        autoPlay={true}
      />
    );
  }

  // VOD (Movie/Series) → Artplayer
  // Only show player if isPlaying is true
  if (!isPlaying) {
    return null; // Will be replaced by PlayerPreview from parent
  }

  return (
    <VodPlayer
      src={streamUrl}
      poster={activeContent.logo}
      title={activeContent.name}
    />
  );
}
