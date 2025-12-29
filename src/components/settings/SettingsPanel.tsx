'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Gauge, Server, Plus, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';

const BUFFER_OPTIONS = [
  { id: 'instant', label: { tr: 'Anlık', en: 'Instant' }, desc: { tr: '~0.5s gecikme', en: '~0.5s delay' } },
  { id: 'low', label: { tr: 'Düşük Gecikme', en: 'Low Latency' }, desc: { tr: '~2s gecikme', en: '~2s delay' } },
  { id: 'medium', label: { tr: 'Orta Gecikme', en: 'Medium Latency' }, desc: { tr: '~5s gecikme', en: '~5s delay' } },
  { id: 'high', label: { tr: 'Yüksek Gecikme', en: 'High Latency' }, desc: { tr: '~10s gecikme, stabil', en: '~10s delay, stable' } },
] as const;

export function SettingsPanel() {
  const router = useRouter();
  const { language, bufferMode, profiles, activeProfile, setLanguage, setBufferMode, removeProfile, switchProfile } = usePlayerStore();
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      const wasActive = activeProfile?.id === deleteConfirmId;
      removeProfile(deleteConfirmId);
      setDeleteConfirmId(null);
      // If deleted the active profile, redirect to login
      if (wasActive) {
        router.push('/login');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null);
  };

  const handleProfileClick = (id: string) => {
    if (activeProfile?.id !== id) {
      switchProfile(id);
    }
  };

  const handleEditProfile = (id: string) => {
    // Navigate to login with edit mode (can be extended later)
    router.push(`/login?edit=${id}`);
  };

  return (
    <div className="h-full overflow-y-auto bg-[var(--iptv-surface-dark)] p-6">
      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[var(--iptv-surface-dark)] border border-white/10 rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {language === 'tr' ? 'Hizmeti Sil' : 'Delete Service'}
                </h3>
                <p className="text-white/50 text-sm">
                  {language === 'tr' ? 'Bu işlem geri alınamaz' : 'This action cannot be undone'}
                </p>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-6">
              {language === 'tr' 
                ? 'Bu hizmeti silmek istediğinizden emin misiniz?' 
                : 'Are you sure you want to delete this service?'}
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
                className="flex-1 border-white/10 text-white/60 hover:text-white"
              >
                {language === 'tr' ? 'İptal' : 'Cancel'}
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white"
              >
                {language === 'tr' ? 'Sil' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">
            {language === 'tr' ? 'Ayarlar' : 'Settings'}
          </h1>
          <p className="text-white/60 text-sm">
            {language === 'tr' ? 'Uygulama ayarlarını özelleştirin' : 'Customize application settings'}
          </p>
        </div>

        {/* Language Section */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">{language === 'tr' ? 'Dil' : 'Language'}</h2>
              <p className="text-white/50 text-sm">{language === 'tr' ? 'Arayüz dilini seçin' : 'Select interface language'}</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setLanguage('tr')}
              className={cn(
                'flex-1 border-white/10',
                language === 'tr' ? 'bg-[var(--iptv-primary)] border-[var(--iptv-primary)] text-white' : 'text-white/60 hover:text-white'
              )}
            >
              🇹🇷 Türkçe
            </Button>
            <Button
              variant="outline"
              onClick={() => setLanguage('en')}
              className={cn(
                'flex-1 border-white/10',
                language === 'en' ? 'bg-[var(--iptv-primary)] border-[var(--iptv-primary)] text-white' : 'text-white/60 hover:text-white'
              )}
            >
              🇬🇧 English
            </Button>
          </div>
        </div>

        {/* Buffer Section */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Gauge className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">{language === 'tr' ? 'Canlı Yayın Buffer' : 'Live Stream Buffer'}</h2>
              <p className="text-white/50 text-sm">{language === 'tr' ? 'Gecikme ve stabilite dengesini ayarlayın' : 'Adjust latency and stability balance'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {BUFFER_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setBufferMode(option.id)}
                className={cn(
                  'p-3 rounded-lg border text-left transition-all',
                  bufferMode === option.id
                    ? 'bg-[var(--iptv-primary)]/20 border-[var(--iptv-primary)]/50 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                <p className="font-medium text-sm">{option.label[language]}</p>
                <p className="text-xs opacity-60 mt-0.5">{option.desc[language]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Services Section */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Server className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-white font-semibold">{language === 'tr' ? 'Hizmetler' : 'Services'}</h2>
                <p className="text-white/50 text-sm">{language === 'tr' ? 'IPTV servislerinizi yönetin' : 'Manage your IPTV services'}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/login')}
              className="border-white/10 text-white/60 hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === 'tr' ? 'Ekle' : 'Add'}
            </Button>
          </div>
          
          <div className="space-y-2">
            {profiles.length === 0 ? (
              <div className="text-center py-8">
                <Server className="w-10 h-10 text-white/20 mx-auto mb-2" />
                <p className="text-white/50 text-sm">{language === 'tr' ? 'Henüz hizmet eklenmedi' : 'No services added yet'}</p>
              </div>
            ) : (
              profiles.map((profile) => (
                <div
                  key={profile.id}
                  onClick={() => handleProfileClick(profile.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer',
                    activeProfile?.id === profile.id
                      ? 'bg-[var(--iptv-primary)]/10 border-[var(--iptv-primary)]/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{profile.name}</p>
                    <p className="text-white/40 text-xs truncate">
                      {profile.type === 'xtream' ? 'Xtream Codes' : 'M3U Playlist'}
                      {activeProfile?.id === profile.id && (
                        <span className="ml-2 text-green-400">● {language === 'tr' ? 'Aktif' : 'Active'}</span>
                      )}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleEditProfile(profile.id); }}
                      className="h-8 w-8 text-white/40 hover:text-blue-400"
                      title={language === 'tr' ? 'Düzenle' : 'Edit'}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleDeleteClick(profile.id); }}
                      className="h-8 w-8 text-white/40 hover:text-red-400"
                      title={language === 'tr' ? 'Sil' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
