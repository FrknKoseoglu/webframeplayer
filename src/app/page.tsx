'use client';

import { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Hero, Features, HowItWorks, FAQ, FAQSchema, Footer } from '@/components/landing';

export default function Home() {
  const [hasProfiles, setHasProfiles] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Check for existing profiles on client side (after hydration)
    const state = usePlayerStore.getState();
    setHasProfiles(state.profiles && state.profiles.length > 0);
    setIsHydrated(true);
  }, []);

  return (
    <>
      {/* FAQ Schema for SEO */}
      <FAQSchema />

      {/* Landing Page Content - visible to everyone */}
      <main>
        <Hero hasProfiles={hasProfiles} isHydrated={isHydrated} />
        <Features />
        <HowItWorks />
        <FAQ />
        <Footer />
      </main>
    </>
  );
}
