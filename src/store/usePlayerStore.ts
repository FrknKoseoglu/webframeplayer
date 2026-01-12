import { create } from 'zustand';
import { persist, createJSONStorage, StateStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { useMemo } from 'react';
import { fetchFullEpg } from '@/lib/xtream-adapter';
import type { Profile, ContentItem, Category, ContentType, LoadingStep, EpgProgram, SearchIndexItem, Episode } from '@/types/iptv';
import type { Language } from '@/lib/i18n';

// IndexedDB Storage Adapter
const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

// History item type
export interface HistoryItem {
  content: ContentItem;
  watchedAt: number;
}

// Store state interface
interface PlayerState {
  // Profile management
  profiles: Profile[];
  activeProfile: Profile | null;
  
  // Content data
  categories: Category[];
  content: ContentItem[];
  searchIndex: SearchIndexItem[];
  
  // UI state
  favorites: string[];
  hiddenGroups: string[];
  activeCategory: string | null;
  contentType: ContentType;
  searchQuery: string;
  sidebarOpen: boolean;
  
  // Loading state
  isLoading: boolean;
  loadingStep: LoadingStep;
  loadingProgress: number;
  
  // Player state
  activeContent: ContentItem | null;
  isPlaying: boolean;
  playbackError: boolean; // True when VOD playback fails
  
  // History state (per profile)
  historyByProfile: Record<string, HistoryItem[]>;
  
  // EPG state
  epgData: Record<string, EpgProgram[]>;
  lastEpgSync: number;
  selectedProgram: EpgProgram | null;
  
  // Language
  language: Language;
  
  // Buffer settings
  bufferMode: 'instant' | 'low' | 'medium' | 'high';
  
  // Cache settings (in hours)
  cacheExpiry: 4 | 24 | 72 | 168; // 4h, 1d, 3d, 7d
  
  // Volume (0-1)
  volume: number;
  
  // Subtitle preferences
  preferredSubtitle1: string;
  preferredSubtitle2: string;
  subtitlesEnabled: boolean;
  
  // Audio preferences
  preferredAudio1: string;
  preferredAudio2: string;
}

// Store actions interface
interface PlayerActions {
  // Profile actions
  addProfile: (profile: Profile) => void;
  removeProfile: (id: string) => void;
  switchProfile: (id: string) => void;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  
  // Content actions
  setCategories: (categories: Category[]) => void;
  setContent: (content: ContentItem[]) => void;
  appendContent: (content: ContentItem[]) => void;
  clearContent: () => void;
  
  // UI actions
  toggleFavorite: (id: string) => void;
  toggleHiddenGroup: (groupId: string) => void;
  setActiveCategory: (id: string | null) => void;
  setContentType: (type: ContentType) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  
  // Loading actions
  setLoading: (isLoading: boolean, step?: LoadingStep, progress?: number) => void;
  
  // Player actions
  playContent: (content: ContentItem, autoPlay?: boolean) => void;
  playEpisode: (series: ContentItem, episode: Episode) => void;
  startPlayback: () => void;
  stopContent: () => void;
  setPlaybackError: () => void;
  clearPlaybackError: () => void;
  
  // EPG actions
  setEpgData: (channelId: string, programs: EpgProgram[]) => void;
  fetchGlobalEpg: () => Promise<void>;
  setSelectedProgram: (program: EpgProgram | null) => void;
  
  // Settings actions
  setLanguage: (language: Language) => void;
  setBufferMode: (mode: 'instant' | 'low' | 'medium' | 'high') => void;
  setCacheExpiry: (expiry: 4 | 24 | 72 | 168) => void;
  setVolume: (volume: number) => void;
  setSubtitlePreferences: (subtitle1: string, subtitle2: string, enabled: boolean) => void;
  setAudioPreferences: (audio1: string, audio2: string) => void;
  
  // History actions
  addToHistory: (content: ContentItem) => void;
  clearHistory: () => void;
  
  // Reset
  reset: () => void;
}

type PlayerStore = PlayerState & PlayerActions;

const initialState: PlayerState = {
  profiles: [],
  activeProfile: null,
  categories: [],
  content: [],
  searchIndex: [],
  favorites: [],
  hiddenGroups: [],
  activeCategory: null,
  contentType: 'live',
  searchQuery: '',
  sidebarOpen: true,
  isLoading: false,
  loadingStep: 'idle',
  loadingProgress: 0,
  activeContent: null,
  isPlaying: false,
  playbackError: false,
  historyByProfile: {},
  epgData: {},
  lastEpgSync: 0,
  selectedProgram: null,
  language: 'tr',
  bufferMode: 'low',
  cacheExpiry: 24, // 1 day default
  volume: 1, // Full volume default
  preferredSubtitle1: 'tr',
  preferredSubtitle2: 'en',
  subtitlesEnabled: true,
  preferredAudio1: 'en',
  preferredAudio2: 'tr',
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Profile actions
      addProfile: (profile) => {
        set((state) => ({
          profiles: [...state.profiles, profile],
        }));
      },

      removeProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfile: state.activeProfile?.id === id ? null : state.activeProfile,
        }));
      },

      switchProfile: (id) => {
        const profile = get().profiles.find((p) => p.id === id);
        if (profile) {
          set((state) => ({
            profiles: state.profiles.map((p) => ({
              ...p,
              active: p.id === id,
            })),
            activeProfile: profile,
            // Clear content when switching profiles
            categories: [],
            content: [],
            activeCategory: null,
          }));
        }
      },

      updateProfile: (id, updates) => {
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          activeProfile:
            state.activeProfile?.id === id
              ? { ...state.activeProfile, ...updates }
              : state.activeProfile,
        }));
      },

      // Content actions
      setCategories: (categories) => set({ categories }),
      
      setContent: (content) => {
        // Generate search index linearly
        const searchIndex = content.map(item => ({
          id: item.id,
          n: item.name,
          g: item.group,
          t: item.type,
          s: (item.name + ' ' + item.group).toLowerCase()
        }));
        
        set({ content, searchIndex });
      },
      
      appendContent: (newContent) => {
        set((state) => {
          const newIndex = newContent.map(item => ({
            id: item.id,
            n: item.name,
            g: item.group,
            t: item.type,
            s: (item.name + ' ' + item.group).toLowerCase()
          }));
          
          return {
            content: [...state.content, ...newContent],
            searchIndex: [...state.searchIndex, ...newIndex]
          };
        });
      },
      
      clearContent: () => set({ content: [], categories: [], searchIndex: [], epgData: {} }),

      // UI actions
      toggleFavorite: (id) => {
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        }));
      },

      toggleHiddenGroup: (groupId) => {
        set((state) => ({
          hiddenGroups: state.hiddenGroups.includes(groupId)
            ? state.hiddenGroups.filter((g) => g !== groupId)
            : [...state.hiddenGroups, groupId],
        }));
      },

      setActiveCategory: (id) => set({ activeCategory: id }),
      
      setContentType: (type) => set({ contentType: type, activeCategory: null }),
      
      setSearchQuery: (query) => set({ searchQuery: query }),
      
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Loading actions
      setLoading: (isLoading, step, progress) => {
        set((state) => ({
          isLoading,
          loadingStep: step || state.loadingStep,
          loadingProgress: progress || state.loadingProgress,
        }));
      },
      
      // Player actions
      playContent: (content, autoPlay = true) => {
        // Add to history
        get().addToHistory(content);
        
        set({ 
          activeContent: content,
          isPlaying: autoPlay,
        });
      },

      playEpisode: (series, episode) => {
        set({
          activeContent: {
            ...series,
            id: `${series.id}_ep_${episode.id}`,
            name: `${series.name} - S${episode.seasonNum}E${episode.episodeNum} - ${episode.title}`,
            url: episode.url,
            seasonNumber: episode.seasonNum,
            episodeNumber: episode.episodeNum,
          },
          isPlaying: true,
        });
      },

      startPlayback: () => set({ isPlaying: true, playbackError: false }),
      
      // Called when VOD playback fails - goes back to preview with error state
      setPlaybackError: () => set({ isPlaying: false, playbackError: true }),
      
      // Clear playback error
      clearPlaybackError: () => set({ playbackError: false }),
      
      stopContent: () => {
        set({ 
          activeContent: null, 
          isPlaying: false,
          activeCategory: null 
        });
      },
      
      // EPG actions
      setEpgData: (channelId, programs) => {
        set((state) => ({
          epgData: { ...state.epgData, [channelId]: programs },
        }));
      },

      fetchGlobalEpg: async () => {
        const { activeProfile, lastEpgSync } = get();
        if (!activeProfile?.credentials) return;

        // Cache for 1 hour
        const now = Date.now();
        if (now - lastEpgSync < 3600000) return; 

        get().setLoading(true, 'processing');
        try {
          const programs = await fetchFullEpg(activeProfile.credentials);
          set((state) => ({
            epgData: programs, // Replace or merge? Replace is safer for memory if we want to clear old stuff
            lastEpgSync: now,
            loadingStep: 'complete', // ensure we don't get stuck
          }));
        } catch (e) {
          console.error('Global EPG fetch failed', e);
        } finally {
          get().setLoading(false);
        }
      },

      setSelectedProgram: (program) => {
        set({ selectedProgram: program });
      },
      
      // Language
      setLanguage: (lang) => {
        set({ language: lang });
      },
      
      // Buffer
      setBufferMode: (mode) => {
        set({ bufferMode: mode });
      },
      
      // Cache
      setCacheExpiry: (hours) => {
        set({ cacheExpiry: hours });
      },
      
      // Volume
      setVolume: (volume) => {
        set({ volume: Math.max(0, Math.min(1, volume)) });
      },
      
      // Subtitle preferences
      setSubtitlePreferences: (sub1, sub2, enabled) => {
        set({ 
          preferredSubtitle1: sub1, 
          preferredSubtitle2: sub2, 
          subtitlesEnabled: enabled 
        });
      },
      
      // Audio preferences
      setAudioPreferences: (audio1, audio2) => {
        set({ 
          preferredAudio1: audio1, 
          preferredAudio2: audio2 
        });
      },
      
      // History actions
      addToHistory: (content) => {
        const profileId = get().activeProfile?.id;
        if (!profileId) return;
        
        set((state) => {
          const currentHistory = state.historyByProfile[profileId] || [];
          // Remove duplicate if exists
          const filtered = currentHistory.filter((h) => h.content.id !== content.id);
          // Add to beginning and limit to 15 items
          const newHistory = [{ content, watchedAt: Date.now() }, ...filtered].slice(0, 15);
          return { 
            historyByProfile: {
              ...state.historyByProfile,
              [profileId]: newHistory
            }
          };
        });
      },
      
      clearHistory: () => {
        const profileId = get().activeProfile?.id;
        if (!profileId) return;
        
        set((state) => ({
          historyByProfile: {
            ...state.historyByProfile,
            [profileId]: []
          }
        }));
      },
      
      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'iptv-player-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        profiles: state.profiles,
        favorites: state.favorites,
        activeProfile: state.activeProfile,
        // Now we persist content and categories too
        content: state.content,
        categories: state.categories,
        searchIndex: state.searchIndex,
        language: state.language,
        bufferMode: state.bufferMode,
        cacheExpiry: state.cacheExpiry,
        volume: state.volume,
        preferredSubtitle1: state.preferredSubtitle1,
        preferredSubtitle2: state.preferredSubtitle2,
        subtitlesEnabled: state.subtitlesEnabled,
        preferredAudio1: state.preferredAudio1,
        preferredAudio2: state.preferredAudio2,
        historyByProfile: state.historyByProfile,
      }),
    }
  )
);

