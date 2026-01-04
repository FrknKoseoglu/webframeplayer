'use client';

import { useState } from 'react';
import { Tv, Film, Video, Heart, Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';
import type { ContentType } from '@/types/iptv';

interface MobileBottomNavProps {
  activeNav: string;
  onNavClick: (navId: string, contentType?: ContentType) => void;
}

const NAV_ITEMS = [
  { id: 'live', icon: Tv, contentType: 'live' as ContentType },
  { id: 'movies', icon: Film, contentType: 'movie' as ContentType },
  { id: 'series', icon: Video, contentType: 'series' as ContentType },
  { id: 'favorites', icon: Heart, special: 'favorites' },
];

export function MobileBottomNav({ activeNav, onNavClick }: MobileBottomNavProps) {
  const { searchQuery, setSearchQuery } = usePlayerStore();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="md:hidden sticky top-0 z-30 bg-[var(--iptv-surface-dark)] border-b border-white/10">
      <div className="flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNav === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onNavClick(item.id, item.contentType)}
              className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all ${
                isActive
                  ? 'bg-[var(--iptv-primary)] text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-6 h-6" />
            </button>
          );
        })}
        
        {/* Search Button */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className={`flex items-center justify-center w-14 h-14 rounded-xl transition-all ${
            searchOpen
              ? 'bg-[var(--iptv-primary)] text-white'
              : 'text-white/50 hover:text-white hover:bg-white/5'
          }`}
        >
          {searchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Expandable Search Input */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          searchOpen ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-4 pb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="İçerik ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
              autoFocus={searchOpen}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4 text-white/40" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
