'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Home, Tv, Film, Video, Heart, Settings, Search, Menu, X, 
  Play, Radio, ChevronDown, Eye, EyeOff
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePlayerStore, useFilteredContent } from '@/store/usePlayerStore';
import { MasterPlayer } from '@/components/player/MasterPlayer';
import { VodPlayer } from '@/components/player/VodPlayer';
import { PlayerPreview } from '@/components/player/PlayerPreview';
import { LoadingBar } from '@/components/ui/LoadingBar';
import { EpgPopup } from '@/components/epg/EpgPopup';
import { ContentDetails } from '@/components/details/ContentDetails';
import { SeriesInfoPanel } from '@/components/details/SeriesInfoPanel';
import { HomeView } from '@/components/home/HomeView';
import { MobileHeader } from '@/components/layout/MobileHeader';
import { SettingsPanel } from '@/components/settings/SettingsPanel';
import { getShortEPG, convertEpgListings } from '@/lib/xtream-adapter';
import type { ContentType, ContentItem, Category, EpgProgram } from '@/types/iptv';

type NavItem = {
  id: string;
  label: string;
  icon: React.ReactNode;
  contentType?: ContentType;
  special?: 'favorites' | 'home';
};

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Ana Sayfa', icon: <Home className="w-5 h-5" />, special: 'home' },
  { id: 'live', label: 'Canlı TV', icon: <Tv className="w-5 h-5" />, contentType: 'live' },
  { id: 'movies', label: 'Filmler', icon: <Film className="w-5 h-5" />, contentType: 'movie' },
  { id: 'series', label: 'Diziler', icon: <Video className="w-5 h-5" />, contentType: 'series' },
  { id: 'favorites', label: 'Favoriler', icon: <Heart className="w-5 h-5" />, special: 'favorites' },
];

