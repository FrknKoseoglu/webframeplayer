'use client';

import { usePlayerStore, Channel } from '@/store/usePlayerStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Search, Menu, Radio, X } from 'lucide-react';
import { cn } from '@/lib/utils';

function ChannelList() {
  const { playlist, activeChannel, searchQuery, playChannel, setSearchQuery } = usePlayerStore();

  const filteredChannels = playlist.filter((channel) =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">IPTV Player</span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800/50 border-zinc-700 text-white placeholder:text-zinc-500 focus-visible:ring-purple-600"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-zinc-400 hover:text-white"
              onClick={() => setSearchQuery('')}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Channel List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredChannels.length === 0 ? (
            <div className="p-4 text-center text-zinc-500">
              {searchQuery ? 'No channels found' : 'No channels loaded'}
            </div>
          ) : (
            filteredChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeChannel?.id === channel.id}
                onClick={() => playChannel(channel)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          {filteredChannels.length} channels
        </p>
      </div>
    </div>
  );
}

interface ChannelItemProps {
  channel: Channel;
  isActive: boolean;
  onClick: () => void;
}

function ChannelItem({ channel, isActive, onClick }: ChannelItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200',
        'hover:bg-zinc-800/80 group',
        isActive && 'bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-600/30'
      )}
    >
      {/* Channel Logo/Icon */}
      <div
        className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
          'bg-zinc-800 group-hover:bg-zinc-700 transition-colors',
          isActive && 'bg-purple-600/20'
        )}
      >
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-8 h-8 object-contain rounded"
          />
        ) : (
          <Radio className={cn('w-5 h-5 text-zinc-400', isActive && 'text-purple-400')} />
        )}
      </div>

      {/* Channel Info */}
      <div className="flex-1 min-w-0 text-left">
        <p className={cn('font-medium truncate', isActive ? 'text-white' : 'text-zinc-300')}>
          {channel.name}
        </p>
        {channel.group && (
          <p className="text-xs text-zinc-500 truncate">{channel.group}</p>
        )}
      </div>

      {/* Active Indicator */}
      {isActive && (
        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
      )}
    </button>
  );
}

// Desktop Sidebar
export function Sidebar() {
  const { sidebarOpen } = usePlayerStore();

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col h-full bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 transition-all duration-300',
        sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
      )}
    >
      <ChannelList />
    </aside>
  );
}

// Mobile Sidebar (Sheet/Drawer)
export function MobileSidebar() {
  const { sidebarOpen, toggleSidebar } = usePlayerStore();

  return (
    <Sheet open={sidebarOpen} onOpenChange={toggleSidebar}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden fixed top-4 left-4 z-50 bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 hover:bg-zinc-800"
        >
          <Menu className="w-5 h-5 text-white" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0 bg-zinc-900 border-zinc-800">
        <SheetHeader className="sr-only">
          <SheetTitle>Channel List</SheetTitle>
        </SheetHeader>
        <ChannelList />
      </SheetContent>
    </Sheet>
  );
}
