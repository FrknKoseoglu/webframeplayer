'use client';

import { useState, useEffect } from 'react';
import { Play, Star, Calendar, Clock, Lock, Download, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getSeriesInfo } from '@/lib/xtream-adapter';
import type { ContentItem, Season, Episode } from '@/types/iptv';

interface PlayerPreviewProps {
  content: ContentItem;
}

export function PlayerPreview({ content }: PlayerPreviewProps) {
  const { startPlayback, activeProfile, playEpisode } = usePlayerStore();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(false);

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
        {/* Left Side: Poster + Info */}
        <div className="flex-1 flex gap-6 p-8 md:p-12 min-w-0 overflow-hidden">
          {/* Poster Image */}
          {content.logo && (
            <div className="hidden md:block shrink-0 w-48">
              <img 
                src={content.logo} 
                alt={content.name}
                className="w-full h-auto rounded-xl shadow-2xl object-cover"
              />
            </div>
          )}
          
          {/* Info */}
          <div className="flex-1 flex flex-col justify-end min-w-0">
            <div className="max-w-2xl animate-fade-in-up">
              {/* Metadata */}
              <div className="flex items-center gap-3 mb-4 text-sm font-medium">
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
                  {content.type === 'series' ? 'Di̇zi̇' : 'Fi̇lm'}
                </span>
              </div>

              {/* Title - Full display, no truncate */}
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-xl">
                {content.name}
              </h1>

              {/* Plot */}
              <p className="text-white/80 text-base mb-6 line-clamp-3 leading-relaxed max-w-2xl">
                {content.plot || "Açıklama bulunmuyor."}
              </p>

              {/* Actions (Movies only, or quick play for series) */}
              <div className="flex items-center gap-4">
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
        </div>

        {/* Right Side: Seasons and Episodes for Series */}
        {content.type === 'series' && (
          <div className="w-full md:w-[440px] flex flex-col bg-black/40 backdrop-blur-xl border-l border-white/10 overflow-hidden">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-[var(--iptv-primary)] animate-spin" />
                <p className="text-white/60 text-sm">Bölümler yükleniyor...</p>
              </div>
            ) : (
              <>
                {/* Seasons List */}
                <div className="p-4 border-b border-white/10">
                  <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[var(--iptv-primary)]" />
                    Sezonlar
                  </h3>
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {seasons.map((season) => (
                      <button
                        key={season.number}
                        onClick={() => setSelectedSeason(season)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                          selectedSeason?.number === season.number
                            ? 'bg-[var(--iptv-primary)] text-white shadow-lg'
                            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        S{season.number}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Episodes List */}
                <div className="flex-1 min-h-0">
                  <ScrollArea className="h-full">
                    <div className="p-4 space-y-2">
                      <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[var(--iptv-primary)]" />
                        Bölümler ({selectedSeason?.episodes.length || 0})
                      </h3>
                      {selectedSeason?.episodes.map((episode) => (
                        <div
                          key={episode.id}
                          onClick={() => playEpisode(originalSeries, episode)}
                          className="group/item flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-transparent hover:bg-white/10 hover:border-white/10 cursor-pointer transition-all active:scale-[0.98]"
                        >
                          <div className="relative w-24 aspect-video bg-zinc-800 rounded-lg overflow-hidden shrink-0">
                            {episode.image ? (
                              <img 
                                src={episode.image} 
                                alt={episode.title}
                                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="w-4 h-4 text-white/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/item:opacity-100 flex items-center justify-center transition-opacity">
                              <Play className="w-6 h-6 text-white fill-current" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white text-sm font-medium truncate">
                              {episode.episodeNum}. {episode.title}
                            </h4>
                            <p className="text-white/40 text-xs mt-1">
                              {episode.duration ? episode.duration : 'Süre bilinmiyor'}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {episode.downloadUrl && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.open(episode.downloadUrl, '_blank');
                                }}
                                className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                title="İndir"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            )}
                            <ChevronRight className="w-4 h-4 text-white/20 group-hover/item:text-[var(--iptv-primary)] transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
