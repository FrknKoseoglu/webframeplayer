'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { VideoPlayer } from './VideoPlayer';
import { VodPlayer } from './VodPlayer';
import { MpvPlayer } from './MpvPlayer';
import { Tv, Loader2 } from 'lucide-react';
import { ChannelIcon } from '@/components/ui/ChannelIcon';
import { StreamLoading } from './StreamLoading';
import { getStreamUrl } from '@/lib/url-helper';
import { resolveStreamUrl } from '@/app/actions/stream-resolver';

interface MasterPlayerProps {
  autoPlay?: boolean;
}

export function MasterPlayer({ autoPlay = false }: MasterPlayerProps) {
  const activeContent = usePlayerStore((state) => state.activeContent);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  
  // State for resolved stream URL
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Determine if we should use MPV (only in Electron, resets on new video)
  const isElectron = typeof window !== 'undefined' && typeof window.mpv !== 'undefined';
  const [useMpv, setUseMpv] = useState(isElectron);

  // Resolve stream URL when content changes
  useEffect(() => {
    if (!activeContent?.url) {
      setResolvedUrl(null);
      setResolveError(null);
      return;
    }

    if (isElectron) {
      setUseMpv(true);
    }

    // Capture URL in local const to avoid null issues in async callback
    const contentUrl = activeContent.url;
    let cancelled = false;
    
    async function resolve() {
      setIsResolving(true);
      setResolveError(null);
      
      try {
        // Step 1: Resolve the stream URL (follow redirects server-side)
        console.log('[MasterPlayer] Resolving stream URL...');
        const result = await resolveStreamUrl(contentUrl);
        
        if (cancelled) return;
        
        if (result.wasRedirected) {
          console.log('[MasterPlayer] Stream resolved:', result.originalUrl, '->', result.url);
        }
        
        // Step 2: Apply URL helper (direct URL, no proxy)
        const finalUrl = getStreamUrl(result.url);
        
        setResolvedUrl(finalUrl);
      } catch (error: any) {
        if (cancelled) return;
        
        console.error('[MasterPlayer] Resolve error:', error);
        setResolveError(error.message || 'Failed to resolve stream');
        
        // Fallback to original URL with proxy
        setResolvedUrl(getStreamUrl(contentUrl));
      } finally {
        if (!cancelled) {
          setIsResolving(false);
        }
      }
    }
    
    resolve();
    
    return () => {
      cancelled = true;
    };
  }, [activeContent?.url, activeContent?.id]);

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

  // Resolving state
  if (isResolving) {
    return (
      <StreamLoading
        name={activeContent?.name}
        logo={activeContent?.logo}
        isLive={activeContent?.type === 'live'}
        message="Stream çözümleniyor..."
      />
    );
  }

  // No resolved URL yet
  if (!resolvedUrl) {
    return (
      <StreamLoading
        name={activeContent?.name}
        logo={activeContent?.logo}
        isLive={activeContent?.type === 'live'}
      />
    );
  }

  // Wait for user to press Play for VOD previews
  if ((activeContent.type === 'movie' || activeContent.type === 'series') && !isPlaying) {
    return null; // Will be replaced by PlayerPreview from parent
  }

  // 1. Try MPV First (if in Electron and hasn't failed)
  if (useMpv) {
    return (
      <MpvPlayer 
        src={resolvedUrl} 
        poster={activeContent.logo}
        isLive={activeContent.type === 'live'}
        channelName={activeContent.name}
        channelLogo={activeContent.logo}
        onError={(err) => {
          console.warn('[MasterPlayer] MPV failed, falling back to Web Players:', err);
          setUseMpv(false);
        }} 
      />
    );
  }

  // 2. Fallback: Live TV → Vidstack
  if (activeContent.type === 'live') {
    return (
      <VideoPlayer
        src={resolvedUrl}
        title={activeContent.name}
        autoPlay={true}
      />
    );
  }

  // 3. Fallback: VOD (Movie/Series) → Artplayer
  return (
    <VodPlayer
      src={resolvedUrl}
      poster={activeContent.logo}
      title={activeContent.name}
    />
  );
}
