
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { ServiceSelector } from '@/components/auth/ServiceSelector';
import { Loader2, Tv } from 'lucide-react';
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

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profiles = usePlayerStore((state) => state.profiles);
  const activeProfile = usePlayerStore((state) => state.activeProfile);
  const switchProfile = usePlayerStore((state) => state.switchProfile);
  const [showAddNew, setShowAddNew] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);
  const [editProfileId, setEditProfileId] = useState<string | null>(null);

  // Check for edit or add query params
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const profileToEdit = profiles.find(p => p.id === editId);
      if (profileToEdit) {
        setEditProfileId(editId);
      }
    }
    
    if (searchParams.get('add') === 'true') {
      setShowAddNew(true);
    }
  }, [searchParams, profiles]);

  // Auto-select single or default profile on app boot
  useEffect(() => {
    // If we've already started the auto-selection process, don't run this again
    if (autoSelected) return;

    // Check boot state directly from the store's current state
    const currentState = usePlayerStore.getState();

    // MUST wait for Zustand to finish hydrating from IndexedDB
    // otherwise currentState.activeProfile will be incorrectly null and wipe channels
    // We assume it's hydrated when profiles.length > 0 (or we could use persist.hasHydrated if available)
    if (currentState.profiles.length === 0) return;

    const forceSelect = searchParams.get('select') === 'true';
    const forceAdd = searchParams.get('add') === 'true';

    // If we've already booted in this session, don't auto-redirect unless forceSelect
    // If not booted, we redirect to default or first profile
    if (!currentState.hasBooted && !editProfileId && !forceSelect && !forceAdd) {
      currentState.setHasBooted(true);
      
      // Mark as auto-selected so UI knows to show the loading screen
      setAutoSelected(true);
      
      const targetProfile = currentState.defaultProfileId 
        ? currentState.profiles.find(p => p.id === currentState.defaultProfileId) || currentState.profiles[0] 
        : currentState.profiles[0];
        
      if (!currentState.activeProfile || currentState.activeProfile.id !== targetProfile.id) {
        currentState.switchProfile(targetProfile.id);
      }
      
      const loadDataAndRedirect = async () => {
        try {
          if (targetProfile.type === 'm3u' && targetProfile.m3uUrl) {
            const { content, categories } = await processM3UPlaylist(targetProfile.m3uUrl);
            currentState.setCategories(categories);
            currentState.setContent(content);
          } else if (targetProfile.credentials) {
            const credentials = targetProfile.credentials;
            const [liveCategories, vodCategories, seriesCategories] = await Promise.all([
              getLiveCategories(credentials),
              getVodCategories(credentials),
              getSeriesCategories(credentials),
            ]);
            const liveStreams = await getLiveStreams(credentials);
            const vodStreams = await getVodStreams(credentials);
            const seriesList = await getSeries(credentials);
            
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
          }
        } catch (error) {
          console.error('Auto-login fetch failed:', error);
        } finally {
          router.push('/dashboard');
        }
      };
      
      // Initiate loading
      loadDataAndRedirect();
    }
  }, [searchParams, editProfileId, autoSelected, router, profiles]);

  // Edit mode - show form with profile data
  if (editProfileId) {
    const profileToEdit = profiles.find(p => p.id === editProfileId);
    return (
      <LoginScreen 
        onBack={() => {
          setEditProfileId(null);
          router.push('/dashboard');
        }}
        editProfile={profileToEdit}
      />
    );
  }

  // If no profiles, show add service form
  // If profiles exist but user wants to add new, show form
  // Otherwise show service selector
  if (profiles.length === 0 || showAddNew) {
    return <LoginScreen onBack={profiles.length > 0 ? () => setShowAddNew(false) : undefined} />;
  }

  // If auto-selecting, show Loading Service screen
  if (autoSelected) {
    return (
      <div className="min-h-screen bg-[var(--iptv-background)] flex flex-col items-center justify-center p-4">
        <div className="flex flex-col items-center gap-6 animate-fade-in-up">
          <div className="w-20 h-20 bg-[var(--iptv-primary)] rounded-3xl flex items-center justify-center shadow-glow mb-4">
            <Tv className="w-10 h-10 text-white" />
          </div>
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-[var(--iptv-primary)]" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Servis Yükleniyor</h2>
            <p className="text-white/50">{activeProfile?.name || 'Lütfen bekleyin...'}</p>
          </div>
        </div>
      </div>
    );
  }

  return <ServiceSelector onAddNew={() => setShowAddNew(true)} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--iptv-background)]" />}>
      <LoginPageContent />
    </Suspense>
  );
}
