'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { VideoPlayer } from './VideoPlayer';
import { VodPlayer } from './VodPlayer';
import { Tv, Loader2 } from 'lucide-react';
import { getStreamUrl } from '@/lib/url-helper';
import { resolveStreamUrl } from '@/app/actions/stream-resolver';

interface MasterPlayerProps {
  autoPlay?: boolean;
}

export function MasterPlayer({ autoPlay = false }: MasterPlayerProps) {
  const activeContent = usePlayerStore((state) => state.activeContent);
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  
  // Subscribe to proxy settings so component re-renders when they change
  const enableCustomProxy = usePlayerStore((state) => state.enableCustomProxy);
  const customProxyUrl = usePlayerStore((state) => state.customProxyUrl);
  
  // State for resolved stream URL
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [resolveError, setResolveError] = useState<string | null>(null);

  // Resolve stream URL when content changes
  useEffect(() => {
    if (!activeContent?.url) {
      setResolvedUrl(null);
      setResolveError(null);
      return;
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
        
        // Step 2: Apply CORS proxy to the resolved URL (if enabled)
        const finalUrl = getStreamUrl(result.url);
        
        if (enableCustomProxy && customProxyUrl) {
          console.log('[MasterPlayer] Proxy applied:', finalUrl);
        }
        
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
  }, [activeContent?.url, activeContent?.id, enableCustomProxy, customProxyUrl]);

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
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-center p-8">
        <Loader2 className="w-12 h-12 text-[var(--iptv-primary)] animate-spin mb-4" />
        <p className="text-white/60 text-sm">Stream çözümleniyor...</p>
      </div>
    );
  }

  // No resolved URL yet
  if (!resolvedUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-black text-center p-8">
        <Tv className="w-20 h-20 text-white/20 mb-6" />
        <h3 className="text-white/60 text-xl font-medium mb-2">Yükleniyor...</h3>
      </div>
    );
  }

  // Live TV → Vidstack
  if (activeContent.type === 'live') {
    return (
      <VideoPlayer
        src={resolvedUrl}
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
      src={resolvedUrl}
      poster={activeContent.logo}
      title={activeContent.name}
    />
  );
}
