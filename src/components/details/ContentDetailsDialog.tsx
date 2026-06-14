'use client';

import { useState } from 'react';
import { X, Star, Calendar, Clock, Info } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ContentItem } from '@/types/iptv';

interface ContentDetailsDialogProps {
  content: ContentItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentDetailsDialog({ content, open, onOpenChange }: ContentDetailsDialogProps) {
  if (!content) return null;

  const formatDuration = (dur?: string) => {
    if (!dur) return null;
    return dur.includes(':') ? dur : `${dur} dk`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 gap-0 bg-zinc-900 border-white/10">
        <div className="relative">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            {content.logo ? (
              <img 
                src={content.logo} 
                alt={content.name}
                className="w-full h-full object-cover opacity-20 blur-xl"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-800 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/80 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <DialogHeader className="p-6 pb-0">
              <div className="flex items-start gap-6">
                {/* Poster */}
                {content.logo && (
                  <div className="shrink-0 w-32">
                    <img 
                      src={content.logo} 
                      alt={content.name}
                      className="w-full h-auto rounded-lg shadow-2xl"
                    />
                  </div>
                )}
                
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-2xl font-bold text-white mb-3">
                    {content.name}
                  </DialogTitle>
                  
                  {/* Metadata */}
                  <div className="flex items-center gap-3 mb-4 text-sm font-medium flex-wrap">
                    {content.rating && (
                      <div className="flex items-center gap-1.5 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span>{content.rating}</span>
                      </div>
                    )}
                    {content.year && (
                      <span className="text-white/80 border-l border-white/20 pl-3">
                        {content.year}
                      </span>
                    )}
                    {content.duration && (
                      <span className="text-white/80 border-l border-white/20 pl-3">
                        {formatDuration(content.duration)}
                      </span>
                    )}
                    <span className="text-[var(--frame-primary)] font-bold border-l border-white/20 pl-3 uppercase tracking-wider">
                      {content.type === 'series' ? 'DİZİ' : 'FİLM'}
                    </span>
                  </div>

                  {/* Category */}
                  {content.group && (
                    <div className="flex items-center gap-2 text-sm text-white/60 mb-4">
                      <Info className="w-4 h-4" />
                      <span>{content.group}</span>
                    </div>
                  )}
                </div>
              </div>
            </DialogHeader>

            {/* Plot */}
            <ScrollArea className="max-h-[50vh] px-6 py-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[var(--frame-primary)]" />
                    Açıklama
                  </h3>
                  <p className="text-white/80 leading-relaxed">
                    {content.plot || "Açıklama bulunmuyor."}
                  </p>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
