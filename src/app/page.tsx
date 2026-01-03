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
    setHasProfiles(state.profiles && state.profiles.length > 0);
    setIsHydrated(true);

    // Show import handler if import params present
    if (hasImportParams) {
      setShowImport(true);
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
