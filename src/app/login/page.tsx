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

  // Check for edit query param
  useEffect(() => {
    const editId = searchParams.get('edit');
    if (editId) {
      const profileToEdit = profiles.find(p => p.id === editId);
      if (profileToEdit) {
        setEditProfileId(editId);
      }
    }
  }, [searchParams, profiles]);

  // Auto-select single profile
  useEffect(() => {
    if (profiles.length === 1 && !activeProfile && !autoSelected && !editProfileId) {
      setAutoSelected(true);
      switchProfile(profiles[0].id);
      router.push('/dashboard');
    }
  }, [profiles, activeProfile, autoSelected, switchProfile, router, editProfileId]);

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
