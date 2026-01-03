'use client';

import { useState } from 'react';
import { usePlayerStore, useHistory } from '@/store/usePlayerStore';
import type { ContentItem } from '@/types/iptv';
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
import { Search, Menu, Radio, X, History, Tv, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';

type SidebarTab = 'channels' | 'history';

function SidebarContent() {
  const [activeTab, setActiveTab] = useState<SidebarTab>('channels');
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-[0.2em] text-white">FRAME</span>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-lg">
          <button
            onClick={() => setActiveTab('channels')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === 'channels'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
            )}
          >
            <Tv className="w-4 h-4" />
            {t.dashboard.channels}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === 'history'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
            )}
          >
            <History className="w-4 h-4" />
            {t.dashboard.nav.history}
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'channels' ? <ChannelList /> : <HistoryList />}
    </div>
  );
}

function ChannelList() {
  const { content, activeContent, searchQuery, playContent, setSearchQuery } = usePlayerStore();
  const { t } = useTranslation();

  const filteredChannels = content.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) && item.type === 'live'
  );

  return (
    <>
      {/* Search */}
      <div className="p-4 border-b border-zinc-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder={t.dashboard.searchChannels}
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
              {searchQuery ? t.dashboard.noContent : t.dashboard.noContent}
            </div>
          ) : (
            filteredChannels.map((channel) => (
              <ChannelItem
                key={channel.id}
                channel={channel}
                isActive={activeContent?.id === channel.id}
                onClick={() => playContent(channel, true)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          {filteredChannels.length} {t.common.channels}
        </p>
      </div>
    </>
  );
}

function HistoryList() {
  const history = useHistory();
  const { activeContent, playContent, clearHistory } = usePlayerStore();
  const { t } = useTranslation();

  return (
    <>
      {/* History List */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {history.length === 0 ? (
            <div className="p-4 text-center text-zinc-500">
              {t.dashboard.historyEmpty}
            </div>
          ) : (
            history.map((item) => (
              <ChannelItem
                key={`${item.content.id}-${item.watchedAt}`}
                channel={item.content}
                isActive={activeContent?.id === item.content.id}
                onClick={() => playContent(item.content, true)}
                timestamp={item.watchedAt}
              />
            ))
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-800">
        {history.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10"
            onClick={clearHistory}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t.dashboard.clearHistory}
          </Button>
        ) : (
          <p className="text-xs text-zinc-500 text-center">
            0 {t.common.channels}
          </p>
        )}
      </div>
    </>
  );
}

interface ChannelItemProps {
  channel: ContentItem;
  isActive: boolean;
  onClick: () => void;
  timestamp?: number;
}

function ChannelItem({ channel, isActive, onClick, timestamp }: ChannelItemProps) {
  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return date.toLocaleDateString();
  };

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
        {timestamp ? (
          <p className="text-xs text-zinc-500 truncate">{formatTime(timestamp)}</p>
        ) : (
          channel.group && (
            <p className="text-xs text-zinc-500 truncate">{channel.group}</p>
          )
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
      <SidebarContent />
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
        <SidebarContent />
      </SheetContent>
    </Sheet>
  );
}

