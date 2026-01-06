'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Play, Star, Calendar, Clock, Lock, Download, ChevronRight, Loader2, Copy, Check, MonitorPlay, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getSeriesInfo } from '@/lib/xtream-adapter';
import { ContentDetailsDialog } from '@/components/details/ContentDetailsDialog';
import type { ContentItem, Season, Episode } from '@/types/iptv';

interface PlayerPreviewProps {
  content: ContentItem;
}

export function PlayerPreview({ content }: PlayerPreviewProps) {
  const { startPlayback, activeProfile, playEpisode, activeContent } = usePlayerStore();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedEpisodeId, setCopiedEpisodeId] = useState<string | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Store the original series info (without episode modifications)
  const [originalSeries] = useState(() => ({
    id: content.id.split('_ep_')[0],
    name: content.name.split(' - S')[0],
    group: content.group,
    groupId: content.groupId,
    logo: content.logo,
    url: content.url,
    type: content.type,
    rating: content.rating,
    plot: content.plot,
    seriesId: content.seriesId,
  } as ContentItem));

  useEffect(() => {
    async function fetchSeriesDetails() {
      if (content.type === 'series' && content.seriesId && activeProfile?.credentials) {
        setLoading(true);
        try {
          const fetchedSeasons = await getSeriesInfo(activeProfile.credentials, content.seriesId);
          setSeasons(fetchedSeasons);
          setSelectedSeason(fetchedSeasons[0] || null);
        } catch (error) {
          console.error('Failed to fetch series info:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setSeasons([]);
        setSelectedSeason(null);
      }
    }

    fetchSeriesDetails();
  }, [content, activeProfile]);

  const handleDownload = () => {
    if (content.downloadUrl) {
      window.open(content.downloadUrl, '_blank');
    }
  };

  const formatDuration = (dur?: string) => {
    if (!dur) return null;
    return dur.includes(':') ? dur : `${dur} dk`;
  };

  const copyToClipboard = async (url: string, episodeId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedEpisodeId(episodeId);
      setTimeout(() => setCopiedEpisodeId(null), 2000);
    } catch (err) {
      console.error('Kopyalama başarısız:', err);
    }
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-black group flex flex-col">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        {content.logo ? (
          <img 
            src={content.logo} 
            alt={content.name}
            className="w-full h-full object-cover opacity-40 blur-md scale-110 group-hover:scale-105 transition-transform duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[var(--iptv-surface-dark)] to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
        {/* Left Side: Poster + Info for Series */}
        <div className="flex-1 flex gap-6 p-8 md:p-12 min-w-0 overflow-hidden">
          {/* Series/Movie Layout: Check if it has series data */}
          {content.seriesId ? (
            /* Series Layout: Poster top-left, content below */
            <div className="flex-1 flex flex-col min-w-0">
              {/* Poster at top */}
              {content.logo && (
                <div className="w-32 mb-4">
                  <img 
                    src={content.logo} 
                    alt={content.name}
                    className="w-full h-auto rounded-lg shadow-2xl"
                  />
                </div>
              )}
              
              {/* Content below poster */}
              <div className="flex-1 min-w-0">
                <div className="max-w-2xl">
                  {/* Metadata */}
                  <div className="flex items-center gap-3 mb-4 text-sm font-medium flex-wrap">
                    {content.rating && (
                      <div className="flex items-center gap-1.5 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{content.rating}</span>
                      </div>
                    )}
                    {content.year && (
                      <span className="text-white/80 border-l border-white/20 pl-3">{content.year}</span>
                    )}
                    {content.duration && (
                      <span className="text-white/80 border-l border-white/20 pl-3">{formatDuration(content.duration)}</span>
                    )}
                    <span className="text-[var(--iptv-primary)] font-bold border-l border-white/20 pl-3 uppercase tracking-wider">
                      DİZİ
                    </span>
                  </div>

                  {/* Title - Clickable */}
                  <h1 
                    onClick={() => setShowDetailsDialog(true)}
                    className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-xl cursor-pointer hover:text-[var(--iptv-primary)] transition-colors flex items-center gap-3 group"
                  >
                    {content.name}
                    <Info className="w-6 h-6 text-white/40 group-hover:text-[var(--iptv-primary)] transition-colors" />
                  </h1>

                  {/* Plot */}
                  <p className="text-white/80 text-base mb-6 line-clamp-3 leading-relaxed">
                    {content.plot || "Açıklama bulunmuyor."}
                  </p>

                  {/* Actions for Series */}
                  {seasons.length === 0 && !loading && (
                    <div className="flex items-center gap-4 flex-wrap">
                      <Button 
                        size="lg"
                        variant="outline"
                        className="h-14 px-8 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl gap-2 backdrop-blur-sm"
                      >
                        <Lock className="w-5 h-5 text-white/60" />
                        <span className="text-white/80">FRAGMAN (YAKINDA)</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Movie Layout: Centered info */
            <div className="flex-1 flex flex-col justify-center min-w-0">
              <div className="max-w-2xl">
              {/* Metadata */}
              <div className="flex items-center gap-3 mb-4 text-sm font-medium flex-wrap">
                {content.rating && (
                  <div className="flex items-center gap-1.5 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{content.rating}</span>
                  </div>
                )}
                {content.year && (
                  <span className="text-white/80 border-l border-white/20 pl-3">{content.year}</span>
                )}
                {content.duration && (
                  <span className="text-white/80 border-l border-white/20 pl-3">{formatDuration(content.duration)}</span>
                )}
                <span className="text-[var(--iptv-primary)] font-bold border-l border-white/20 pl-3 uppercase tracking-wider">
                  {content.type === 'series' ? 'DİZİ' : 'FİLM'}
                </span>
              </div>

              {/* Title - Clickable, Left-aligned */}
              <h1 
                onClick={() => setShowDetailsDialog(true)}
                className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-xl cursor-pointer hover:text-[var(--iptv-primary)] transition-colors flex items-center gap-3 group"
              >
                {content.name}
                <Info className="w-6 h-6 text-white/40 group-hover:text-[var(--iptv-primary)] transition-colors" />
              </h1>

              {/* Plot - Left-aligned */}
              <p className="text-white/80 text-base mb-6 line-clamp-3 leading-relaxed">
                {content.plot || "Açıklama bulunmuyor."}
              </p>

              {/* Actions (Movies only, or quick play for series) */}
              <div className="flex items-center gap-4 flex-wrap">
                {content.type === 'movie' && (
                  <Button 
                    size="lg"
                    onClick={startPlayback}
                    className="h-14 px-8 bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary)]/90 text-white rounded-xl gap-3 text-lg font-semibold shadow-lg shadow-[var(--iptv-primary)]/20 transition-all hover:scale-105"
                  >
                    <Play className="w-6 h-6 fill-current" />
                    HEMEN İZLE
                  </Button>
                )}

                {content.type === 'movie' && (
                  <CopyLinkButton url={content.url} />
                )}

                {content.type === 'movie' && content.downloadUrl && (
                  <Button 
                    size="lg"
                    variant="outline"
                    onClick={handleDownload}
                    className="h-14 px-8 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl gap-3 text-lg font-semibold backdrop-blur-sm transition-all hover:scale-105"
                  >
                    <Download className="w-6 h-6" />
                    İNDİR
                  </Button>
                )}
                
                {content.type === 'series' && seasons.length === 0 && !loading && (
                  <Button 
                    size="lg"
                    variant="outline"
                    className="h-14 px-8 border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl gap-2 backdrop-blur-sm"
                  >
                    <Lock className="w-5 h-5 text-white/60" />
                    <span className="text-white/80">FRAGMAN (YAKINDA)</span>
                  </Button>
                )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Dialog */}
      <ContentDetailsDialog 
        content={content}
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
      />
    </div>
  );
}


// Copy Link Button with instructions dialog
function CopyLinkButton({ url }: { url: string }) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [copied, setCopied] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      
      // Check if user has opted to not show instructions
      const hideInstructions = localStorage.getItem('hideCopyLinkInstructions') === 'true';
      
      if (!hideInstructions) {
        setShowInstructions(true);
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem('hideCopyLinkInstructions', 'true');
    }
    setShowInstructions(false);
    setDontShowAgain(false);
  };

  return (
    <>
      <Button 
        size="lg"
        variant="outline"
        onClick={handleCopy}
        className="h-14 px-6 border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-xl gap-2 backdrop-blur-sm transition-all hover:scale-105"
      >
        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
        <span className="hidden sm:inline">{copied ? 'Kopyalandı!' : 'Bağlantı Kopyala'}</span>
        <span className="sm:hidden">{copied ? 'Tamam' : 'Kopyala'}</span>
      </Button>

      {/* Instructions Dialog */}
      {showInstructions && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Info className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-white font-bold text-lg">Bağlantı Kopyalandı</h3>
            </div>
            
            <p className="text-white/70 mb-4">
              Akış bağlantısı panoya kopyalandı. Harici oynatıcılarda kullanabilirsiniz.
            </p>
            
            <div className="space-y-3 mb-4">
              <div className="bg-white/5 rounded-lg p-3">
                <p className="text-white/60 text-sm">
                  <strong className="text-white">VLC Player:</strong><br/>
                  1. VLC'yi açın.<br/>
                  2. Doğrudan (Ctrl + V) yapın<br/>
                  3. Medya Oynamaya başlayacaktır.
                  <br/>
                  <br/>
                  Not: Diğer oynatıcılar için bu yöntemi kullanabilirsiniz.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-green-400 text-sm mb-4">
              <Check className="w-4 h-4" />
              <span>Bağlantı panoya kopyalandı</span>
            </div>
            
            <div className="flex items-center gap-2 mb-4">
              <input
                type="checkbox"
                id="dontShowAgain"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
              />
              <label htmlFor="dontShowAgain" className="text-white/60 text-sm cursor-pointer select-none">
                Bir daha gösterme
              </label>
            </div>
            
            <Button 
              onClick={handleClose}
              className="w-full bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white"
            >
              Tamam
            </Button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
