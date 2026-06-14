'use client';

import { useState, useEffect, useMemo } from 'react';
import { Star, Play, ChevronRight, Loader2, Clock, CheckCircle, Download, Copy, Check, ImageIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlayerStore } from '@/store/usePlayerStore';
import { getSeriesInfo } from '@/lib/xtream-adapter';
import type { ContentItem, Season, Episode } from '@/types/iptv';

interface SeriesInfoPanelProps {
  content: ContentItem;
}

export function SeriesInfoPanel({ content }: SeriesInfoPanelProps) {
  const { activeProfile, playEpisode, activeContent } = usePlayerStore();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(false);
  const [copiedEpisodeId, setCopiedEpisodeId] = useState<string | null>(null);
  const [hoveredEpisode, setHoveredEpisode] = useState<string | null>(null);
  
  // Store the original series info (without episode modifications)
  // Use useMemo to recalculate when content changes
  const originalSeries = useMemo(() => ({
    id: content.id.split('_ep_')[0], // Remove any episode suffix
    name: content.name.split(' - S')[0], // Get original name before episode info
    group: content.group,
    groupId: content.groupId,
    logo: content.logo,
    url: content.url,
    type: content.type,
    rating: content.rating,
    plot: content.plot,
    seriesId: content.seriesId,
  } as ContentItem), [content.id, content.name, content.group, content.groupId, content.logo, content.url, content.type, content.rating, content.plot, content.seriesId]);

  // Get currently playing season/episode from activeContent
  const currentlyPlayingSeason = activeContent?.seasonNumber;
  const currentlyPlayingEpisode = activeContent?.episodeNumber;

  useEffect(() => {
    async function fetchData() {
      if (content.seriesId && activeProfile?.credentials) {
        // Clear old seasons immediately when seriesId changes
        setSeasons([]);
        setSelectedSeason(null);
        setLoading(true);
        try {
          const data = await getSeriesInfo(activeProfile.credentials, content.seriesId);
          setSeasons(data);
          
          // Auto-select currently playing season, or first one
          if (currentlyPlayingSeason) {
            const playingSeason = data.find(s => s.number === currentlyPlayingSeason);
            setSelectedSeason(playingSeason || data[0] || null);
          } else {
            setSelectedSeason(data[0] || null);
          }
        } catch (e) {
          console.error('Failed to fetch series info:', e);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [content.seriesId, activeProfile, currentlyPlayingSeason]);

  const isEpisodePlaying = (episode: Episode) => {
    return currentlyPlayingSeason === episode.seasonNum && 
           currentlyPlayingEpisode === episode.episodeNum;
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[var(--frame-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Compact Header with Title and Rating */}
      <div className="px-3 py-2 border-b border-white/5 shrink-0 flex items-center gap-3">
        <h2 className="text-sm font-bold text-white truncate flex-1">{content.name}</h2>
        {content.rating && (
          <div className="flex items-center gap-1 text-yellow-500 text-xs shrink-0">
            <Star className="w-3 h-3 fill-current" />
            <span className="font-bold">{content.rating}</span>
          </div>
        )}
      </div>

        {/* Season Tabs - Compact */}
        <div className="px-3 py-2 border-b border-white/5 shrink-0">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-none">
            {seasons.map((season) => (
              <button
                key={season.number}
                onClick={() => setSelectedSeason(season)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all ${
                  selectedSeason?.number === season.number
                    ? 'bg-[var(--frame-primary)] text-white'
                    : currentlyPlayingSeason === season.number
                    ? 'bg-[var(--frame-primary)]/30 text-[var(--frame-primary)] border border-[var(--frame-primary)]/50'
                    : 'bg-white/5 text-white/60 hover:bg-white/10'
                }`}
              >
                S{season.number}
              </button>
            ))}
          </div>
        </div>

        {/* Episodes - Compact List */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
          <div className="p-2 space-y-1">
            {selectedSeason?.episodes.map((episode) => (
              <div
                key={episode.id}
                onClick={() => playEpisode(originalSeries, episode)}
                onMouseEnter={() => setHoveredEpisode(episode.id)}
                onMouseLeave={() => setHoveredEpisode(null)}
                className={`group relative flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all overflow-hidden ${
                  isEpisodePlaying(episode)
                    ? 'bg-[var(--frame-primary)]/20 border border-[var(--frame-primary)]/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {/* Season + Episode Number */}
                <div className={`shrink-0 text-[10px] font-bold w-12 text-center ${
                  isEpisodePlaying(episode) 
                    ? 'text-[var(--frame-primary)]' 
                    : 'text-white/60'
                }`}>
                  S{episode.seasonNum}E{episode.episodeNum}
                </div>

                {/* Episode Preview Image */}
                <div className="relative shrink-0 w-16 h-9 bg-zinc-800 rounded overflow-hidden">
                  {episode.image ? (
                    <img 
                      src={episode.image} 
                      alt={episode.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ImageIcon className="w-3 h-3 text-white/20" />
                    </div>
                  )}
                </div>

                {/* Title and Duration */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-[11px] font-medium truncate leading-tight ${
                    isEpisodePlaying(episode) ? 'text-white' : 'text-white/80'
                  }`}>
                    {episode.title}
                  </h4>
                  {episode.duration && (
                    <span className="text-[9px] text-white/40 flex items-center gap-0.5 mt-0.5">
                      <Clock className="w-2 h-2" />
                      {episode.duration}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-0.5">
                  {episode.downloadUrl && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(episode.downloadUrl, '_blank');
                        }}
                        className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        title="İndir"
                      >
                        <Download className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          copyToClipboard(episode.downloadUrl!, episode.id);
                        }}
                        className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        title="Bağlantıyı Kopyala"
                      >
                        {copiedEpisodeId === episode.id ? (
                          <Check className="w-3 h-3 text-green-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </>
                  )}
                  {isEpisodePlaying(episode) ? (
                    <span className="text-[9px] text-[var(--frame-primary)] font-bold">OYNATILIYOR</span>
                  ) : (
                    <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/60 transition-colors" />
                  )}
                </div>

                {/* Hover Tooltip with Enlarged Preview*/}
                {hoveredEpisode === episode.id && episode.image && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
                    <div className="bg-zinc-900 border border-white/20 rounded-lg overflow-hidden shadow-2xl">
                      <img 
                        src={episode.image} 
                        alt={episode.title}
                        className="w-64 h-36 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
        </div>
    </div>
  );
}
