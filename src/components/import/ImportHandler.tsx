'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Tv, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/usePlayerStore';
import { 
  authenticateXtream, 
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
import type { Profile, LoadingStep } from '@/types/iptv';
import { LOADING_MESSAGES } from '@/types/iptv';

interface ImportHandlerProps {
  onComplete: () => void;
  onCancel: () => void;
}

const MIN_DISPLAY_TIME = 3000; // 3 seconds minimum

export function ImportHandler({ onComplete, onCancel }: ImportHandlerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addProfile, switchProfile, setCategories, setContent, setLoading, language } = usePlayerStore();
  
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('idle');
  const [error, setError] = useState<string | null>(null);
  const [customMessage, setCustomMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [displayServiceName, setDisplayServiceName] = useState<string>('');
  
  // Prevent duplicate imports
  const importStartedRef = useRef(false);
  const startTimeRef = useRef<number>(0);

  // Parse encrypted data if present (Base64 encoded JSON)
  const encryptedData = searchParams.get('d');
  const parsedData = useMemo(() => {
    if (encryptedData) {
      try {
        const decoded = atob(encryptedData);
        return JSON.parse(decoded) as Record<string, string>;
      } catch {
        return null;
      }
    }
    return null;
  }, [encryptedData]);

  // Get import params (support both encrypted and plain)
  const importUrl = parsedData?.importUrl || searchParams.get('importUrl');
  const importXtream = parsedData?.importXtream || searchParams.has('importXtream');
  const xtreamUser = parsedData?.user || searchParams.get('user');
  const xtreamPassword = parsedData?.password || searchParams.get('password');
  const xtreamHost = parsedData?.host || searchParams.get('host');
  const serviceName = parsedData?.serviceName || searchParams.get('serviceName');
  const messageParam = parsedData?.message || searchParams.get('message');
  const supportUrl = parsedData?.supportUrl || searchParams.get('supportUrl');
  const logoUrl = parsedData?.logoUrl || searchParams.get('logoUrl');
  const xrkad = parsedData?.xrkad || searchParams.get('xrkad'); // Ad-free flag from provider magic links

  // Set display service name
  useEffect(() => {
    if (serviceName) {
      setDisplayServiceName(decodeURIComponent(serviceName));
    } else if (importUrl) {
      setDisplayServiceName('M3U Playlist');
    } else if (importXtream) {
      setDisplayServiceName('Xtream Codes');
    }
  }, [serviceName, importUrl, importXtream]);

  // Decode Base64 message if present (UTF-8 safe)
  useEffect(() => {
    if (messageParam) {
      try {
        // Reverse the encoding: base64 -> Latin1 -> percent-encoded -> UTF-8
        const decoded = decodeURIComponent(escape(atob(messageParam)));
        setCustomMessage(decoded);
      } catch {
        // Invalid base64, ignore
      }
    }
  }, [messageParam]);

  const updateStep = (step: LoadingStep) => {
    setLoadingStep(step);
    setLoading(true, step);
  };

  // Wait for minimum display time then redirect
  const completeWithDelay = async () => {
    const elapsed = Date.now() - startTimeRef.current;
    const remaining = MIN_DISPLAY_TIME - elapsed;
    
    if (remaining > 0) {
      await new Promise(resolve => setTimeout(resolve, remaining));
    }
    
    updateStep('complete');
    setSuccess(true);
    setLoading(false);
  };

  // Handle M3U import
  const handleM3UImport = async () => {
    if (!importUrl || importStartedRef.current) return;
    
    importStartedRef.current = true;
    startTimeRef.current = Date.now();
    setError(null);

    try {
      updateStep('processing');
      
      const { content, categories } = await processM3UPlaylist(importUrl);

      const profile: Profile = {
        id: crypto.randomUUID(),
        name: serviceName ? decodeURIComponent(serviceName) : 'M3U Playlist',
        type: 'm3u',
        m3uUrl: importUrl,
        supportUrl: supportUrl || undefined,
        logoUrl: logoUrl || undefined,
        adFree: xrkad === '1', // Ad-free if from provider magic link
        active: true,
        createdAt: Date.now(),
        lastRefresh: Date.now(),
      };

      addProfile(profile);
      switchProfile(profile.id);
      setCategories(categories);
      setContent(content);

      await completeWithDelay();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import başarısız');
      updateStep('error');
      importStartedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // Handle Xtream import
  const handleXtreamImport = async () => {
    if (!xtreamHost || !xtreamUser || !xtreamPassword || importStartedRef.current) return;
    
    importStartedRef.current = true;
    startTimeRef.current = Date.now();
    setError(null);

    try {
      const credentials = {
        url: xtreamHost,
        username: xtreamUser,
        password: xtreamPassword,
      };

      updateStep('authenticating');
      const authResponse = await authenticateXtream(credentials);

      if (!authResponse.user_info || authResponse.user_info.auth === 0) {
        throw new Error('Kimlik doğrulama başarısız');
      }

      updateStep('fetching_categories');
      const [liveCategories, vodCategories, seriesCategories] = await Promise.all([
        getLiveCategories(credentials),
        getVodCategories(credentials),
        getSeriesCategories(credentials),
      ]);

      updateStep('fetching_live');
      const liveStreams = await getLiveStreams(credentials);

      updateStep('fetching_movies');
      const vodStreams = await getVodStreams(credentials);

      updateStep('fetching_series');
      const seriesList = await getSeries(credentials);

      updateStep('processing');
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

      const profile: Profile = {
        id: crypto.randomUUID(),
        name: serviceName ? decodeURIComponent(serviceName) : authResponse.user_info.username || 'Xtream Hizmet',
        type: 'xtream',
        credentials: {
          ...credentials,
          exp_date: authResponse.user_info.exp_date,
        },
        supportUrl: supportUrl || undefined,
        logoUrl: logoUrl || undefined,
        adFree: xrkad === '1', // Ad-free if from provider magic link
        active: true,
        createdAt: Date.now(),
        lastRefresh: Date.now(),
      };

      addProfile(profile);
      switchProfile(profile.id);
      setCategories(categories);
      setContent(content);

      await completeWithDelay();

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import başarısız');
      updateStep('error');
      importStartedRef.current = false;
    } finally {
      setLoading(false);
    }
  };

  // Auto-start import (only once)
  useEffect(() => {
    if (importStartedRef.current) return;
    
    if (importUrl && loadingStep === 'idle') {
      handleM3UImport();
    } else if (importXtream && xtreamHost && xtreamUser && xtreamPassword && loadingStep === 'idle') {
      handleXtreamImport();
    }
  }, []);

  const getProgressWidth = () => {
    switch (loadingStep) {
      case 'authenticating': return '15%';
      case 'fetching_categories': return '30%';
      case 'fetching_live': return '50%';
      case 'fetching_movies': return '65%';
      case 'fetching_series': return '80%';
      case 'processing': return '95%';
      case 'complete': return '100%';
      default: return '0%';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--iptv-background)] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[var(--iptv-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-[var(--iptv-primary)] rounded-2xl flex items-center justify-center">
            {success ? (
              <CheckCircle className="w-8 h-8 text-white" />
            ) : (
              <Tv className="w-8 h-8 text-white" />
            )}
          </div>
        </div>

        {/* Service Name */}
        {displayServiceName && (
          <h2 className="text-xl font-bold text-white text-center mb-1">
            {displayServiceName}
          </h2>
        )}

        {/* Title */}
        <p className="text-white/60 text-sm text-center mb-4">
          {success 
            ? (language === 'tr' ? 'Yükleme Tamamlandı' : 'Upload Completed')
            : (language === 'tr' ? 'Hizmet içe aktarılıyor...' : 'Importing service...')}
        </p>

        {/* Custom Message from Provider */}
        {customMessage && (
          <div className="bg-[var(--iptv-primary)]/10 border border-[var(--iptv-primary)]/30 rounded-lg p-4 mb-6">
            <p className="text-white/80 text-sm text-center italic">
              "{customMessage}"
            </p>
          </div>
        )}

        {/* Progress */}
        {!success && !error && (
          <div className="mt-4">
            <div className="flex items-center gap-3 text-sm text-white/70 mb-2">
              <Loader2 className="w-4 h-4 animate-spin text-[var(--iptv-primary)]" />
              <span>{LOADING_MESSAGES[loadingStep]}</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[var(--iptv-primary)] transition-all duration-300"
                style={{ width: getProgressWidth() }}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-6">
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
              {error}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-white/10 text-white/60 hover:text-white"
              >
                {language === 'tr' ? 'İptal' : 'Cancel'}
              </Button>
              <Button
                onClick={() => {
                  setError(null);
                  setLoadingStep('idle');
                  importStartedRef.current = false;
                  if (importUrl) handleM3UImport();
                  else if (importXtream) handleXtreamImport();
                }}
                className="flex-1 bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white"
              >
                {language === 'tr' ? 'Tekrar Dene' : 'Retry'}
              </Button>
            </div>
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mt-6">
            <Button
              onClick={() => {
                onComplete();
                router.push('/dashboard');
              }}
              className="w-full bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white h-12 text-lg font-bold"
            >
              {language === 'tr' ? 'Devam Et' : 'Continue'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
