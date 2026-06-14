'use client';

import { useState, useCallback } from 'react';
import { Loader2, Tv, CheckCircle } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { 
  getLiveCategories, getVodCategories, getSeriesCategories,
  getLiveStreams, getVodStreams, getSeries,
  convertCategories, convertLiveStreams, convertVodStreams, convertSeries,
} from '@/lib/xtream-adapter';
import { processM3UPlaylist } from '@/lib/m3u-parser';
import type { Profile } from '@/types/iptv';

const BOOT_MESSAGES: Record<string, string> = {
  idle: '',
  authenticating: 'Profil seçiliyor...',
  fetching_categories: 'Kategoriler yükleniyor...',
  fetching_live: 'Canlı kanallar yükleniyor...',
  fetching_movies: 'Filmler yükleniyor...',
  fetching_series: 'Diziler yükleniyor...',
  processing: 'İçerikler hazırlanıyor...',
  complete: 'Hazır!',
  error: 'Bir hata oluştu',
};

const ALL_STEPS = ['authenticating', 'fetching_categories', 'fetching_live', 'fetching_movies', 'fetching_series', 'processing'];

interface ProfileLoaderState {
  isLoading: boolean;
  profileName: string;
  bootStep: string;
  completedSteps: string[];
}

/**
 * Hook that provides the loadProfileData function and loading state.
 * Used by login page and settings page.
 */
export function useProfileLoader(onComplete?: () => void) {
  const [state, setState] = useState<ProfileLoaderState>({
    isLoading: false,
    profileName: '',
    bootStep: 'idle',
    completedSteps: [],
  });

  const loadProfileData = useCallback(async (profile: Profile) => {
    const currentState = usePlayerStore.getState();

    setState({ isLoading: true, profileName: profile.name, bootStep: 'authenticating', completedSteps: [] });

    try {
      if (!currentState.activeProfile || currentState.activeProfile.id !== profile.id) {
        currentState.switchProfile(profile.id);
      }

      if (profile.type === 'm3u' && profile.m3uUrl) {
        setState(s => ({ ...s, bootStep: 'fetching_live' }));
        const { content, categories } = await processM3UPlaylist(profile.m3uUrl);
        setState(s => ({ ...s, completedSteps: ['authenticating', 'fetching_live'], bootStep: 'processing' }));
        currentState.setCategories(categories);
        currentState.setContent(content);
        setState(s => ({ ...s, completedSteps: [...s.completedSteps, 'processing'] }));
      } else if (profile.credentials) {
        const credentials = profile.credentials;
        setState(s => ({ ...s, completedSteps: ['authenticating'], bootStep: 'fetching_categories' }));

        const [liveCategories, vodCategories, seriesCategories] = await Promise.all([
          getLiveCategories(credentials),
          getVodCategories(credentials),
          getSeriesCategories(credentials),
        ]);
        setState(s => ({ ...s, completedSteps: [...s.completedSteps, 'fetching_categories'], bootStep: 'fetching_live' }));

        const liveStreams = await getLiveStreams(credentials);
        setState(s => ({ ...s, completedSteps: [...s.completedSteps, 'fetching_live'], bootStep: 'fetching_movies' }));

        const vodStreams = await getVodStreams(credentials);
        setState(s => ({ ...s, completedSteps: [...s.completedSteps, 'fetching_movies'], bootStep: 'fetching_series' }));

        const seriesList = await getSeries(credentials);
        setState(s => ({ ...s, completedSteps: [...s.completedSteps, 'fetching_series'], bootStep: 'processing' }));

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

        currentState.setCategories(categories);
        currentState.setContent(content);
        setState(s => ({ ...s, completedSteps: [...s.completedSteps, 'processing'] }));
      }

      setState(s => ({ ...s, bootStep: 'complete' }));
    } catch (error) {
      console.error('Data fetch failed:', error);
      setState(s => ({ ...s, bootStep: 'error' }));
    } finally {
      setTimeout(() => {
        setState(s => ({ ...s, isLoading: false, bootStep: 'idle', completedSteps: [] }));
        onComplete?.();
      }, 500);
    }
  }, [onComplete]);

  return { ...state, loadProfileData };
}

/**
 * Full-screen step-by-step loading overlay.
 */
export function ProfileLoaderScreen({ profileName, bootStep, completedSteps }: {
  profileName: string;
  bootStep: string;
  completedSteps: string[];
}) {
  return (
    <div className="min-h-screen bg-[var(--frame-background)] flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-6 animate-fade-in-up w-full max-w-sm">
        <div className="w-20 h-20 bg-[var(--frame-primary)] rounded-3xl flex items-center justify-center shadow-glow mb-2">
          <Tv className="w-10 h-10 text-white" />
        </div>

        <div className="flex flex-col items-center gap-2 mb-4">
          <h2 className="text-2xl font-bold text-white tracking-tight">
            {profileName || 'Servis Yükleniyor'}
          </h2>
        </div>

        <div className="w-full space-y-2">
          {ALL_STEPS.map((step) => {
            const isCompleted = completedSteps.includes(step);
            const isCurrent = bootStep === step;

            return (
              <div
                key={step}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300 ${
                  isCurrent ? 'bg-white/10 border border-white/10' :
                  isCompleted ? 'bg-white/5' : 'opacity-40'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-[var(--frame-primary)] animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
                )}
                <span className={`text-sm ${isCurrent ? 'text-white font-medium' : isCompleted ? 'text-white/60' : 'text-white/30'}`}>
                  {BOOT_MESSAGES[step]}
                </span>
              </div>
            );
          })}
        </div>

        {bootStep === 'complete' && (
          <div className="flex items-center gap-2 text-green-400 font-medium mt-2">
            <CheckCircle className="w-5 h-5" />
            <span>Hazır!</span>
          </div>
        )}

        {bootStep === 'error' && (
          <p className="text-red-400 text-sm mt-2">Veri yüklenirken hata oluştu</p>
        )}
      </div>
    </div>
  );
}
