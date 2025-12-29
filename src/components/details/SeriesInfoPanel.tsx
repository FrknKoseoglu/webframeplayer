'use client';

import { useState, useEffect } from 'react';
import { Star, Play, ChevronRight, Loader2, Clock, CheckCircle, Download } from 'lucide-react';
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
  
  // Store the original series info (without episode modifications)
  const [originalSeries] = useState(() => ({
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
  } as ContentItem));

  // Get currently playing season/episode from activeContent
  const currentlyPlayingSeason = activeContent?.seasonNumber;
  const currentlyPlayingEpisode = activeContent?.episodeNumber;

  useEffect(() => {
    async function fetchData() {
      if (content.seriesId && activeProfile?.credentials) {
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[var(--iptv-primary)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left: Compact Poster */}
      <div className="w-[120px] p-2 flex items-start justify-center border-r border-white/5 shrink-0">
        {content.logo ? (
          <img 
            src={content.logo} 
            alt={content.name}
            className="w-full rounded-lg shadow-xl"
          />
        ) : (
          <div className="w-full aspect-[2/3] bg-white/5 rounded-lg flex items-center justify-center">
            <Play className="w-8 h-8 text-white/20" />
          </div>
        )}
      </div>

      {/* Right: Compact Info + Seasons + Episodes */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Compact Header */}
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
                    ? 'bg-[var(--iptv-primary)] text-white'
                    : currentlyPlayingSeason === season.number
                    ? 'bg-[var(--iptv-primary)]/30 text-[var(--iptv-primary)] border border-[var(--iptv-primary)]/50'
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
                className={`group flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-all ${
                  isEpisodePlaying(episode)
                    ? 'bg-[var(--iptv-primary)]/20 border border-[var(--iptv-primary)]/30'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                {/* Episode Number */}
                <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 text-xs font-bold ${
                  isEpisodePlaying(episode) 
                    ? 'bg-[var(--iptv-primary)] text-white' 
                    : 'bg-white/10 text-white/60'
                }`}>
                  {isEpisodePlaying(episode) ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    episode.episodeNum
                  )}
                </div>

                {/* Title */}
                <div className="flex-1 min-w-0">
                  <h4 className={`text-xs font-medium truncate ${
                    isEpisodePlaying(episode) ? 'text-white' : 'text-white/80'
                  }`}>
                    {episode.title}
                  </h4>
                  {episode.duration && (
                    <span className="text-[10px] text-white/40 flex items-center gap-1 mt-0.5">
                      <Clock className="w-2.5 h-2.5" />
                      {episode.duration}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {episode.downloadUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(episode.downloadUrl, '_blank');
                      }}
                      className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                      title="İndir"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isEpisodePlaying(episode) ? (
                    <span className="text-[10px] text-[var(--iptv-primary)] font-bold">OYNATILIYOR</span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        </div>
      </div>
    </div>
  );
}
