'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Hero, Features, HowItWorks, FAQ, FAQSchema, Footer, MagicLink } from '@/components/landing';
import { ImportHandler } from '@/components/import/ImportHandler';

function HomeContent() {
  const searchParams = useSearchParams();
  const [hasProfiles, setHasProfiles] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showImport, setShowImport] = useState(false);

  // Check for import params
  const hasImportParams = searchParams.has('importUrl') || searchParams.has('importXtream') || searchParams.has('d');

  useEffect(() => {
    // Check for existing profiles on client side (after hydration)
    const state = usePlayerStore.getState();
    const profilesExist = state.profiles && state.profiles.length > 0;
    setHasProfiles(profilesExist);
    setIsHydrated(true);

    // Show import handler if import params present
    if (hasImportParams) {
      setShowImport(true);
    } else if (profilesExist) {
      // Auto-start for desktop app (skip landing page)
      const isElectron = new URLSearchParams(window.location.search).get('electron') === '1' || localStorage.getItem('isElectronApp') === 'true';
      if (isElectron) {
        const { defaultProfileId, switchProfile, activeProfile, setHasBooted, hasBooted } = usePlayerStore.getState();
        
        // Only run auto-boot logic IF we haven't booted yet.
        if (!hasBooted) {
          // If we have an active profile or want to auto-select, go straight to dashboard
          if (state.profiles.length > 0) {
             setHasBooted(true);
             const targetProfile = defaultProfileId 
               ? state.profiles.find(p => p.id === defaultProfileId) || state.profiles[0] 
               : state.profiles[0];
               
             if (!activeProfile || activeProfile.id !== targetProfile.id) {
               switchProfile(targetProfile.id);
             }
             window.location.href = '/dashboard';
          } else {
             window.location.href = '/login';
          }
        }
      }
    }
  }, [hasImportParams]);

  // Show import handler
  if (showImport && hasImportParams) {
    return (
      <ImportHandler 
        onComplete={() => setShowImport(false)}
        onCancel={() => {
          setShowImport(false);
          // Clear URL params
          window.history.replaceState({}, '', '/');
        }}
      />
    );
  }

  return (
    <>
      {/* FAQ Schema for SEO */}
      <FAQSchema />

      {/* Landing Page Content - visible to everyone */}
      <main>
        <Hero hasProfiles={hasProfiles} isHydrated={isHydrated} />
        <MagicLink />
        <Features />
        <HowItWorks />
        <FAQ />
        <Footer />
      </main>
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--iptv-background)]" />}>
      <HomeContent />
    </Suspense>
  );
}