// Selector hooks for performance
export const useProfiles = () => usePlayerStore((state) => state.profiles);
export const useActiveProfile = () => usePlayerStore((state) => state.activeProfile);
export const useContent = () => usePlayerStore((state) => state.content);
export const useCategories = () => usePlayerStore((state) => state.categories);
export const useFavorites = () => usePlayerStore((state) => state.favorites);
export const useActiveContent = () => usePlayerStore((state) => state.activeContent);
export const useIsLoading = () => usePlayerStore((state) => state.isLoading);

export const useHistory = () => {
  const historyByProfile = usePlayerStore((state) => state.historyByProfile);
  const activeProfile = usePlayerStore((state) => state.activeProfile);
  
  return useMemo(() => {
    const profileId = activeProfile?.id;
    return profileId ? (historyByProfile[profileId] || []) : [];
  }, [historyByProfile, activeProfile]);
};

// Filtered content selector with performance optimization
const CONTENT_LIMIT = 100; // Max items to render at once

export const useFilteredContent = () => {
  const content = usePlayerStore((state) => state.content);
  const searchIndex = usePlayerStore((state) => state.searchIndex);
  const searchQuery = usePlayerStore((state) => state.searchQuery);
  const activeCategory = usePlayerStore((state) => state.activeCategory);
  const contentType = usePlayerStore((state) => state.contentType);
  const favorites = usePlayerStore((state) => state.favorites);
  const hiddenGroups = usePlayerStore((state) => state.hiddenGroups);

  return useMemo(() => {
    // 1. If searching, use the lightweight search index
    if (searchQuery && searchQuery.length > 2) {
      const query = searchQuery.toLowerCase();
      // Find matching IDs from index
      const matches = searchIndex
        .filter(item => 
          item.t === contentType && 
          item.s.includes(query) &&
          !hiddenGroups.includes(content.find(c => c.id === item.id)?.groupId || '')
        )
        .slice(0, CONTENT_LIMIT)
        .map(item => item.id);
      
      // Map back to content objects
      // Note: This is O(N*M) worst case but matches are usually small. 
      // For better perf we could make content a Map, but array is needed for virtualization
      return content.filter(item => matches.includes(item.id));
    }

    // 2. Normal filtering (category based)
    
    // For movies/series, require category selection
    if ((contentType === 'movie' || contentType === 'series') && 
        !activeCategory && activeCategory !== 'favorites') {
      return [];
    }

    const filtered = content.filter((item) => {
      // Filter by content type
      if (item.type !== contentType) return false;

      // Filter hidden groups
      if (item.groupId && hiddenGroups.includes(item.groupId)) return false;

      // Filter by category
      if (activeCategory && activeCategory !== 'favorites' && item.groupId !== activeCategory) {
        return false;
      }

      // Filter favorites
      if (activeCategory === 'favorites' && !favorites.includes(item.id)) {
        return false;
      }

      return true;
    });

    // Limit rendered items for performance
    return filtered.slice(0, CONTENT_LIMIT);
  }, [content, searchIndex, searchQuery, activeCategory, contentType, favorites, hiddenGroups]);
};
