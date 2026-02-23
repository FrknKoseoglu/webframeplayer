
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { ServiceSelector } from '@/components/auth/ServiceSelector';

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
    const forceSelect = searchParams.get('select') === 'true';
    const forceAdd = searchParams.get('add') === 'true';
    const { hasBooted, defaultProfileId, setHasBooted } = usePlayerStore.getState();

    // If we've already booted in this session, don't auto-redirect unless forceSelect
    // If not booted, we redirect to default or first profile
    if (!hasBooted && profiles.length > 0 && !editProfileId && !forceSelect && !forceAdd) {
      setHasBooted(true);
      
      // Mark as auto-selected so UI knows
      setAutoSelected(true);
      
      const targetProfile = defaultProfileId 
        ? profiles.find(p => p.id === defaultProfileId) || profiles[0] 
        : profiles[0];
        
      if (!activeProfile || activeProfile.id !== targetProfile.id) {
        switchProfile(targetProfile.id);
      }
      
      router.push('/dashboard');
      return;
    }
    // Organic login page hit from dashboard (or multiple profiles without default)
    const organicHit = profiles.length > 0 && activeProfile && !forceSelect && !forceAdd && !editProfileId && hasBooted;
    if (organicHit) {
      // Intentionally do nothing to let them select a service
    }
  }, [profiles, activeProfile, autoSelected, switchProfile, router, editProfileId, searchParams]);

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

  // If auto-selecting, show nothing to prevent flicker
  if (profiles.length === 1 && !activeProfile) {
    return null;
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
