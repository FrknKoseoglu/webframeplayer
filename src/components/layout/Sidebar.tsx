'use client';

import { useState, useEffect } from 'react';
import { usePlayerStore, useHistory } from '@/store/usePlayerStore';
import type { ContentItem } from '@/types/player';
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
import { Search, Menu, Radio, X, History, Tv, Trash2, CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/i18n';
import { MarqueeText } from '@/components/ui/MarqueeText';

type SidebarTab = 'channels' | 'events' | 'history';

type CalendarEvent = {
  id: string;
  title: string;
  channel: string;
  channelId: string | null;
  eventDate: string;
};

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
              'flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === 'channels'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
            )}
          >
            <Tv className="w-4 h-4" />
            <span className="hidden sm:inline">{t.dashboard.channels}</span>
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === 'events'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
            )}
          >
            <CalendarDays className="w-4 h-4" />
            <span className="hidden sm:inline">Etkinlik</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-md text-sm font-medium transition-all',
              activeTab === 'history'
                ? 'bg-purple-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
            )}
          >
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">{t.dashboard.nav.history}</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'channels' && <ChannelList />}
      {activeTab === 'events' && <EventsList />}
      {activeTab === 'history' && <HistoryList />}
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

function EventsList() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const { playContent, content } = usePlayerStore();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/public/events');
        if (res.ok) {
          const data = await res.json();
          setEvents(data);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleEventClick = (event: CalendarEvent) => {
    if (event.channelId) {
      // Find channel by ID and play it
      const channel = content.find(c => c.id === event.channelId || c.streamId?.toString() === event.channelId);
      if (channel) {
        playContent(channel, true);
      }
    }
  };

  const formatEventTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) return `Bugün ${time}`;
    if (isTomorrow) return `Yarın ${time}`;
    return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }) + ` ${time}`;
  };

  const isLive = (dateStr: string) => {
    const eventDate = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - eventDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins >= -10 && diffMins <= 120; // 10 min before to 2 hours after
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-zinc-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="flex-1">
        <div className="p-2">
          {events.length === 0 ? (
            <div className="p-4 text-center text-zinc-500">
              Henüz etkinlik yok
            </div>
          ) : (
            events.map((event) => (
              <button
                key={event.id}
                onClick={() => handleEventClick(event)}
                disabled={!event.channelId}
                className={cn(
                  'w-full p-3 rounded-lg transition-all mb-2 text-left',
                  event.channelId
                    ? 'hover:bg-zinc-800/80 cursor-pointer'
                    : 'cursor-default opacity-80',
                  isLive(event.eventDate) && 'bg-red-500/10 border border-red-500/30'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{event.title}</p>
                    <p className="text-sm text-pink-300 truncate">{event.channel}</p>
                  </div>
                  {isLive(event.eventDate) && (
                    <span className="shrink-0 px-2 py-0.5 text-xs font-bold bg-red-500 text-white rounded animate-pulse">
                      CANLI
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500 mt-1">
                  {formatEventTime(event.eventDate)}
                </p>
              </button>
            ))
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-zinc-800">
        <p className="text-xs text-zinc-500 text-center">
          {events.length} etkinlik
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
        <MarqueeText className={cn('font-medium', isActive ? 'text-white' : 'text-zinc-300')}>
          {channel.name}
        </MarqueeText>
        {timestamp ? (
          <p className="text-xs text-zinc-500 truncate">{formatTime(timestamp)}</p>
        ) : (
          channel.group && (
            <MarqueeText className="text-xs text-zinc-500">{channel.group}</MarqueeText>
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
