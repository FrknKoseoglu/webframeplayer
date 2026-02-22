'use client';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { useEffect, useRef, useState } from 'react';
import { MediaPlayer, MediaProvider, type PlayerSrc, type MediaPlayerInstance } from '@vidstack/react';
import { defaultLayoutIcons, DefaultVideoLayout } from '@vidstack/react/player/layouts/default';
import { Tv, AlertCircle, Settings, Copy, Check } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useTranslation } from '@/lib/i18n';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CorsErrorModal } from './CorsErrorModal';
import { UnsupportedCodecModal } from './UnsupportedCodecModal';
import { isLikelyCodecError, isCodecError, mightBeUnsupportedFormat } from '@/lib/codec-utils';

interface VideoPlayerProps {
  src: PlayerSrc | null;
  title: string;
  autoPlay?: boolean;
}

export function VideoPlayer({ src, title, autoPlay = true }: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance>(null);
  const { volume, setVolume, language } = usePlayerStore();
  const { t } = useTranslation();
  const router = useRouter();
  const [hasError, setHasError] = useState(false);
  const [showCorsError, setShowCorsError] = useState(false);
  const [showCodecError, setShowCodecError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Copy stream URL to clipboard
  const handleCopyLink = async () => {
    if (!src) return;
    try {
      const url = typeof src === 'string' ? src : (src as any).src || '';
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Set initial volume and listen for changes
  useEffect(() => {
    const player = playerRef.current;
    if (player) {
      player.volume = volume;
    }
  }, [src]); // Re-apply when source changes

  // Reset error when source changes
  useEffect(() => {
    setHasError(false);
    setShowCorsError(false);
    setShowCodecError(false);
  }, [src]);

  // DEBUG: Press Ctrl+Shift+C to simulate CORS error
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Shift+C to simulate CORS error
      if (e.ctrlKey && e.shiftKey && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        console.log('[DEBUG] Simulating CORS error - triggered!');
        setHasError(true);
        setShowCorsError(true);
      }
    };
    
    console.log('[DEBUG] CORS debug listener attached');
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Monitor player state and detect stuck loading
  useEffect(() => {
    if (!src) return;

    const player = playerRef.current;
    if (!player) return;

    let loadTimeout: NodeJS.Timeout;
    let hasStartedPlaying = false;

    const handleCanPlay = () => {
      hasStartedPlaying = true;
      clearTimeout(loadTimeout);
    };

    const handlePlaying = () => {
      hasStartedPlaying = true;
      clearTimeout(loadTimeout);
    };

    const handleWaiting = () => {
      // Set a timeout if video is stuck waiting
      if (!hasStartedPlaying) {
        loadTimeout = setTimeout(() => {
          console.warn('Video stuck in loading state - possible CORS issue');
          setHasError(true);
        }, 10000); // 10 second timeout
      }
    };

    // Listen for successful playback
    player.addEventListener('can-play', handleCanPlay);
    player.addEventListener('playing', handlePlaying);
    player.addEventListener('waiting', handleWaiting);

    // Set initial timeout for loading
    loadTimeout = setTimeout(() => {
      if (!hasStartedPlaying) {
        console.warn('Video failed to load within timeout - possible CORS issue');
        setHasError(true);
      }
    }, 15000); // 15 second timeout

    return () => {
      clearTimeout(loadTimeout);
      player.removeEventListener('can-play', handleCanPlay);
      player.removeEventListener('playing', handlePlaying);
      player.removeEventListener('waiting', handleWaiting);
    };
  }, [src]);

  const handleVolumeChange = (detail: { volume: number }) => {
    setVolume(detail.volume);
  };

  const handleError = (e: any) => {
    console.warn('Player error detected:', e);
    
    // Detect CORS errors from multiple sources
    const errorMessage = e.message?.toLowerCase() || e.detail?.message?.toLowerCase() || '';
    const errorCode = e.code || e.detail?.code;
    
    // Check for codec errors first
    const srcUrl = typeof src === 'string' ? src : (src as any)?.src || '';
    const isCodecIssue = isCodecError(errorMessage) || 
                         (errorCode === 3 && mightBeUnsupportedFormat(srcUrl)) || // MEDIA_ERR_DECODE
                         (errorCode === 4 && mightBeUnsupportedFormat(srcUrl));   // MEDIA_ERR_SRC_NOT_SUPPORTED
    
    if (isCodecIssue) {
      console.log('Codec error detected - showing codec modal');
      setHasError(true);
      setShowCodecError(true);
      return;
    }
    
    const isCorsError = 
      errorMessage.includes('cors') || 
      errorMessage.includes('cross-origin') ||
      errorMessage.includes('network') ||
      errorMessage.includes('failed to fetch') ||
      errorMessage.includes('load failed') ||
      errorCode === 2 || // MEDIA_ERR_NETWORK
      errorCode === 4;   // MEDIA_ERR_SRC_NOT_SUPPORTED (can be CORS)

    console.log('Error analysis:', {
      message: errorMessage,
      code: errorCode,
      isCodecIssue,
      isCorsError
    });

    // Show CORS error if detected
    if (isCorsError) {
      setHasError(true);
      setShowCorsError(true);
    }
  };

  // Also listen for provider errors
  const handleProviderSetup = (provider: any) => {
    if (!provider) return;

    // Listen for HLS errors if using HLS
    const video = provider.video;
    if (video) {
      const handleVideoError = () => {
        const error = video.error;
        if (error) {
          console.warn('Video element error:', error);
          // Network error (code 2) often indicates CORS
          if (error.code === 2) {
            setHasError(true);
            setShowCorsError(true);
          }
        }
      };

      video.addEventListener('error', handleVideoError);
      
      // Cleanup
      return () => {
        video.removeEventListener('error', handleVideoError);
      };
    }
  };

  // Show error state instead of player - stops loading completely
  if (hasError) {
    const srcUrl = typeof src === 'string' ? src : (src as any)?.src || '';
    const electronApp = typeof window !== 'undefined' && localStorage.getItem('isElectronApp') === 'true';
    
    // Electron: basit inline "Yayın açılamadı" mesajı (popup yok)
    if (electronApp) {
      return (
        <div className="aspect-video w-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center">
          <UnsupportedCodecModal
            isOpen={showCodecError}
            onClose={() => setShowCodecError(false)}
            streamUrl={srcUrl}
            title={title}
            onTryAnyway={() => {
              setShowCodecError(false);
              setHasError(false);
            }}
          />
          
          <div className="relative max-w-md px-6">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-orange-600/15 via-red-600/10 to-orange-600/15 rounded-full scale-150" />
            
            <div className="relative z-10 flex flex-col items-center gap-4 p-8 bg-zinc-900/60 rounded-2xl border border-white/5">
              <div className="p-4 rounded-full bg-orange-500/10 border border-orange-500/20">
                <AlertCircle className="w-10 h-10 text-orange-400" />
              </div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold text-white">
                  {language === 'tr' ? 'Yayın Açılamadı' : 'Stream Unavailable'}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {language === 'tr' 
                    ? 'Bu yayın şu anda açılamıyor. Lütfen daha sonra tekrar deneyin.'
                    : 'This stream is currently unavailable. Please try again later.'}
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="border-white/10 text-zinc-300 hover:bg-white/5"
                  size="sm"
                >
                  {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}
                  {copied ? (language === 'tr' ? 'Kopyalandı' : 'Copied') : (language === 'tr' ? 'Link Kopyala' : 'Copy Link')}
                </Button>
                <Button
                  onClick={() => setHasError(false)}
                  className="bg-orange-500/80 hover:bg-orange-500 text-white"
                  size="sm"
                >
                  {language === 'tr' ? 'Tekrar Dene' : 'Retry'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }
    
    // Web: mevcut CORS hata UI'ı
    return (
      <div className="aspect-video w-full bg-gradient-to-br from-zinc-900 via-zinc-950 to-black flex items-center justify-center">
        <CorsErrorModal 
          isOpen={showCorsError} 
          onClose={() => setShowCorsError(false)} 
          domainName={typeof window !== 'undefined' ? window.location.host : 'Web Player'} 
        />
        <UnsupportedCodecModal
          isOpen={showCodecError}
          onClose={() => setShowCodecError(false)}
          streamUrl={srcUrl}
          title={title}
          onTryAnyway={() => {
            setShowCodecError(false);
            setHasError(false);
          }}
        />
        
        <div className="relative max-w-2xl px-6">
          {/* Error glow effect */}
          <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-red-600/20 via-orange-600/20 to-red-600/20 rounded-full scale-150" />
          
          <div className="relative z-10 flex flex-col items-center gap-6 p-12 bg-zinc-900/50 rounded-2xl border border-red-500/20">
            <div className="p-6 rounded-full bg-red-500/20 border border-red-500/30">
              <AlertCircle className="w-16 h-16 text-red-400" />
            </div>
            <div className="text-center space-y-3">
              <h2 className="text-2xl font-semibold text-white">
                {language === 'tr' ? 'CORS Hatası' : 'CORS Error'}
              </h2>
              <p className="text-zinc-300 max-w-md text-base leading-relaxed">
                {language === 'tr' 
                  ? 'Tarayıcı güvenlik politikaları (CORS) nedeniyle bu yayın web\'de açılamıyor. Masaüstü uygulamasını kullanmanızı öneriyoruz.'
                  : 'This stream cannot be played in the browser due to CORS security policies. We recommend using the desktop app.'}
              </p>
              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={() => setShowCorsError(true)}
                  variant="outline"
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  size="lg"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Hata Detayı
                </Button>
                <Button
                  onClick={() => router.push('/settings')}
                  className="bg-[var(--iptv-primary)] hover:opacity-90 text-white px-6"
                  size="lg"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  {t.dashboard.nav.settings}
                </Button>
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                  size="lg"
                >
                  {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
                  {copied ? 'Kopyalandı!' : 'Bağlantıyı Kopyala'}
                </Button>
                <Button
                  onClick={() => setHasError(false)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                  size="lg"
                >
                  {language === 'tr' ? 'Tekrar Dene' : 'Retry'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ... rest of component ...

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
    <div className="aspect-video w-full bg-black relative">
      <MediaPlayer
        ref={playerRef}
        title={title}
        src={src}
        playsInline
        autoPlay={autoPlay}
        volume={volume}
        logLevel="silent"
        onVolumeChange={handleVolumeChange}
        onError={handleError}
        onProviderSetup={handleProviderSetup}
        className="w-full h-full"
      >
        <MediaProvider />
        <DefaultVideoLayout icons={defaultLayoutIcons} />
      </MediaPlayer>
    </div>
  );
}