export default function DashboardPage() {
  const router = useRouter();
  const {
    activeProfile,
    categories,
    contentType,
    activeCategory,
    searchQuery,
    activeContent,
    favorites,
    sidebarOpen,
    epgData,
    isLoading,
    isPlaying,
    hiddenGroups,
    fetchGlobalEpg,
    setContentType,
    setActiveCategory,
    setSearchQuery,
    playContent,
    stopContent,
    toggleFavorite,
    toggleHiddenGroup,
    toggleSidebar,
    setEpgData,
    setSelectedProgram,
    setLoading,
  } = usePlayerStore();

  const filteredContent = useFilteredContent();
  const [activeNav, setActiveNav] = useState<string>('home');
  const profiles = usePlayerStore((s) => s.profiles);

  useEffect(() => {
    if (!activeProfile) {
      router.push('/login');
    }
  }, [activeProfile, router]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => cat.type === contentType);
  }, [categories, contentType]);

  const handleNavClick = (item: NavItem) => {
    // Stop any running player when navigating
    stopContent();
    
    setActiveNav(item.id);
    if (item.special === 'home') {
      // Stay on home, don't change content type
    } else if (item.special === 'favorites') {
      setActiveCategory('favorites');
    } else if (item.contentType) {
      setContentType(item.contentType);
      setActiveCategory(null);
    }
  };

  const handleHomeNavigate = (nav: string) => {
    const navItem = NAV_ITEMS.find(n => n.id === nav);
    if (navItem) {
      handleNavClick(navItem);
    } else if (nav === 'settings') {
      // Handle settings
    }
  };

  const handleCategoryClick = (category: Category | null) => {
    setActiveCategory(category?.id || null);
  };

  useEffect(() => {
    if (activeProfile?.credentials) {
      fetchGlobalEpg();
    }
  }, [activeProfile]);

  const handleContentClick = async (item: ContentItem) => {
    // For movies/series, don't auto-play (show preview)
    const autoPlay = item.type === 'live';
    playContent(item, autoPlay);

    // Fetch EPG for this channel
    if (activeProfile?.credentials && item.type === 'live') {
      const streamId = parseInt(item.id.split('_')[1] || '0');
      if (streamId && !epgData[item.id]) {
        setLoading(true, 'processing');
        try {
          const listings = await getShortEPG(activeProfile.credentials, streamId, 15);
          const programs = convertEpgListings(listings);
          setEpgData(item.id, programs);
        } catch (e) {
          console.error('EPG fetch failed:', e);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const handleProgramClick = (program: EpgProgram) => {
    setSelectedProgram(program);
  };

  // Get current EPG for active channel
  const currentEpg = activeContent ? epgData[activeContent.id] || [] : [];

  const formatTime = (date: Date) => date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const isCurrentProgram = (program: EpgProgram) => {
    const now = Date.now() / 1000;
    return now >= program.startTimestamp && now <= program.endTimestamp;
  };

  const getProgress = (program: EpgProgram) => {
    const now = Date.now() / 1000;
    return ((now - program.startTimestamp) / (program.endTimestamp - program.startTimestamp)) * 100;
  };

  if (!activeProfile) {
    return null;
  }

  // Sidebar content for reuse in both desktop sidebar and mobile drawer
  const SidebarContent = (
    <div className="flex flex-col h-full bg-[var(--iptv-surface-dark)]">
      {/* Logo - Only in mobile drawer, desktop has it inline */}
      <div className="p-4 border-b border-white/5 md:block">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-[var(--iptv-primary)] flex items-center justify-center shrink-0">
            <Tv className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold">IPTV Player</span>
        </div>
        
        {/* Service Selector */}
        {profiles.length > 1 && (
          <button 
            onClick={() => router.push('/login')}
            className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors min-h-[44px]"
          >
            <span className="text-sm text-white/80 truncate">{activeProfile?.name}</span>
            <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col py-4 px-2 min-h-0 overflow-hidden">
        <div className="flex flex-col gap-1 shrink-0">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all min-h-[44px] ${
                activeNav === item.id 
                  ? 'bg-[var(--iptv-primary)] text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Categories - Only this part scrolls, hide on home */}
        {activeNav !== 'home' && filteredCategories.length > 0 && (
          <div className="mt-6 flex-1 flex flex-col min-h-0">
            <h3 className="text-xs font-bold text-white/40 uppercase px-3 mb-2 shrink-0">Kategoriler</h3>
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="flex flex-col gap-1 pr-2">
                  <button
                    onClick={() => handleCategoryClick(null)}
                    className={`px-3 py-3 rounded-lg text-sm text-left min-h-[44px] ${!activeCategory ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                  >
                    Tümü
                  </button>
                  {filteredCategories.map((cat, index) => (
                    <div
                      key={`${cat.id}_${index}`}
                      className={`category-item flex items-center gap-2 px-3 py-3 rounded-lg text-sm min-h-[44px] overflow-hidden ${activeCategory === cat.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`}
                    >
                      <button
                        onClick={() => handleCategoryClick(cat)}
                        className="flex-1 text-left hover:text-white overflow-hidden"
                      >
                        <span className="category-text block">{cat.name}</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleHiddenGroup(cat.id); }}
                        className={`p-2 rounded hover:bg-white/10 min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 ${hiddenGroups.includes(cat.id) ? 'text-red-400' : 'text-white/30 hover:text-white/60'}`}
                        title={hiddenGroups.includes(cat.id) ? 'Grubu göster' : 'Grubu gizle'}
                      >
                        {hiddenGroups.includes(cat.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        )}
      </nav>

      {/* Settings */}
      <div className="p-3 border-t border-white/5">
        <button 
          onClick={() => setActiveNav('settings')}
          className={`flex items-center gap-3 px-3 py-3 rounded-lg w-full min-h-[44px] transition-all ${
            activeNav === 'settings'
              ? 'bg-[var(--iptv-primary)] text-white'
              : 'text-white/60 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Ayarlar</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-[var(--iptv-background)]">
      <LoadingBar />
      <EpgPopup />
      
      {/* Mobile Header with hamburger - Only visible on mobile */}
      <MobileHeader sidebarContent={SidebarContent} />
      
      {/* Desktop Sidebar - Hidden on mobile */}
      <aside className={`hidden md:flex ${sidebarOpen ? 'w-56' : 'w-16'} flex-shrink-0 flex-col bg-[var(--iptv-surface-dark)] border-r border-white/5 h-full transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[var(--iptv-primary)] flex items-center justify-center shrink-0">
              <Tv className="w-5 h-5 text-white" />
            </div>
            {sidebarOpen && <span className="text-white font-bold">IPTV Player</span>}
          </div>
          
          {/* Service Selector */}
          {sidebarOpen && profiles.length > 1 && (
            <button 
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
            >
              <span className="text-sm text-white/80 truncate">{activeProfile?.name}</span>
              <ChevronDown className="w-4 h-4 text-white/40 shrink-0" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col py-4 px-2 min-h-0 overflow-hidden">
          <div className="flex flex-col gap-1 shrink-0">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  activeNav === item.id 
                    ? 'bg-[var(--iptv-primary)] text-white' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </button>
            ))}
          </div>

          {/* Categories - Only this part scrolls, hide on home */}
          {sidebarOpen && activeNav !== 'home' && filteredCategories.length > 0 && (
            <div className="mt-6 flex-1 flex flex-col min-h-0">
              <h3 className="text-xs font-bold text-white/40 uppercase px-3 mb-2 shrink-0">Kategoriler</h3>
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="flex flex-col gap-1 pr-2">
                    <button
                      onClick={() => handleCategoryClick(null)}
                      className={`px-3 py-2 rounded-lg text-sm text-left ${!activeCategory ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                    >
                      Tümü
                    </button>
                    {filteredCategories.map((cat, index) => (
                      <div
                        key={`${cat.id}_${index}`}
                        className={`category-item flex items-center gap-2 px-3 py-2 rounded-lg text-sm overflow-hidden ${activeCategory === cat.id ? 'bg-white/10 text-white' : 'text-white/60 hover:bg-white/5'}`}
                      >
                        <button
                          onClick={() => handleCategoryClick(cat)}
                          className="flex-1 text-left hover:text-white overflow-hidden"
                        >
                          <span className="category-text block">{cat.name}</span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleHiddenGroup(cat.id); }}
                          className={`p-1 rounded hover:bg-white/10 shrink-0 ${hiddenGroups.includes(cat.id) ? 'text-red-400' : 'text-white/30 hover:text-white/60'}`}
                          title={hiddenGroups.includes(cat.id) ? 'Grubu göster' : 'Grubu gizle'}
                        >
                          {hiddenGroups.includes(cat.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </div>
          )}
        </nav>

        {/* Settings */}
        <div className="p-3 border-t border-white/5">
          <button 
            onClick={() => setActiveNav('settings')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg w-full transition-all ${
              activeNav === 'settings'
                ? 'bg-[var(--iptv-primary)] text-white'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Settings className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Ayarlar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area - Conditional based on activeNav */}
      {activeNav === 'home' ? (
        /* Home View - Full width, no ads */
        <div className="flex-1 overflow-auto">
          <HomeView onNavigate={handleHomeNavigate} />
        </div>
      ) : activeNav === 'settings' ? (
        /* Settings Panel - Full width */
        <div className="flex-1 overflow-auto">
          <SettingsPanel />
        </div>
      ) : (
        /* Mobile: flex-col (player on top, content below) | Desktop: flex-row */
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Mobile: Sticky Player at Top */}
          <div className="md:hidden sticky top-0 z-40 bg-black">
            <div className="aspect-video bg-black relative">
              {activeContent ? (
                activeContent.type === 'live' || isPlaying ? (
                  <MasterPlayer />
                ) : (
                  <PlayerPreview content={activeContent} />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-900">
                  <Tv className="w-12 h-12 text-white/20" />
                </div>
              )}
            </div>
          </div>
          
          {/* Channel List - Full width on mobile, fixed 320px on desktop */}
          <div className="w-full md:w-80 flex-1 md:flex-initial flex flex-col min-h-0 border-r border-white/5 bg-[var(--iptv-background)] overflow-hidden">
            {/* Search - Hidden on mobile (already in MobileHeader) */}
            <div className="hidden md:flex p-3 border-b border-white/5 items-center gap-2 shrink-0">
              <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-white/60 hover:text-white shrink-0 min-h-[44px] min-w-[44px]">
                <Menu className="w-5 h-5" />
              </Button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <Input
                  placeholder="Kanal ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-[var(--iptv-input-bg)] border-[var(--iptv-border)] text-white text-sm"
                />
              </div>
            </div>

            {/* Channel List - Scrollable */}
            <div className="flex-1 overflow-y-auto min-h-0">
              <div className="p-2 space-y-1">
                {filteredContent.length === 0 ? (
                  <div className="py-16 text-center">
                    {(contentType === 'movie' || contentType === 'series') && !activeCategory && !searchQuery ? (
                      <>
                        <Film className="w-10 h-10 text-white/20 mx-auto mb-2" />
                        <p className="text-white/50 text-sm">Kategori seçin</p>
                        <p className="text-white/30 text-xs mt-1">Menüden bir kategori seçerek içerikleri görüntüleyin</p>
                      </>
                    ) : (
                      <>
                        <Tv className="w-10 h-10 text-white/20 mx-auto mb-2" />
                        <p className="text-white/50 text-sm">İçerik bulunamadı</p>
                      </>
                    )}
                  </div>
                ) : (
                  filteredContent.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleContentClick(item)}
                      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all min-h-[56px] ${
                        activeContent?.id === item.id 
                          ? 'bg-[var(--iptv-primary)]/20 border border-[var(--iptv-primary)]/50' 
                          : 'hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                        {item.logo ? <img src={item.logo} alt="" className="w-8 h-8 object-contain" /> : <Radio className="w-5 h-5 text-white/50" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{item.name}</p>
                        <p className="text-white/40 text-xs truncate">{item.group}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }} 
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center ${favorites.includes(item.id) ? 'text-[var(--iptv-primary)]' : 'text-white/20 hover:text-white/50'}`}
                      >
                        <Heart className={`w-5 h-5 ${favorites.includes(item.id) ? 'fill-current' : ''}`} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="p-2 border-t border-white/5 text-center text-xs text-white/40">{filteredContent.length} kanal</div>
          </div>

          {/* Col 3: Player + EPG - Hidden on mobile (shown via sticky player above) */}
          <div className="hidden md:flex flex-1 flex-col">
            {/* Video Row: Player + Ad */}
            <div className="shrink-0 flex bg-black">
              {/* Video Player or Preview - 16:9 */}
              <div className="flex-1">
                <div className="aspect-video bg-black relative">
                  {activeContent ? (
                    activeContent.type === 'live' || isPlaying ? (
                      <MasterPlayer />
                    ) : (
                      <PlayerPreview content={activeContent} />
                    )
                  ) : null}
                </div>
              </div>
              {/* Ad Area - Hidden on smaller desktop */}
              <div className="hidden lg:flex w-[200px] bg-[var(--iptv-surface-dark)] border-l border-white/5 flex-col items-center justify-center p-4">
                <div className="w-full h-full border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-white/20 text-xs font-medium uppercase tracking-wider">Reklam Alanı</span>
                  <span className="text-white/10 text-[10px] mt-1">300x250</span>
                </div>
              </div>
            </div>

            {/* EPG - 2 Column Layout (Ad + EPG) */}
            <div className="flex-1 flex min-h-0 bg-[var(--iptv-surface-dark)] overflow-hidden">
              {/* Ad Area - Hidden on smaller screens */}
              <div className="hidden xl:flex w-[200px] border-r border-white/5 flex-col items-center justify-center p-4 shrink-0">
                <div className="w-full h-full border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-center">
                  <span className="text-white/20 text-xs font-medium uppercase tracking-wider">Reklam</span>
                  <span className="text-white/10 text-[10px] mt-1">160x600</span>
                </div>
              </div>

              {/* Channel Info + EPG List */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {activeContent ? (
                  <>
                    {activeContent.type === 'live' ? (
                      <>
                        {/* Channel Logo + Name + EPG Label */}
                        <div className="p-3 border-b border-white/5 flex items-center gap-3 shrink-0">
                          {activeContent.logo && <img src={activeContent.logo} alt="" className="w-10 h-10 object-contain rounded-lg bg-white/10 p-0.5" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-white font-semibold truncate">{activeContent.name}</p>
                              <span className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded">EPG</span>
                            </div>
                            <p className="text-white/50 text-xs">{activeContent.group}</p>
                          </div>
                          <span className="text-[10px] text-white/30">{new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                          <Button variant="ghost" size="icon" onClick={stopContent} className="text-white/60 hover:text-white h-10 w-10">
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* EPG List - Compact & Scrollable */}
                        <ScrollArea className="flex-1 overflow-hidden">
                          <div className="p-2 space-y-1.5">
                            {currentEpg.length > 0 ? (
                              currentEpg.map((program, idx) => (
                                <div 
                                  key={`${program.id}_${idx}`}
                                  onClick={() => handleProgramClick(program)}
                                  className={`rounded-lg p-2.5 cursor-pointer transition-colors ${
                                    isCurrentProgram(program)
                                      ? 'bg-[var(--iptv-primary)]/15 border border-[var(--iptv-primary)]/20'
                                      : 'bg-[var(--iptv-surface)] hover:bg-white/5'
                                  }`}
                                >
                                  <div className="flex items-center justify-between mb-1">
                                    <span className={`text-[10px] font-bold ${
                                      isCurrentProgram(program) ? 'text-[var(--iptv-primary)]' : 'text-white/40'
                                    }`}>
                                      {isCurrentProgram(program) ? 'ŞU AN' : 'SONRAKİ'}
                                    </span>
                                    <span className="text-[10px] text-white/50">
                                      {formatTime(program.start)} - {formatTime(program.end)}
                                    </span>
                                  </div>
                                  <p className="text-white text-sm font-medium truncate">{program.title}</p>
                                  {isCurrentProgram(program) && (
                                    <div className="mt-2 h-1 bg-black/30 rounded-full">
                                      <div 
                                        className="h-full bg-[var(--iptv-primary)] rounded-full transition-all" 
                                        style={{ width: `${Math.min(getProgress(program), 100)}%` }}
                                      />
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8">
                                <p className="text-white/40 text-xs">EPG bilgisi yükleniyor...</p>
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </>
                    ) : activeContent.type === 'series' && isPlaying ? (
                      <SeriesInfoPanel content={activeContent} />
                    ) : (
                      <div className={`h-full ${isPlaying ? 'bg-[var(--iptv-surface-dark)]' : 'p-4'}`}>
                        {isPlaying ? (
                          <div className="h-full overflow-y-auto">
                            <ContentDetails content={activeContent} variant="compact" />
                          </div>
                        ) : (
                          <div className="h-full w-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-xl bg-[var(--iptv-surface-dark)] text-center p-6">
                            <span className="text-white/20 text-sm font-medium uppercase tracking-wider mb-2">Sponsor Alanı</span>
                            <span className="text-white/10 text-xs">Bu alana reklam veya banner gelebilir</span>
                            <div className="mt-4 px-4 py-2 bg-white/5 rounded text-white/40 text-xs">
                              728x90 / Responsive Ads
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div>
                      <Tv className="w-16 h-16 text-white/20 mx-auto mb-4" />
                      <p className="text-white/60">Bir kanal seçin</p>
                      <p className="text-white/40 text-sm mt-1">Listeden izlemek istediğiniz kanalı seçin</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

