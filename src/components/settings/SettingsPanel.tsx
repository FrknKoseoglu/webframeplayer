'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Gauge, Server, Plus, Trash2, Edit, AlertTriangle, RefreshCw, Clock, Subtitles, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
        updateProfile(profile.id, { lastRefresh: Date.now() });

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
                      <span className="ml-2 text-white/30">• {formatLastRefresh(profile.lastRefresh)}</span>
                      {profile.type === 'xtream' && (
                        <>
                          <br />
                          <span className="text-white/40">
                            {language === 'tr' ? 'Bitiş: ' : 'Expires: '}
                            {profile.credentials?.exp_date ? (
                              <span className={cn(
                                "font-medium",
                                (() => {
                                  const expDate = new Date(profile.credentials.exp_date);
                                  const daysLeft = Math.floor((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                  if (daysLeft < 0) return "text-red-400";
                                  if (daysLeft < 7) return "text-orange-400";
                                  return "text-green-400";
                                })()
                              )}>
                                {(() => {
                                  const expDate = new Date(profile.credentials.exp_date);
                                  const daysLeft = Math.floor((expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                  if (daysLeft < 0) {
                                    return language === 'tr' ? 'Süresi dolmuş' : 'Expired';
                                  } else if (daysLeft === 0) {
                                    return language === 'tr' ? 'Bugün' : 'Today';
                                  } else if (daysLeft < 30) {
                                    return language === 'tr' ? `${daysLeft} gün` : `${daysLeft} days`;
                                  } else {
                                    return expDate.toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US');
                                  }
                                })()}
                              </span>
                            ) : (
                              <span className="text-white/40">
                                {language === 'tr' ? 'Bilinmiyor' : 'Unknown'}
                              </span>
                            )}
                          </span>
                        </>
                      )}
                    </p>
                    {profile.supportUrl && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSupportUrlClick(profile.supportUrl!, profile.name); }}
                        className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {language === 'tr' ? 'Destek' : 'Support'}
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => { e.stopPropagation(); handleRefreshProfile(profile); }}
                      disabled={refreshingId === profile.id}
                      className="h-8 w-8 text-white/40 hover:text-green-400"
                      title={language === 'tr' ? 'Şimdi Güncelle' : 'Refresh Now'}
                    >
                      <RefreshCw className={cn("w-4 h-4", refreshingId === profile.id && "animate-spin")} />
                    </Button>
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
