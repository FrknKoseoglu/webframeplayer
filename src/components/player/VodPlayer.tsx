'use client';

import { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { X, AlertTriangle, EyeOff } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

const MKV_WARNING_KEY = 'frame_mkv_warning_dismissed';

interface VodPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export function VodPlayer({ src, poster, title }: VodPlayerProps) {
  const setPlaybackError = usePlayerStore((state) => state.setPlaybackError);
  const containerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<Artplayer | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [showMkvWarning, setShowMkvWarning] = useState(false);
  const warningTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isMkv = src.toLowerCase().includes('.mkv');

  // Check if user has dismissed MKV warning permanently
  const isMkvWarningDismissed = () => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(MKV_WARNING_KEY) === 'true';
  };

  // Show MKV warning with auto-hide
  useEffect(() => {
    if (isMkv && !isMkvWarningDismissed()) {
      setShowMkvWarning(true);
      
      // Auto-hide after 10 seconds
      warningTimerRef.current = setTimeout(() => {
        setShowMkvWarning(false);
      }, 10000);
    }

    return () => {
      if (warningTimerRef.current) {
        clearTimeout(warningTimerRef.current);
      }
    };
  }, [isMkv]);

  const handleDismissWarning = () => {
    setShowMkvWarning(false);
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
  };

  const handleDontShowAgain = () => {
    localStorage.setItem(MKV_WARNING_KEY, 'true');
    setShowMkvWarning(false);
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup previous instances
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (artRef.current) {
      artRef.current.destroy(false);
      artRef.current = null;
    }

    // Artplayer configuration
    const art = new Artplayer({
      container: containerRef.current,
      url: src,
      poster: poster || '',
      volume: 0.7,
      isLive: false,
      muted: false,
      autoplay: true,
      pip: true,
      autoSize: false,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      theme: '#E50914',
      moreVideoAttr: {
        // crossOrigin removed: Yayın servers don't return CORS headers,
        // and Electron has webSecurity:false so it's not needed
      },
      settings: [],
      customType: {
        m3u8: function (video: HTMLVideoElement, url: string, art: Artplayer) {
          if (Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: false,
            });
            
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
              // Add Audio Tracks to settings
              if (hls.audioTracks.length > 1) {
                art.setting.add({
                  name: 'audio',
                  html: 'Ses Dili',
                  tooltip: hls.audioTracks[hls.audioTrack]?.name || 'Varsayılan',
                  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>',
                  selector: hls.audioTracks.map((track, index) => ({
                    html: track.name || `Ses ${index + 1}`,
                    value: index,
                    default: index === hls.audioTrack,
                  })),
                  onSelect: function (item: any) {
                    hls.audioTrack = item.value;
                    return item.html;
                  },
                });
              }

              // Add Subtitle Tracks to settings
              if (hls.subtitleTracks.length > 0) {
                const subtitleOptions = [
                  { html: 'Kapalı', value: -1, default: hls.subtitleTrack === -1 },
                  ...hls.subtitleTracks.map((track, index) => ({
                    html: track.name || track.lang || `Altyazı ${index + 1}`,
                    value: index,
                    default: index === hls.subtitleTrack,
                  })),
                ];

                art.setting.add({
                  name: 'subtitle',
                  html: 'Altyazı',
                  tooltip: hls.subtitleTrack === -1 ? 'Kapalı' : (hls.subtitleTracks[hls.subtitleTrack]?.name || 'Açık'),
                  icon: '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="14" x="3" y="5" rx="2"/><path d="M7 15h4M15 15h2M7 11h2M13 11h4"/></svg>',
                  selector: subtitleOptions,
                  onSelect: function (item: any) {
                    hls.subtitleTrack = item.value;
                    return item.html;
                  },
                });
              }
            });

            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data.fatal) {
                console.error('HLS fatal error:', data);
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    // Try to recover once, then give up
                    if (!hls.media?.error) {
                      hls.startLoad();
                    } else {
                      console.error('Network error - giving up');
                      setPlaybackError();
                    }
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hls.recoverMediaError();
                    break;
                  default:
                    hls.destroy();
                    setPlaybackError();
                    break;
                }
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS support
            video.src = url;
          }
        },
      },
    });

    artRef.current = art;

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (artRef.current) {
        artRef.current.destroy(false);
        artRef.current = null;
      }
    };
  }, [src, poster, isMkv]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* MKV Warning Banner */}
      {showMkvWarning && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-yellow-500/90 text-black px-4 py-3 rounded-lg flex items-center gap-3 animate-fade-in">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <p className="text-sm flex-1">
            MKV formatı tarayıcı desteğine bağlıdır. Ses var görüntü yoksa tarayıcınızı değiştirin veya içeriği indirip cihazınızda oynatın.
          </p>
          <button 
            onClick={handleDontShowAgain}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-black/20 hover:bg-black/30 rounded"
          >
            <EyeOff className="w-3 h-3" />
            Bir Daha Gösterme
          </button>
          <button 
            onClick={handleDismissWarning}
            className="p-1 hover:bg-black/20 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Artplayer Container */}
      <div 
        ref={containerRef} 
        className="w-full h-full"
      />
    </div>
  );
}
