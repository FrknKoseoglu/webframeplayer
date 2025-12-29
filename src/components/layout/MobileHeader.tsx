'use client';

import { useState } from 'react';
import { Menu, Search, X, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { usePlayerStore } from '@/store/usePlayerStore';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  sidebarContent: (closeSidebar: () => void) => React.ReactNode;
}

export function MobileHeader({ sidebarContent }: MobileHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { searchQuery, setSearchQuery } = usePlayerStore();

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Mobile Header Bar - Only visible on mobile */}
      <header className="md:hidden sticky top-0 z-50 safe-area-top bg-[var(--iptv-surface-dark)] border-b border-white/5">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Left: Hamburger Menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="text-white/80 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px]"
          >
            <Menu className="w-6 h-6" />
          </Button>

          {/* Center: Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[var(--iptv-primary)] flex items-center justify-center">
              <Tv className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">IPTV Player</span>
          </div>

          {/* Right: Search Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSearchOpen(!searchOpen)}
            className="text-white/80 hover:text-white hover:bg-white/10 min-h-[44px] min-w-[44px]"
          >
            {searchOpen ? <X className="w-6 h-6" /> : <Search className="w-6 h-6" />}
          </Button>
        </div>

        {/* Expandable Search Bar */}
        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            searchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
          )}
        >
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <Input
                placeholder="Kanal ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-[var(--iptv-input-bg)] border-[var(--iptv-border)] text-white"
                autoFocus={searchOpen}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-[var(--iptv-surface-dark)] border-[var(--iptv-border)]">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          {sidebarContent(closeSidebar)}
        </SheetContent>
      </Sheet>
    </>
  );
}
