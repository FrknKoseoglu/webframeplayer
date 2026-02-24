'use client';

import { useEffect, useRef, useState, useId } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Loader2, RotateCcw, FastForward, Settings, Activity, RefreshCw } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ChannelIcon } from '@/components/ui/ChannelIcon';
import { StreamLoading } from './StreamLoading';

interface MpvPlayerProps {
  src: string;
  poster?: string;
  isLive?: boolean;
  channelName?: string;
  channelLogo?: string;
  onError?: (err?: any) => void;
}

const formatTime = (s: number) => {
  if (!s || isNaN(s)) return "00:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export function MpvPlayer({ src, onError, isLive = false, channelName, channelLogo }: MpvPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uniqueId = useId().replace(/:/g, '');
  const canvasId = `mpv-ui-canvas-${uniqueId}`;
  
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tracks, setTracks] = useState<any[]>([]);
  
  const [showSettings, setShowSettings] = useState(false);
  const [volume, setVolume] = useState(100);
  const [bitrate, setBitrate] = useState<string | null>(null);
  const [resolution, setResolution] = useState<string | null>(null);
  const [fps, setFps] = useState<string | null>(null);
  
  const [isRewingText, setIsRewindingText] = useState(false);
  const [isFfText, setIsFfText] = useState(false);
  const [volumeOsd, setVolumeOsd] = useState<number | null>(null);
  const volumeOsdTimer = useRef<NodeJS.Timeout | null>(null);
  const rewindInterval = useRef<NodeJS.Timeout | null>(null);
  const [isIdle, setIsIdle] = useState(false);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!src || typeof window === 'undefined' || !window.mpv) {
      if (!window.mpv && typeof window !== 'undefined') {
        setError("Electron ortamı veya MPV eklentisi bulunamadı.");
      }
      return;
    }

    let cleanupRender: (() => void) | null = null;
    let isActive = true;
    setIsLoading(true);
    setCurrentTime(0);
    setDuration(0);
    setDuration(0);
    setTracks([]);
    setBitrate(null);
    setResolution(null);
    setShowSettings(false);
    setFps(null);

    const fallbackTimeout = setTimeout(() => {
       if (isActive && isLoading) {
           setError("Yayın MPV ile zamanında yüklenemedi.");
           onError?.(new Error("MPV timeout"));
       }
    }, 15000);

    const initMpv = async () => {
      try {
        if (!window.mpv.isAvailable || !window.mpv.isAvailable()) {
           throw new Error("MPV Modülü Yüklenemedi");
        }

        if (window.mpv.stop) window.mpv.stop();

        await window.mpv.load(src);
        if (!isActive) return;
        
        setIsReady(true);
        clearTimeout(fallbackTimeout);

        setTimeout(() => {
          if (!isActive) return;
          try {
            cleanupRender = window.mpv.startRendering(canvasId, () => {
                if (isActive) setIsLoading(false);
                // Apply audio/subtitle preferences from store
                try {
                  const state = usePlayerStore.getState();
                  if (state.preferredAudio1) {
                    window.mpv?.setProperty('alang', `${state.preferredAudio1},${state.preferredAudio2 || 'en'}`);
                  }
                  if (state.subtitlesEnabled && state.preferredSubtitle1) {
                    window.mpv?.setProperty('slang', `${state.preferredSubtitle1},${state.preferredSubtitle2 || 'en'}`);
                  } else if (!state.subtitlesEnabled) {
                    window.mpv?.setProperty('sid', 'no');
                  }
                } catch(prefErr) { console.warn('Failed to apply preferences:', prefErr); }
            });
          } catch (e: any) {
            console.error('Failed to start rendering:', e);
            setError(e.message);
          }
        }, 50);
        
      } catch (err: any) {
        if (isActive) setError(err.message);
      }
    };

    initMpv();

    return () => {
      isActive = false;
      clearTimeout(fallbackTimeout);
      if (cleanupRender) try { cleanupRender(); } catch(e) {}
      if (window.mpv && window.mpv.stop) window.mpv.stop();
      if (rewindInterval.current) clearInterval(rewindInterval.current);
    };
  }, [src, onError, canvasId, retryCount]);

  // Property Polling
  useEffect(() => {
    if (!isReady || !window.mpv || !window.mpv.getProperty) return;
    let trackParsed = false;
    
    const interval = setInterval(() => {
      const pos = window.mpv.getProperty('time-pos');
      const dur = window.mpv.getProperty('duration');
      if (pos) {
        const p = Number(pos);
        setCurrentTime(p);
        // Safety: if playback position > 0, content is playing — force loading off
        if (p > 0) setIsLoading(false);
      }
      if (dur) setDuration(Number(dur));
      
      // Fetch tracks only once when duration is known
      const d = Number(dur || 0);
      if (d > 0 && !trackParsed) {
        try {
          const countStr = window.mpv.getProperty('track-list/count');
          if (countStr) {
             const count = Number(countStr);
             const t = [];
             for (let i = 0; i < count; i++) {
               t.push({
                 id: window.mpv.getProperty(`track-list/${i}/id`),
                 type: window.mpv.getProperty(`track-list/${i}/type`),
                 lang: window.mpv.getProperty(`track-list/${i}/lang`) || `Track ${i+1}`,
                 title: window.mpv.getProperty(`track-list/${i}/title`),
                 selected: window.mpv.getProperty(`track-list/${i}/selected`) === 'yes'
               });
             }
             if (t.length > 0) {
               setTracks(t);
               trackParsed = true;
             }
          }
        } catch(e) {}
      }
      
      // Poll volume
      const vol = window.mpv.getProperty('volume');
      if (vol) setVolume(Number(vol));
      
      // Poll bitrate and resolution
      {
        try {
          const vBitrateStr = window.mpv.getProperty('video-bitrate');
          const aBitrateStr = window.mpv.getProperty('audio-bitrate');
          const vBitrate = vBitrateStr ? Number(vBitrateStr) : 0;
          const aBitrate = aBitrateStr ? Number(aBitrateStr) : 0;
          const totalBits = vBitrate + aBitrate;
          
          if (totalBits > 0) {
            const kbps = totalBits / 1024;
            if (kbps > 1024) {
              setBitrate((kbps / 1024).toFixed(1) + ' Mbps');
            } else {
              setBitrate(Math.round(kbps) + ' Kbps');
            }
           } else {
             const cacheStr = window.mpv.getProperty('demuxer-cache-duration');
             if (cacheStr && Number(cacheStr) > 0) {
                 setBitrate(`Buffer: ${Number(cacheStr).toFixed(1)}s`);
             }
          }
          
          // Poll resolution safely
          const h1 = window.mpv.getProperty('video-out-params/h');
          const h2 = window.mpv.getProperty('video-params/h');
          const h3 = window.mpv.getProperty('height');
          
          const hStr = h1 || h2 || h3;
          
          if (hStr && hStr !== '0' && hStr !== 'undefined') {
            const h = Number(hStr);
            if (h >= 2160) setResolution('4K');
            else if (h >= 1080) setResolution('FHD');
            else if (h >= 720) setResolution('HD');
            else if (h >= 480) setResolution('SD');
            else setResolution(`${h}p`);
          }
          
          // Poll FPS - use container-fps first (raw stream FPS), fallback to estimated-vf-fps
          const fpsStr = window.mpv.getProperty('container-fps') || window.mpv.getProperty('estimated-vf-fps');
          if (fpsStr && fpsStr !== '0' && fpsStr !== 'undefined') {
            setFps(Math.round(Number(fpsStr)) + ' fps');
          }
        } catch(e) {}
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isReady]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    window.mpv?.command(['seek', val.toString(), 'absolute']);
  };

  const handleSetTrack = (type: string, id: string) => {
    window.mpv?.setProperty(type === 'audio' ? 'aid' : 'sid', id);
    // Optimistic UI update
    setTracks(ts => ts.map(t => ({...t, selected: t.type === type ? t.id === id : t.selected})));
  };

  // Hold gestures
  const startRewind = () => {
    setIsRewindingText(true);
    rewindInterval.current = setInterval(() => {
        window.mpv?.command(['seek', '-1', 'relative']);
    }, 500);
  };
  const stopRewind = () => {
    setIsRewindingText(false);
    if (rewindInterval.current) clearInterval(rewindInterval.current);
  };

  const startFastForward = () => {
    setIsFfText(true);
    window.mpv?.setProperty('speed', '2.0');
  };
  const stopFastForward = () => {
    setIsFfText(false);
    window.mpv?.setProperty('speed', '1.0');
  };

  const isVod = !isLive && duration > 0;

  // Scroll to adjust volume
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    const newVol = Math.max(0, Math.min(100, volume + delta));
    setVolume(newVol);
    window.mpv?.setProperty('volume', newVol.toString());
    setVolumeOsd(newVol);
    if (volumeOsdTimer.current) clearTimeout(volumeOsdTimer.current);
    volumeOsdTimer.current = setTimeout(() => setVolumeOsd(null), 1200);
  };

  // Track fullscreen changes
  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Auto-hide controls + cursor after 3s idle in fullscreen VOD
  const resetIdle = () => {
    setIsIdle(false);
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (isFullscreen && isVod) {
      idleTimer.current = setTimeout(() => setIsIdle(true), 3000);
    }
  };

  const handleMouseMove = () => resetIdle();

  const audioTracks = tracks.filter(t => t.type === 'audio');
  const subTracks = tracks.filter(t => t.type === 'sub');

  return (
    <div ref={containerRef} className={`relative group w-full h-full bg-black overflow-hidden flex items-center justify-center rounded-lg border border-white/5 ${isIdle ? 'cursor-none' : ''}`} onDoubleClick={toggleFullscreen} onWheel={handleWheel} onMouseMove={handleMouseMove}>
      {error ? (
         <div className="text-red-500 p-8 text-center bg-zinc-950/50 rounded-xl border border-red-500/20 max-w-md z-50">
          <p className="font-bold text-lg mb-2">MPV Oynatıcı Hatası</p>
          <p className="text-sm opacity-70 mb-4">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => { setError(null); setRetryCount(c => c + 1); }} className="px-4 py-2 bg-blue-500/20 text-white rounded flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Yeniden Yükle
            </button>
            <button onClick={() => onError?.(new Error("Switch"))} className="px-4 py-2 bg-red-500/20 text-white rounded">Web Oynatıcı ile Dene</button>
          </div>
        </div>
      ) : (
        <>
          <canvas id={canvasId} ref={canvasRef} width={1920} height={1080} className="w-full h-full object-contain" />
          
          {isLoading && !error && (
            <div className="absolute inset-0 z-40">
              <StreamLoading name={channelName} logo={channelLogo} isLive={isLive} />
            </div>
          )}

          {/* Volume OSD */}
          {volumeOsd !== null && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/70 backdrop-blur-sm rounded-lg px-5 py-3 flex items-center gap-3 z-50 border border-white/10 transition-opacity">
              {volumeOsd === 0 ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
              <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${volumeOsd}%` }} />
              </div>
              <span className="text-white text-sm font-medium w-8 text-right">{volumeOsd}%</span>
            </div>
          )}

          {/* Left/Right invisible zones for 2x gestures */}
          {!isLoading && isVod && (
            <>
              <div 
                className="absolute left-0 top-0 bottom-16 w-1/5 z-20 cursor-pointer"
                onPointerDown={startRewind}
                onPointerUp={stopRewind}
                onPointerLeave={stopRewind}
              />
              <div 
                className="absolute right-0 top-0 bottom-16 w-1/5 z-20 cursor-pointer"
                onPointerDown={startFastForward}
                onPointerUp={stopFastForward}
                onPointerLeave={stopFastForward}
              />
              
              {/* OSD Feedback */}
              {isRewingText && <div className="absolute top-8 left-8 bg-black/60 px-4 py-2 rounded font-bold text-white text-lg z-30">◀◀ 2x Rewind</div>}
              {isFfText && <div className="absolute top-8 right-8 bg-black/60 px-4 py-2 rounded font-bold text-white text-lg z-30">2x Forward ▶▶</div>}
            </>
          )}
          
          {/* Controls Overlay */}
          <div className={`absolute inset-x-0 bottom-0 px-6 pb-6 pt-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-300 z-50 ${isIdle ? 'opacity-0 pointer-events-none' : 'opacity-0 group-hover:opacity-100'}`}>
            
            {/* Timeline for VOD */}
            {isVod && (
              <div className="flex items-center gap-4 mb-4">
                <span className="text-white/80 text-sm font-medium w-12 text-right">{formatTime(currentTime)}</span>
                <input 
                  type="range" 
                  min="0" 
                  max={duration || 100} 
                  value={currentTime} 
                  onChange={handleSeek}
                  style={{
                    background: `linear-gradient(to right, #ea2a33 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100}%)`
                  }}
                  className="flex-1 h-1.5 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#ea2a33] [&::-webkit-slider-thumb]:rounded-full cursor-pointer hover:[&::-webkit-slider-thumb]:scale-150 transition-all bg-transparent"
                />
                <span className="text-white/80 text-sm font-medium w-12">{formatTime(duration)}</span>
              </div>
            )}

            <div className="flex items-center gap-4">
              <button onClick={() => window.mpv?.play()} className="p-2 hover:bg-white/10 rounded-full transition-colors"><Play className="w-6 h-6 fill-current text-white" /></button>
              <button onClick={() => window.mpv?.pause()} className="p-2 hover:bg-white/10 rounded-full transition-colors"><Pause className="w-6 h-6 fill-current text-white" /></button>
              
              {isVod && (
                <>
                  <button onClick={() => window.mpv?.command(['seek', '-10', 'relative'])} className="px-3 hover:bg-white/10 rounded transition-colors text-white font-medium flex items-center gap-1.5">
                    <RotateCcw className="w-4 h-4" /> 10s
                  </button>
                  <button onClick={() => window.mpv?.command(['seek', '30', 'relative'])} className="px-3 hover:bg-white/10 rounded transition-colors text-white font-medium flex items-center gap-1.5">
                    30s <FastForward className="w-4 h-4" />
                  </button>
                </>
              )}
              
              <div className="flex-1">
                {/* Stats for Live and VOD can be different, but putting here pushes icons right */}
              </div>
              
              {/* Info (Bitrate, Res, FPS) */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {resolution && (
                    <div className="px-2 py-1 bg-black/40 rounded-md border border-white/10 text-[10px] font-bold text-white/90 tracking-wider">
                      {resolution}
                    </div>
                  )}
                  {fps && (
                    <div className="px-2 py-1 bg-black/40 rounded-md border border-white/10 text-[10px] font-bold text-white/90 tracking-wider">
                      {fps}
                    </div>
                  )}
                  {bitrate && (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-black/40 rounded-full border border-white/10 text-xs font-medium text-green-400">
                       <Activity className="w-3.5 h-3.5" />
                       {bitrate}
                    </div>
                  )}
                </div>
                
                {/* Volume icon (left of settings) */}
                <button 
                  onClick={() => {
                    const newVol = volume > 0 ? 0 : 100;
                    setVolume(newVol);
                    window.mpv?.setProperty('volume', newVol.toString());
                  }}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                >
                  {volume === 0 ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                </button>

                {/* Settings Menu */}
                <div className="relative">
                <button onClick={() => setShowSettings(!showSettings)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <Settings className="w-5 h-5 text-white" />
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-full mb-4 right-0 bg-black/95 border border-white/10 rounded-xl p-4 min-w-[280px] flex flex-col gap-4 shadow-2xl origin-bottom-right z-[60]">
                    
                    {/* Volume Slider */}
                    <div>
                      <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Ses</p>
                      <div className="flex items-center gap-3">
                        <Volume2 className="w-4 h-4 text-white/70" />
                        <input 
                          type="range" min="0" max="100" value={volume} 
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setVolume(val);
                            window.mpv?.setProperty('volume', val.toString());
                          }}
                          style={{
                            background: `linear-gradient(to right, #ea2a33 ${volume}%, rgba(255,255,255,0.2) ${volume}%)`
                          }}
                          className="flex-1 h-1 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#ea2a33] [&::-webkit-slider-thumb]:rounded-full cursor-pointer bg-transparent"
                        />
                        <span className="text-xs text-white/70 font-medium w-8">{volume}%</span>
                      </div>
                    </div>
                    
                    {/* Audio Track Dropdown */}
                    {audioTracks.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Ses Dili</p>
                        <select 
                          value={audioTracks.find(t => t.selected)?.id || '1'} 
                          onChange={(e) => handleSetTrack('audio', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40 appearance-none"
                        >
                          {audioTracks.map((t) => (
                            <option key={t.id} value={t.id} className="bg-zinc-900">
                              {t.title || t.lang || `Ses İzi ${t.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                    
                    {/* Subtitle Track Dropdown */}
                    {subTracks.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Altyazı Dili</p>
                        <select 
                          value={subTracks.find(t => t.selected)?.id || 'no'} 
                          onChange={(e) => handleSetTrack('sub', e.target.value)}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-white/40 appearance-none"
                        >
                          <option value="no" className="bg-zinc-900">Kapalı</option>
                          {subTracks.map((t) => (
                            <option key={t.id} value={t.id} className="bg-zinc-900">
                              {t.title || t.lang || `Altyazı ${t.id}`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                  </div>
                )}
              </div>

              <button onClick={() => { setError(null); setRetryCount(c => c + 1); }} className="p-2 hover:bg-white/10 rounded-full transition-colors" title="Yeniden Yükle">
                <RefreshCw className="w-5 h-5 text-white" />
              </button>
              <button onClick={toggleFullscreen} className="p-2 hover:bg-white/10 rounded-full transition-colors"><Maximize className="w-5 h-5 text-white" /></button>
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
}
