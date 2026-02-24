'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Tv, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
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
import type { Profile, LoadingStep } from '@/types/iptv';
import { LOADING_MESSAGES } from '@/types/iptv';

type LoginTab = 'xtream' | 'm3u' | 'magic';

interface LoginScreenProps {
  onBack?: () => void;
  editProfile?: Profile;
}

export function LoginScreen({ onBack, editProfile }: LoginScreenProps) {
  const router = useRouter();
  const { addProfile, updateProfile, switchProfile, setCategories, setContent, setLoading } = usePlayerStore();
  
  const isEditMode = !!editProfile;
  const [activeTab, setActiveTab] = useState<LoginTab>(editProfile?.type === 'm3u' ? 'm3u' : 'xtream');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('idle');
  const [error, setError] = useState<string | null>(null);

  // Xtream form state
  const [serviceName, setServiceName] = useState('');
  const [xtreamUrl, setXtreamUrl] = useState('');
  const [xtreamUsername, setXtreamUsername] = useState('');
  const [xtreamPassword, setXtreamPassword] = useState('');

  // M3U form state
  const [m3uUrl, setM3uUrl] = useState('');
  const [m3uName, setM3uName] = useState('');

  // Magic link form state
  const [magicUrl, setMagicUrl] = useState('');

  const handleMagicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!magicUrl) return;

    try {
      let dParam: string | null = null;
      try {
        const url = new URL(magicUrl);
        dParam = url.searchParams.get('d');
      } catch {
        setError('Geçersiz bir URL girdiniz.');
        return;
      }

      if (!dParam) {
        setError('Bu URL sihirli bir bağlantı (' + magicUrl + ') değil.');
        return;
      }

      const decoded = JSON.parse(atob(dParam));
      
      if (decoded.importUrl) {
         setM3uUrl(decoded.importUrl);
         setM3uName(decodeURIComponent(decoded.serviceName || ''));
         setActiveTab('m3u');
         // Use setTimeout to ensure state updates before triggering login
         setTimeout(() => {
           const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
           handleM3ULogin(fakeEvent);
         }, 0);
      } else if (decoded.importXtream) {
         setXtreamUrl(decoded.host || '');
         setXtreamUsername(decoded.user || '');
         setXtreamPassword(decoded.password || '');
         setServiceName(decodeURIComponent(decoded.serviceName || ''));
         setActiveTab('xtream');
         // Use setTimeout to ensure state updates before triggering login
         setTimeout(() => {
           const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
           handleXtreamLogin(fakeEvent);
         }, 0);
      } else {
         setError('Sihirli bağlantı bilgileri okunamadı.');
      }
    } catch (err) {
      setError('Bağlantı ayrıştırılamadı. Geçerli bir Sihirli Bağlantı (Magic Link) olduğundan emin olun.');
    }
  };

  // Pre-fill form when editing
  useEffect(() => {
    if (editProfile) {
      if (editProfile.type === 'xtream' && editProfile.credentials) {
        setServiceName(editProfile.name);
        setXtreamUrl(editProfile.credentials.url);
        setXtreamUsername(editProfile.credentials.username);
        setXtreamPassword(editProfile.credentials.password);
        setActiveTab('xtream');
      } else if (editProfile.type === 'm3u' && editProfile.m3uUrl) {
        setM3uName(editProfile.name);
        setM3uUrl(editProfile.m3uUrl);
        setActiveTab('m3u');
      }
    }
  }, [editProfile]);

  const updateStep = (step: LoadingStep) => {
    setLoadingStep(step);
    setLoading(true, step);
  };

  const handleXtreamLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const credentials = {
        url: xtreamUrl,
        username: xtreamUsername,
        password: xtreamPassword,
      };

      // Step 1: Authenticate
      updateStep('authenticating');
      const authResponse = await authenticateXtream(credentials);

      if (!authResponse.user_info || authResponse.user_info.auth === 0) {
        throw new Error('Kimlik doğrulama başarısız');
      }

      // Step 2: Get all categories
      updateStep('fetching_categories');
      const [liveCategories, vodCategories, seriesCategories] = await Promise.all([
        getLiveCategories(credentials),
        getVodCategories(credentials),
        getSeriesCategories(credentials),
      ]);

      // Step 3: Get live streams
      updateStep('fetching_live');
      const liveStreams = await getLiveStreams(credentials);

      // Step 4: Get movies
      updateStep('fetching_movies');
      const vodStreams = await getVodStreams(credentials);

      // Step 5: Get series
      updateStep('fetching_series');
      const seriesList = await getSeries(credentials);

      // Step 6: Process all data
      updateStep('processing');
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

      // Create or update profile
      if (isEditMode && editProfile) {
        // Update existing profile
        updateProfile(editProfile.id, {
          name: serviceName || authResponse.user_info.username || 'Xtream Hizmet',
          credentials: {
            ...credentials,
            exp_date: authResponse.user_info.exp_date,
          },
          lastRefresh: Date.now(),
        });
        switchProfile(editProfile.id);
      } else {
        // Create new profile
        const profile: Profile = {
          id: crypto.randomUUID(),
          name: serviceName || authResponse.user_info.username || 'Xtream Hizmet',
          type: 'xtream',
          credentials: {
            ...credentials,
            exp_date: authResponse.user_info.exp_date,
          },
          active: true,
          createdAt: Date.now(),
          lastRefresh: Date.now(),
        };
        addProfile(profile);
        switchProfile(profile.id);
      }
      
      setCategories(categories);
      setContent(content);

      updateStep('complete');
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
      updateStep('error');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  const handleM3ULogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      updateStep('processing');
      
      const { content, categories } = await processM3UPlaylist(m3uUrl);

      // Create or update profile
      if (isEditMode && editProfile) {
        // Update existing profile
        updateProfile(editProfile.id, {
          name: m3uName || 'M3U Playlist',
          m3uUrl,
        });
        switchProfile(editProfile.id);
      } else {
        // Create new profile
        const profile: Profile = {
          id: crypto.randomUUID(),
          name: m3uName || 'M3U Playlist',
          type: 'm3u',
          m3uUrl,
          active: true,
          createdAt: Date.now(),
        };
        addProfile(profile);
        switchProfile(profile.id);
      }
      
      setCategories(categories);
      setContent(content);

      updateStep('complete');
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 500);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Playlist yüklenemedi');
      updateStep('error');
    } finally {
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--iptv-background)] text-white flex flex-col overflow-hidden relative selection:bg-[var(--iptv-primary)] selection:text-white">
      {/* Ambient Background Effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--iptv-primary)]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[var(--iptv-primary)]/5 blur-[100px] rounded-full" />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-[440px] flex flex-col gap-8 animate-fade-in-up">
          {/* Logo / Header */}
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 bg-[var(--iptv-primary)] rounded-2xl flex items-center justify-center shadow-glow mb-2">
              <Tv className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              {isEditMode ? 'Hizmeti Düzenle' : onBack ? 'Yeni Hizmet Ekle' : 'Frame Player'}
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              {isEditMode ? 'Hizmet bilgilerini güncelleyin' : onBack ? 'Yeni bir IPTV hizmeti ekleyin' : 'Hesabınıza giriş yaparak yayınların keyfini çıkarın'}
            </p>
            {onBack && (
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-white/60 hover:text-white mt-2"
              >
                ← Geri Dön
              </Button>
            )}
          </div>

          {/* Login Card */}
          <div className="bg-[var(--iptv-surface)]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6">
            {/* Tabs */}
            <div className="flex gap-2 bg-[var(--iptv-input-bg)] p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('xtream')}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'xtream'
                    ? 'bg-[var(--iptv-primary)] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Xtream Codes
              </button>
              <button
                onClick={() => setActiveTab('m3u')}
                className={`flex-1 py-2.5 px-2 sm:px-4 rounded-lg text-sm font-semibold transition-all ${
                  activeTab === 'm3u'
                    ? 'bg-[var(--iptv-primary)] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                M3U Playlist
              </button>
              <button
                onClick={() => setActiveTab('magic')}
                className={`flex-1 py-2.5 px-2 sm:px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                  activeTab === 'magic'
                    ? 'bg-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Magic Link
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Loading Progress */}
            {isLoading && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3 text-sm text-gray-300">
                  <Loader2 className="w-4 h-4 animate-spin text-[var(--iptv-primary)]" />
                  <span>{LOADING_MESSAGES[loadingStep]}</span>
                </div>
                <div className="h-1 bg-[var(--iptv-input-bg)] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[var(--iptv-primary)] transition-all duration-300"
                    style={{ 
                      width: loadingStep === 'authenticating' ? '15%' 
                           : loadingStep === 'fetching_categories' ? '30%'
                           : loadingStep === 'fetching_live' ? '50%'
                           : loadingStep === 'fetching_movies' ? '65%'
                           : loadingStep === 'fetching_series' ? '80%'
                           : loadingStep === 'processing' ? '95%'
                           : loadingStep === 'complete' ? '100%'
                           : '0%'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Xtream Form */}
            {activeTab === 'xtream' && (
              <form onSubmit={handleXtreamLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Hizmet Adı
                  </label>
                  <Input
                    type="text"
                    placeholder="Evdeki IPTV, Ofis TV..."
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    disabled={isLoading}
                    className="bg-[var(--iptv-input-bg)] border-[var(--iptv-border)] text-white placeholder:text-gray-600 focus:border-[var(--iptv-primary)] focus-visible:ring-[var(--iptv-primary)]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Sunucu URL
                  </label>
                  <Input
                    type="url"
                    placeholder="http://example.com:8080"
                    value={xtreamUrl}
                    onChange={(e) => setXtreamUrl(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-[var(--iptv-input-bg)] border-[var(--iptv-border)] text-white placeholder:text-gray-600 focus:border-[var(--iptv-primary)] focus-visible:ring-[var(--iptv-primary)]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Kullanıcı Adı
                  </label>
                  <Input
                    type="text"
                    placeholder="kullaniciadi"
                    value={xtreamUsername}
                    onChange={(e) => setXtreamUsername(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-[var(--iptv-input-bg)] border-[var(--iptv-border)] text-white placeholder:text-gray-600 focus:border-[var(--iptv-primary)] focus-visible:ring-[var(--iptv-primary)]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Şifre
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={xtreamPassword}
                      onChange={(e) => setXtreamPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-[var(--iptv-input-bg)] border-[var(--iptv-border)] text-white placeholder:text-gray-600 focus:border-[var(--iptv-primary)] focus-visible:ring-[var(--iptv-primary)] pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white font-bold text-lg py-6 rounded-xl shadow-lg shadow-[var(--iptv-primary)]/20 mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{isEditMode ? 'Güncelle' : 'Giriş Yap'}</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* M3U Form */}
            {activeTab === 'm3u' && (
              <form onSubmit={handleM3ULogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Liste Adı
                  </label>
                  <Input
                    type="text"
                    placeholder="Örn: Ev Listesi"
                    value={m3uName}
                    onChange={(e) => setM3uName(e.target.value)}
                    disabled={isLoading}
                    className="bg-[var(--iptv-input-bg)] border-[var(--iptv-border)] text-white placeholder:text-gray-600 focus:border-[var(--iptv-primary)] focus-visible:ring-[var(--iptv-primary)]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Playlist URL (M3U)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com/playlist.m3u"
                    value={m3uUrl}
                    onChange={(e) => setM3uUrl(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-[var(--iptv-input-bg)] border-[var(--iptv-border)] text-white placeholder:text-gray-600 focus:border-[var(--iptv-primary)] focus-visible:ring-[var(--iptv-primary)]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white font-bold text-lg py-6 rounded-xl shadow-lg shadow-[var(--iptv-primary)]/20 mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>{isEditMode ? 'Güncelle' : 'Listeyi Yükle'}</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Magic Link Form */}
            {activeTab === 'magic' && (
              <form onSubmit={handleMagicLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-300 ml-1">
                    Sihirli Bağlantı (Magic Link)
                  </label>
                  <Input
                    type="url"
                    placeholder="https://.../?d=..."
                    value={magicUrl}
                    onChange={(e) => setMagicUrl(e.target.value)}
                    required
                    disabled={isLoading}
                    className="bg-[var(--iptv-input-bg)] border-[var(--iptv-border)] text-white placeholder:text-gray-600 focus:border-[var(--iptv-primary)] focus-visible:ring-[var(--iptv-primary)]"
                  />
                  <p className="text-xs text-gray-400 ml-1">
                    Kopyaladığınız sihirli bağlantıyı buraya yapıştırıp bilgileri otomatik doldurabilirsiniz.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-lg py-6 rounded-xl shadow-lg shadow-purple-600/20 mt-2"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Bilgileri Aktar</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Version */}
          <div className="text-center mt-auto">
            <p className="text-xs text-gray-600 font-mono">v1.0.0</p>
          </div>
        </div>
      </main>
    </div>
  );
}
