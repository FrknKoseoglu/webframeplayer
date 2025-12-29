'use client';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { useEffect, useRef } from 'react';
import { MediaPlayer, MediaProvider, type PlayerSrc, type MediaPlayerInstance } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Tv } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

interface VideoPlayerProps {
  src: PlayerSrc | null;
  title: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ src, title, autoPlay = true }: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const { volume, setVolume } = usePlayerStore();

  // Set initial volume and listen for changes
  useEffect(() => {
    const player = playerRef.current;
    if (player) {
      player.volume = volume;
    }
  }, [src]); // Re-apply when source changes

  const handleVolumeChange = (detail: { volume: number }) => {
    setVolume(detail.volume);
  };

  if (!src) {
    return (
      <div className="aspect-video w-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center">
        <div className="relative">
          {/* Cinematic glow effect */}
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-[var(--iptv-primary)]/20 via-red-600/20 to-orange-600/20 rounded-full scale-150" />
          
          <div className="relative z-10 flex flex-col items-center gap-6 p-12">
            <div className="p-6 rounded-full bg-zinc-800/50 border border-zinc-700/50">
              <Tv className="w-16 h-16 text-zinc-400" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-semibold text-white">
                Kanal Seçin
              </h2>
              <p className="text-zinc-400 max-w-md">
                İzlemeye başlamak için listeden bir kanal seçin
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full bg-black">
      <MediaPlayer
        ref={playerRef}
        title={title}
        src={src}
        playsInline
        autoPlay={autoPlay}
        volume={volume}
        logLevel="silent"
        onVolumeChange={handleVolumeChange}
        onError={(e) => console.warn('Player error:', e.message)}
        className="w-full h-full"
      >
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}
