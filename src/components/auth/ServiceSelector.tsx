'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Tv, Trash2, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/usePlayerStore';
import { 
  getLiveCategories, 
  getVodCategories,
  getSeriesCategories,
  getLiveStreams, 
  getVodStreams,
  getSeries,
  convertCategories, 
  convertLiveStreams,
  convertVodStreams,
  convertSeries,
} from '@/lib/xtream-adapter';
import { processM3UPlaylist } from '@/lib/m3u-parser';
import type { Profile } from '@/types/iptv';

interface ServiceSelectorProps {
  onAddNew: () => void;
}

export function ServiceSelector({ onAddNew }: ServiceSelectorProps) {
  const router = useRouter();
  const { profiles, removeProfile, switchProfile, setCategories, setContent, setLoading } = usePlayerStore();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleSelectService = async (profile: Profile) => {
    setLoadingId(profile.id);

    try {
      // M3U profiles - parse the playlist
      if (profile.type === 'm3u' && profile.m3uUrl) {
        setLoading(true, 'processing');
        
        const { content, categories } = await processM3UPlaylist(profile.m3uUrl);
        
        switchProfile(profile.id);
        setCategories(categories);
        setContent(content);
        setLoading(false);
        router.push('/dashboard');
        return;
      }

      // Xtream profiles - fetch from API
      if (!profile.credentials) {
        switchProfile(profile.id);
        router.push('/dashboard');
        return;
      }

      setLoading(true, 'fetching_categories');
      const credentials = profile.credentials;

      // Fetch all content
      const [liveCategories, vodCategories, seriesCategories] = await Promise.all([
        getLiveCategories(credentials),
        getVodCategories(credentials),
        getSeriesCategories(credentials),
      ]);

      setLoading(true, 'fetching_live');
      const liveStreams = await getLiveStreams(credentials);

      setLoading(true, 'fetching_movies');
      const vodStreams = await getVodStreams(credentials);

      setLoading(true, 'fetching_series');
      const seriesList = await getSeries(credentials);

      setLoading(true, 'processing');
      const categories = [
        ...convertCategories(liveCategories, 'live'),
        ...convertCategories(vodCategories, 'movie'),
        ...convertCategories(seriesCategories, 'series'),
      ];
      const content = [
        ...convertLiveStreams(liveStreams, credentials, liveCategories),
        ...convertVodStreams(vodStreams, credentials, vodCategories),
        ...convertSeries(seriesList, credentials, seriesCategories),
      ];

      switchProfile(profile.id);
      setCategories(categories);
      setContent(content);
      setLoading(false);
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to load service:', error);
      setLoading(false);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    if (confirm('Bu hizmeti silmek istediğinize emin misiniz?')) {
      removeProfile(profileId);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[var(--iptv-background)] text-white flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[var(--iptv-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Tv className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Hizmet Seçin</h1>
        <p className="text-white/60">Devam etmek için bir hizmet seçin veya yeni ekleyin</p>
      </div>

      {/* Services Grid */}
      <div className="w-full max-w-2xl grid gap-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => !loadingId && handleSelectService(profile)}
            className={`
              group relative bg-[var(--iptv-surface)] border border-white/5 rounded-xl p-5
              flex items-center gap-4 cursor-pointer transition-all
              hover:bg-[var(--iptv-surface)]/80 hover:border-[var(--iptv-primary)]/30
              ${loadingId === profile.id ? 'opacity-70 pointer-events-none' : ''}
            `}
          >
            {/* Icon */}
            <div className="w-12 h-12 bg-[var(--iptv-primary)]/20 rounded-xl flex items-center justify-center shrink-0">
              {loadingId === profile.id ? (
                <Loader2 className="w-6 h-6 text-[var(--iptv-primary)] animate-spin" />
              ) : (
                <Tv className="w-6 h-6 text-[var(--iptv-primary)]" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{profile.name}</p>
              <p className="text-white/40 text-sm">
                {profile.type === 'xtream' ? 'Xtream Codes' : 'M3U Playlist'} • {formatDate(profile.createdAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleDelete(e, profile.id)}
                className="text-white/40 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-[var(--iptv-primary)] rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white ml-0.5" />
              </div>
            </div>
          </div>
        ))}

        {/* Add New Service Button */}
        <button
          onClick={onAddNew}
          className="
            flex items-center justify-center gap-3 p-5 rounded-xl
            border-2 border-dashed border-white/10 
            hover:border-[var(--iptv-primary)]/50 hover:bg-[var(--iptv-primary)]/5
            transition-all text-white/60 hover:text-white
          "
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Yeni Hizmet Ekle</span>
        </button>
      </div>
    </div>
  );
}
