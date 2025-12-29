'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { ServiceSelector } from '@/components/auth/ServiceSelector';

export default function LoginPage() {
  const router = useRouter();
  const profiles = usePlayerStore((state) => state.profiles);
  const activeProfile = usePlayerStore((state) => state.activeProfile);
  const switchProfile = usePlayerStore((state) => state.switchProfile);
  const [showAddNew, setShowAddNew] = useState(false);
  const [autoSelected, setAutoSelected] = useState(false);

  // Auto-select single profile
  useEffect(() => {
    if (profiles.length === 1 && !activeProfile && !autoSelected) {
      setAutoSelected(true);
      switchProfile(profiles[0].id);
      router.push('/dashboard');
    }
  }, [profiles, activeProfile, autoSelected, switchProfile, router]);

  // If no profiles, show add service form
  // If profiles exist but user wants to add new, show form
  // Otherwise show service selector
  if (profiles.length === 0 || showAddNew) {
    return <LoginScreen onBack={profiles.length > 0 ? () => setShowAddNew(false) : undefined} />;
  }

  // If auto-selecting, show nothing to prevent flicker
  if (profiles.length === 1 && !activeProfile) {
    return null;
  }

  return <ServiceSelector onAddNew={() => setShowAddNew(true)} />;
}
