
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Hero, Features, HowItWorks, FAQ, FAQSchema, Footer, MagicLink } from '@/components/landing';
import { ImportHandler } from '@/components/import/ImportHandler';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [hasProfiles, setHasProfiles] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [isElectronBoot, setIsElectronBoot] = useState(false);

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
    } else {
      // Auto-start for desktop app (skip landing page)
      const isElectron = new URLSearchParams(window.location.search).get('electron') === '1' || localStorage.getItem('isElectronApp') === 'true';
      if (isElectron && !state.hasBooted) {
        setIsElectronBoot(true);
        router.replace('/login');
      }
    }
  }, [hasImportParams, router]);

  // Electron auto-boot: show nothing (blank dark screen) while redirecting
  if (isElectronBoot) {
    return <div className="min-h-screen bg-[var(--frame-background)]" />;
  }

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
    <Suspense fallback={<div className="min-h-screen bg-[var(--frame-background)]" />}>
      <HomeContent />
    </Suspense>
  );
}
