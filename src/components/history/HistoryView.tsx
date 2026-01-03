'use client';

import { usePlayerStore, useHistory } from '@/store/usePlayerStore';
import type { ContentItem } from '@/types/iptv';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { History, Play, Trash2, Clock, Tv, Film, Video } from 'lucide-react';

interface HistoryViewProps {
  onPlayContent: (content: ContentItem) => void;
}

export function HistoryView({ onPlayContent }: HistoryViewProps) {
  const history = useHistory();
  const { clearHistory } = usePlayerStore();

  const formatTime = (ts: number) => {
    const date = new Date(ts);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'live': return <Tv className="w-5 h-5" />;
      case 'movie': return <Film className="w-5 h-5" />;
      case 'series': return <Video className="w-5 h-5" />;
      default: return <Tv className="w-5 h-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'live': return 'Canlı TV';
      case 'movie': return 'Film';
      case 'series': return 'Dizi';
      default: return type;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[var(--iptv-background)]">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <History className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">İzleme Geçmişi</h1>
              <p className="text-white/50 text-sm">{history.length} içerik</p>
            </div>
          </div>
          
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="text-red-400 border-red-400/30 hover:bg-red-500/10 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Geçmişi Temizle
            </Button>
          )}
        </div>

        {/* History List */}
        {history.length === 0 ? (
          <div className="py-16 text-center">
            <History className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl text-white/60 mb-2">Henüz izleme geçmişi yok</h2>
            <p className="text-white/40 text-sm">İzlediğiniz içerikler burada görünecek</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item) => (
              <div
                key={`${item.content.id}-${item.watchedAt}`}
                onClick={() => onPlayContent(item.content)}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 cursor-pointer transition-all group"
              >
                {/* Thumbnail/Logo */}
                <div className="w-16 h-16 rounded-lg bg-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {item.content.logo ? (
                    <img src={item.content.logo} alt="" className="w-12 h-12 object-contain" />
                  ) : (
                    <div className="text-white/40">
                      {getContentIcon(item.content.type)}
                    </div>
                  )}
                </div>

                {/* Content Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{item.content.name}</p>
                  <p className="text-white/40 text-sm truncate">{item.content.group}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded">
                      {getTypeLabel(item.content.type)}
                    </span>
                    <span className="text-xs text-white/40 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.watchedAt)}
                    </span>
                  </div>
                </div>

                {/* Play Button */}
                <Button
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)]"
                >
                  <Play className="w-5 h-5 text-white" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
