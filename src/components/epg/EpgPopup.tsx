'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { usePlayerStore } from '@/store/usePlayerStore';
import { Clock, Calendar, Globe } from 'lucide-react';

export function EpgPopup() {
  const { selectedProgram, setSelectedProgram } = usePlayerStore();

  if (!selectedProgram) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const getDuration = () => {
    const durationMs = selectedProgram.endTimestamp - selectedProgram.startTimestamp;
    const minutes = Math.floor(durationMs / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours} saat ${remainingMinutes} dakika`;
    }
    return `${minutes} dakika`;
  };

  const isLive = () => {
    const now = Date.now() / 1000;
    return now >= selectedProgram.startTimestamp && now <= selectedProgram.endTimestamp;
  };

  return (
    <Dialog open={!!selectedProgram} onOpenChange={() => setSelectedProgram(null)}>
      <DialogContent className="bg-[var(--frame-surface)] border-white/10 text-white max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {isLive() && (
              <span className="text-[10px] font-bold text-white bg-[var(--frame-primary)] px-2 py-0.5 rounded animate-pulse">
                CANLI
              </span>
            )}
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            {selectedProgram.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Time info */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2 text-white/60">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(selectedProgram.start)}</span>
            </div>
            <div className="flex items-center gap-2 text-white/60">
              <Clock className="w-4 h-4" />
              <span>{formatTime(selectedProgram.start)} - {formatTime(selectedProgram.end)}</span>
            </div>
            {selectedProgram.lang && (
              <div className="flex items-center gap-2 text-white/60">
                <Globe className="w-4 h-4" />
                <span className="uppercase">{selectedProgram.lang}</span>
              </div>
            )}
          </div>

          {/* Duration bar */}
          <div className="bg-white/5 rounded-lg p-3">
            <div className="flex justify-between text-xs text-white/40 mb-2">
              <span>Süre</span>
              <span>{getDuration()}</span>
            </div>
            {isLive() && (
              <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--frame-primary)] rounded-full transition-all"
                  style={{ 
                    width: `${((Date.now() / 1000 - selectedProgram.startTimestamp) / (selectedProgram.endTimestamp - selectedProgram.startTimestamp)) * 100}%` 
                  }}
                />
              </div>
            )}
          </div>

          {/* Description */}
          {selectedProgram.description && (
            <div>
              <h4 className="text-sm font-semibold text-white/60 mb-2">Açıklama</h4>
              <DialogDescription className="text-white/80 text-sm leading-relaxed">
                {selectedProgram.description}
              </DialogDescription>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
