'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Gauge, Server, Plus, Trash2, Edit, AlertTriangle, RefreshCw, Clock, Subtitles, ExternalLink, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { usePlayerStore } from '@/store/usePlayerStore';
import { 
  authenticateXtream, 
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
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

const BUFFER_OPTIONS = [
  { id: 'instant', label: { tr: 'Anlık', en: 'Instant' }, desc: { tr: '~0.5s gecikme', en: '~0.5s delay' } },
  { id: 'low', label: { tr: 'Düşük Gecikme', en: 'Low Latency' }, desc: { tr: '~2s gecikme', en: '~2s delay' } },
  { id: 'medium', label: { tr: 'Orta Gecikme', en: 'Medium Latency' }, desc: { tr: '~5s gecikme', en: '~5s delay' } },
  { id: 'high', label: { tr: 'Yüksek Gecikme', en: 'High Latency' }, desc: { tr: '~10s gecikme, stabil', en: '~10s delay, stable' } },
] as const;

const CACHE_OPTIONS = [
  { id: 4 as const, label: { tr: '4 Saat', en: '4 Hours' } },
  { id: 24 as const, label: { tr: '1 Gün', en: '1 Day' } },
  { id: 72 as const, label: { tr: '3 Gün', en: '3 Days' } },
  { id: 168 as const, label: { tr: '7 Gün', en: '7 Days' } },
];

export function SettingsPanel() {
  const router = useRouter();
  const { t } = useTranslation();
  
  const { 
    language, bufferMode, cacheExpiry, profiles, activeProfile,
    setLanguage, setBufferMode, setCacheExpiry, removeProfile, switchProfile, updateProfile,
    setCategories, setContent, setLoading
  } = usePlayerStore();
  
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [supportUrlDialog, setSupportUrlDialog] = useState<{ url: string; name: string } | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      const wasActive = activeProfile?.id === deleteConfirmId;
      removeProfile(deleteConfirmId);
      setDeleteConfirmId(null);
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
    router.push(`/login?edit=${id}`);
  };

  const handleRefreshProfile = async (profile: typeof profiles[0]) => {
    if (refreshingId) return;
    setRefreshingId(profile.id);
    setLoading(true, 'processing');

    try {
      if (profile.type === 'xtream' && profile.credentials) {
        const credentials = profile.credentials;
        
        // Re-authenticate to get fresh exp_date
        const authResponse = await authenticateXtream(credentials);
        
        const [liveCategories, vodCategories, seriesCategories] = await Promise.all([
          getLiveCategories(credentials),
          getVodCategories(credentials),
          getSeriesCategories(credentials),
        ]);

        const [liveStreams, vodStreams, seriesList] = await Promise.all([
          getLiveStreams(credentials),
          getVodStreams(credentials),
          getSeries(credentials),
        ]);

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

        setCategories(categories);
        setContent(content);
        
        // Update profile with fresh exp_date and lastRefresh
        updateProfile(profile.id, { 
          credentials: {
            ...credentials,
            exp_date: authResponse.user_info.exp_date,
          },
          lastRefresh: Date.now() 
        });

      } else if (profile.type === 'm3u' && profile.m3uUrl) {
        const { content, categories } = await processM3UPlaylist(profile.m3uUrl);
        setCategories(categories);
        setContent(content);
        updateProfile(profile.id, { lastRefresh: Date.now() });
      }
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setRefreshingId(null);
      setLoading(false);
    }
  };

  const handleSupportUrlClick = (url: string, name: string) => {
    setSupportUrlDialog({ url, name });
  };

  const handleSupportUrlConfirm = () => {
    if (supportUrlDialog) {
      window.open(supportUrlDialog.url, '_blank', 'noopener,noreferrer');
      setSupportUrlDialog(null);
    }
  };

  const formatLastRefresh = (timestamp?: number) => {
    if (!timestamp) return language === 'tr' ? 'Hiç' : 'Never';
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    
    if (days > 0) return language === 'tr' ? `${days} gün önce` : `${days} days ago`;
    if (hours > 0) return language === 'tr' ? `${hours} saat önce` : `${hours} hours ago`;
    return language === 'tr' ? 'Az önce' : 'Just now';
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

      {/* Support URL Confirmation Dialog */}
      {supportUrlDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="bg-[var(--iptv-surface-dark)] border border-white/10 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <ExternalLink className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  {language === 'tr' ? 'Harici Bağlantı' : 'External Link'}
                </h3>
                <p className="text-white/50 text-sm">
                  {supportUrlDialog.name}
                </p>
              </div>
            </div>
            <p className="text-white/70 text-sm mb-6">
              {language === 'tr' 
                ? 'Hizmet sağlayıcınızın destek sayfasına yönlendirileceksiniz. Bu sayfa FRAME Web Player ile ilişkili değildir ve üçüncü taraf bir hizmettir.'
                : "You will be redirected to your service provider's support page. This page is not affiliated with FRAME Web Player and is a third-party service."}
            </p>
            <div className="mb-6 p-3 bg-white/5 rounded-lg border border-white/10">
              <p className="text-xs text-white/40 mb-1">
                {language === 'tr' ? 'Yönlendirilecek adres:' : 'Destination:'}
              </p>
              <p className="text-sm text-white/80 font-mono break-all">
                {supportUrlDialog.url}
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setSupportUrlDialog(null)}
                className="flex-1 border-white/10 text-white/60 hover:text-white"
              >
                {language === 'tr' ? 'İptal' : 'Cancel'}
              </Button>
              <Button
                onClick={handleSupportUrlConfirm}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                {language === 'tr' ? 'Devam Et' : 'Continue'}
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

        {/* Cache Expiry Section */}
        <div className="bg-white/5 rounded-xl border border-white/10 p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold">{language === 'tr' ? 'Önbellek Süresi' : 'Cache Duration'}</h2>
              <p className="text-white/50 text-sm">{language === 'tr' ? 'İçerik ne sıklıkla yenilensin' : 'How often content should refresh'}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {CACHE_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => setCacheExpiry(option.id)}
                className={cn(
                  'p-3 rounded-lg border text-center transition-all',
                  cacheExpiry === option.id
                    ? 'bg-[var(--iptv-primary)]/20 border-[var(--iptv-primary)]/50 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                <p className="font-medium text-sm">{option.label[language]}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Audio & Subtitles Section */}
        <AudioSubtitlesSection language={language} />

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
                    'flex flex-col gap-2 p-4 rounded-lg border transition-all cursor-pointer',
                    activeProfile?.id === profile.id
                      ? 'bg-[var(--iptv-primary)]/10 border-[var(--iptv-primary)]/30'
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  )}
                >
                  {/* Line 1: Service Name | Active Status ---------- Service Type */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{profile.name}</p>
                      {activeProfile?.id === profile.id && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20 shrink-0">
                          <span className="text-green-400 text-xs">●</span>
                          <span className="text-green-400 text-xs font-medium">
                            {language === 'tr' ? 'Aktif' : 'Active'}
                          </span>
                        </span>
                      )}
                    </div>
                    <p className="text-white/60 text-sm shrink-0">
                      {profile.type === 'xtream' ? 'Xtream Codes' : 'M3U Playlist'}
                    </p>
                  </div>

                  {/* Line 2: Expiration Date | Remaining Time (for Xtream only) */}
                  {profile.type === 'xtream' && (() => {
                    const expDate = profile.credentials?.exp_date;
                    
                    // Check for lifetime subscription
                    if (!expDate || expDate === '0' || expDate === '') {
                      return (
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-yellow-500/10 border border-yellow-500/20">
                            <Infinity className="w-3.5 h-3.5 text-yellow-400" />
                            <span className="text-sm font-medium text-yellow-400">
                              {language === 'tr' ? 'Sınırsız Üyelik' : 'Lifetime Membership'}
                            </span>
                          </span>
                        </div>
                      );
                    }
                    
                    // Parse expiration date
                    const exp = new Date(parseInt(expDate) * 1000);
                    const now = Date.now();
                    const diffMs = exp.getTime() - now;
                    const daysLeft = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                    const monthsLeft = Math.floor(daysLeft / 30);
                    
                    // Determine status color
                    const isExpired = daysLeft < 0;
                    const isExpiringSoon = daysLeft >= 0 && daysLeft < 7;
                    
                    let colorClass = "text-green-400";
                    if (isExpired) colorClass = "text-red-400";
                    else if (isExpiringSoon) colorClass = "text-orange-400";

                    // Format date
                    const formattedDate = exp.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    });

                    // Format remaining time
                    let remainingText = '';
                    if (isExpired) {
                      const expiredDays = Math.abs(daysLeft);
                      remainingText = language === 'tr' 
                        ? `${expiredDays} gün önce doldu` 
                        : `Expired ${expiredDays} days ago`;
                    } else if (monthsLeft >= 1) {
                      remainingText = language === 'tr'
                        ? `${monthsLeft} ay (${daysLeft} gün)`
                        : `${monthsLeft} months (${daysLeft} days)`;
                    } else {
                      remainingText = language === 'tr'
                        ? `${daysLeft} gün`
                        : `${daysLeft} days`;
                    }

                    return (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">
                            {language === 'tr' ? 'Üyelik Bitiş:' : 'Expires:'}
                          </span>
                          <span className={cn("font-medium", colorClass)}>
                            {formattedDate}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50">
                            {language === 'tr' ? 'Kalan:' : 'Remaining:'}
                          </span>
                          <span className={cn("font-medium", colorClass)}>
                            {remainingText}
                          </span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRefreshProfile(profile);
                      }}
                      disabled={refreshingId === profile.id}
                      className="text-white/60 hover:text-green-400"
                    >
                      <RefreshCw className={cn("w-4 h-4 mr-2", refreshingId === profile.id && "animate-spin")} />
                      {language === 'tr' ? 'Güncelle' : 'Refresh'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/login?edit=${profile.id}`);
                      }}
                      className="text-white/60 hover:text-white"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {language === 'tr' ? 'Düzenle' : 'Edit'}
                    </Button>
                    {profile.supportUrl && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSupportUrlClick(profile.supportUrl!, profile.name);
                        }}
                        className="text-white/60 hover:text-blue-400"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {language === 'tr' ? 'Destek' : 'Support'}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(profile.id);
                      }}
                      className="text-white/60 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {language === 'tr' ? 'Sil' : 'Delete'}
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

// Language options for audio/subtitles
const TRACK_LANGUAGE_OPTIONS = [
  { id: 'tr', label: 'Türkçe' },
  { id: 'en', label: 'English' },
  { id: 'de', label: 'Deutsch' },
  { id: 'fr', label: 'Français' },
  { id: 'es', label: 'Español' },
  { id: 'ar', label: 'العربية' },
  { id: 'ru', label: 'Русский' },
  { id: 'original', label: 'Orijinal / Original' },
];

function AudioSubtitlesSection({ language }: { language: 'tr' | 'en' }) {
  const { 
    preferredSubtitle1, preferredSubtitle2, subtitlesEnabled,
    preferredAudio1, preferredAudio2,
    setSubtitlePreferences, setAudioPreferences 
  } = usePlayerStore();

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Subtitles className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h2 className="text-white font-semibold">{language === 'tr' ? 'Ses ve Altyazı' : 'Audio & Subtitles'}</h2>
          <p className="text-white/50 text-sm">{language === 'tr' ? 'Tercih edilen dilleri ayarlayın' : 'Set preferred languages'}</p>
        </div>
      </div>
      
      {/* Subtitles Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setSubtitlePreferences(preferredSubtitle1, preferredSubtitle2, !subtitlesEnabled)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-all',
            subtitlesEnabled
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-white/5 border-white/10'
          )}
        >
          <span className={cn('font-medium', subtitlesEnabled ? 'text-green-400' : 'text-white/60')}>
            {language === 'tr' ? 'Altyazıları Göster' : 'Show Subtitles'}
          </span>
          <div className={cn(
            'w-12 h-6 rounded-full transition-all relative',
            subtitlesEnabled ? 'bg-green-500' : 'bg-white/20'
          )}>
            <div className={cn(
              'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
              subtitlesEnabled ? 'right-1' : 'left-1'
            )} />
          </div>
        </button>
      </div>

      {/* Subtitle Preferences */}
      <div className="space-y-3 mb-6">
        <p className="text-sm text-white/70 font-medium">{language === 'tr' ? 'Altyazı Tercihleri' : 'Subtitle Preferences'}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">{language === 'tr' ? '1. Tercih' : '1st Choice'}</label>
            <select
              value={preferredSubtitle1}
              onChange={(e) => setSubtitlePreferences(e.target.value, preferredSubtitle2, subtitlesEnabled)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--iptv-primary)]"
            >
              {TRACK_LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-zinc-900">{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">{language === 'tr' ? '2. Tercih' : '2nd Choice'}</label>
            <select
              value={preferredSubtitle2}
              onChange={(e) => setSubtitlePreferences(preferredSubtitle1, e.target.value, subtitlesEnabled)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--iptv-primary)]"
            >
              {TRACK_LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-zinc-900">{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Audio Preferences */}
      <div className="space-y-3">
        <p className="text-sm text-white/70 font-medium">{language === 'tr' ? 'Ses Tercihleri' : 'Audio Preferences'}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-white/50 mb-1 block">{language === 'tr' ? '1. Tercih' : '1st Choice'}</label>
            <select
              value={preferredAudio1}
              onChange={(e) => setAudioPreferences(e.target.value, preferredAudio2)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--iptv-primary)]"
            >
              {TRACK_LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-zinc-900">{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1 block">{language === 'tr' ? '2. Tercih' : '2nd Choice'}</label>
            <select
              value={preferredAudio2}
              onChange={(e) => setAudioPreferences(preferredAudio1, e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-[var(--iptv-primary)]"
            >
              {TRACK_LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-zinc-900">{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
