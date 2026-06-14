'use client';

import { useState } from 'react';
import { Menu, Tv } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface MobileHeaderProps {
  sidebarContent: (closeSidebar: () => void) => React.ReactNode;
}

export function MobileHeader({ sidebarContent }: MobileHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <>
      {/* Mobile Header Bar - Only visible on mobile */}
      <header className="md:hidden sticky top-0 z-50 safe-area-top bg-[var(--frame-surface-dark)] border-b border-white/5">
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
            <div className="w-8 h-8 rounded-full bg-[var(--frame-primary)] flex items-center justify-center">
              <Tv className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold tracking-[0.2em] text-lg">FRAME</span>
          </div>

          {/* Right: Empty space for symmetry */}
          <div className="w-10"></div>
        </div>
      </header>

      {/* Mobile Sidebar Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0 bg-[var(--frame-surface-dark)] border-[var(--frame-border)]">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation Menu</SheetTitle>
          </SheetHeader>
          {sidebarContent(closeSidebar)}
        </SheetContent>
      </Sheet>
    </>
  );
}
