
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { ServiceSelector } from '@/components/auth/ServiceSelector';
import { useProfileLoader, ProfileLoaderScreen } from '@/components/auth/ProfileLoader';
import type { Profile } from '@/types/player';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profiles = usePlayerStore((state) => state.profiles);
  const [showAddNew, setShowAddNew] = useState(false);
  const [editProfileId, setEditProfileId] = useState<string | null>(null);

  const { isLoading, profileName, bootStep, completedSteps, loadProfileData } = useProfileLoader(() => {
    router.replace('/dashboard');
  });

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

  // Auto-select on app boot (Electron auto-login)
  useEffect(() => {
    if (isLoading) return;

    const currentState = usePlayerStore.getState();
    if (currentState.profiles.length === 0) return;

    const forceSelect = searchParams.get('select') === 'true';
    const forceAdd = searchParams.get('add') === 'true';

    if (!currentState.hasBooted && !editProfileId && !forceSelect && !forceAdd) {
      currentState.setHasBooted(true);
      
      const targetProfile = currentState.defaultProfileId 
        ? currentState.profiles.find(p => p.id === currentState.defaultProfileId) || currentState.profiles[0] 
        : currentState.profiles[0];
      
      loadProfileData(targetProfile);
    }
  }, [searchParams, editProfileId, profiles, isLoading, loadProfileData]);

  // Edit mode
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

  // No profiles or add new
  if (profiles.length === 0 || showAddNew) {
    return <LoginScreen onBack={profiles.length > 0 ? () => setShowAddNew(false) : undefined} />;
  }

  // Step-by-step loading screen
  if (isLoading) {
    return <ProfileLoaderScreen profileName={profileName} bootStep={bootStep} completedSteps={completedSteps} />;
  }

  return <ServiceSelector onAddNew={() => setShowAddNew(true)} onSelect={(profile) => loadProfileData(profile)} />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--frame-background)]" />}>
      <LoginPageContent />
    </Suspense>
  );
}
