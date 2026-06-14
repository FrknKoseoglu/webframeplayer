'use client';

import { Star, Calendar, Clock, Info, Play, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useState } from 'react';
import type { ContentItem } from '@/types/iptv';

interface ContentDetailsProps {
  content: ContentItem;
  variant?: 'default' | 'compact';
}

export function ContentDetails({ content, variant = 'default' }: ContentDetailsProps) {
  const [showFullDetails, setShowFullDetails] = useState(false);

  // Helper to format duration if available
  const formatDuration = (dur?: string) => {
    if (!dur) return null;
    return dur.includes(':') ? dur : `${dur} dk`;
  };

  // Shared Popup Content
  const popupContent = (
    <Dialog open={showFullDetails} onOpenChange={setShowFullDetails}>
      <DialogContent className="bg-[var(--frame-surface)] border-white/10 text-white max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white mb-2">
            {content.name}
          </DialogTitle>
          <div className="flex flex-wrap gap-3 text-sm text-white/50">
            {content.group && <span>{content.group}</span>}
            {content.year && <span>• {content.year}</span>}
            {formatDuration(content.duration) && <span>• {formatDuration(content.duration)}</span>}
          </div>
        </DialogHeader>

        <div className="flex flex-col md:flex-row gap-6 mt-4">
          {/* Poster in Popup */}
          {content.logo && (
            <div className="w-full md:w-48 shrink-0 rounded-lg overflow-hidden bg-black/40 aspect-[2/3]">
              <img 
                src={content.logo} 
                alt={content.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Content Info */}
          <div className="flex-1 space-y-6">
             {content.rating && (
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-5 h-5 ${star <= Math.round(Number(content.rating) / 2) ? 'fill-current' : 'opacity-30'}`} 
                    />
                  ))}
                </div>
                <span className="text-lg font-bold text-white">{content.rating}</span>
                <span className="text-white/40 text-sm">/ 10</span>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-white/80 uppercase tracking-wider">Özet</h4>
              <DialogDescription className="text-white/70 text-base leading-relaxed">
                {content.plot || "Açıklama bulunmuyor."}
              </DialogDescription>
            </div>

            {content.type === 'series' && (
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-3">
                  <Play className="w-5 h-5 text-blue-400" />
                  <p className="text-sm text-blue-200">
                    Bölüm seçimi için oynatıcı üzerinden devam edebilirsiniz.
                  </p>
                </div>
              </div>
            )}

            {content.type === 'movie' && content.downloadUrl && (
              <div className="pt-4 flex gap-4">
                <Button 
                  className="bg-white/10 hover:bg-white/20 text-white gap-2"
                  onClick={() => window.open(content.downloadUrl, '_blank')}
                >
                  <Download className="w-4 h-4" />
                  Filmi İndir
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  if (variant === 'compact') {
    return (
      <>
        <div className="flex gap-4 h-full items-center p-2">
          {/* Compact Poster */}
          {content.logo && (
            <div className="h-full aspect-[2/3] shrink-0 rounded-lg overflow-hidden bg-black/40">
              <img 
                src={content.logo} 
                alt={content.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Compact Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
            <h3 className="text-lg font-bold text-white truncate shadow-black drop-shadow-md">
              {content.name}
            </h3>
            
            <div className="flex items-center gap-3 text-sm">
              {content.rating && (
                <div className="flex items-center gap-1.5 text-yellow-500 font-semibold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{content.rating}</span>
                </div>
              )}
              {content.year && <span className="text-white/60">{content.year}</span>}
              {content.duration && <span className="text-white/60">{formatDuration(content.duration)}</span>}
            </div>

            <Button 
              size="sm"
              variant="outline"
              className="w-fit mt-1 border-white/10 bg-white/5 hover:bg-white/10 text-white gap-2"
              onClick={() => setShowFullDetails(true)}
            >
              <Info className="w-4 h-4" />
              Detaylar
            </Button>
          </div>
        </div>
        {popupContent}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Poster / Backdrop Area */}
        <div className="relative aspect-video w-full bg-black/40 rounded-xl overflow-hidden mb-4 shrink-0">
          {content.logo ? (
            <img 
              src={content.logo} 
              alt={content.name}
              className="w-full h-full object-cover opacity-80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--frame-surface)]">
              <Play className="w-12 h-12 text-white/20" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--frame-surface-dark)] to-transparent" />
          
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-lg font-bold text-white line-clamp-2 shadow-black drop-shadow-md">
              {content.name}
            </h3>
          </div>
        </div>

        {/* Metadata Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {content.rating && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{content.rating}</span>
            </div>
          )}
          {content.year && (
             <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{content.year}</span>
            </div>
          )}
          {content.duration && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white/70 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatDuration(content.duration)}</span>
            </div>
          )}
        </div>

        {/* Short Description */}
        <div className="flex-1 overflow-hidden relative">
          <p className="text-sm text-white/60 leading-relaxed line-clamp-[8]">
            {content.plot || "Bu içerik için detaylı açıklama bulunmuyor."}
          </p>
          {content.plot && (
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[var(--frame-surface-dark)] to-transparent" />
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 pt-4 border-t border-white/5">
          <Button 
            className="w-full bg-[var(--frame-primary)] hover:bg-[var(--frame-primary)]/90 text-white gap-2"
            onClick={() => setShowFullDetails(true)}
          >
            <Info className="w-4 h-4" />
            Detayları Gör
          </Button>
        </div>
      </div>
      {popupContent}
    </>
  );
}
