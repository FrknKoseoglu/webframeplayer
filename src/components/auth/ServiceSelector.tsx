'use client';

import { useState } from 'react';
import { Plus, Tv, Trash2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useConfirm } from '@/components/ui/confirm-dialog';
import { usePlayerStore } from '@/store/usePlayerStore';
import type { Profile } from '@/types/iptv';

interface ServiceSelectorProps {
  onAddNew: () => void;
  onSelect: (profile: Profile) => void;
}

export function ServiceSelector({ onAddNew, onSelect }: ServiceSelectorProps) {
  const { confirm } = useConfirm();
  const { profiles, removeProfile } = usePlayerStore();

  const handleDelete = async (e: React.MouseEvent, profileId: string) => {
    e.stopPropagation();
    const proceed = await confirm({
      title: 'Hizmeti Sil',
      description: 'Bu hizmeti silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      confirmText: 'Sil',
      cancelText: 'İptal',
      type: 'danger',
    });
    
    if (proceed) {
      removeProfile(profileId);
      toast.success('Hizmet silindi');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[var(--iptv-background)] text-white flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[var(--iptv-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Tv className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Hizmet Seçin</h1>
        <p className="text-white/60">Devam etmek için bir hizmet seçin veya yeni ekleyin</p>
      </div>

      {/* Services Grid */}
      <div className="w-full max-w-2xl grid gap-4">
        {profiles.map((profile) => (
          <div
            key={profile.id}
            onClick={() => onSelect(profile)}
            className="group relative bg-[var(--iptv-surface)] border border-white/5 rounded-xl p-5 flex items-center gap-4 cursor-pointer transition-all hover:bg-[var(--iptv-surface)]/80 hover:border-[var(--iptv-primary)]/30"
          >
            {/* Icon */}
            <div className="w-12 h-12 bg-[var(--iptv-primary)]/20 rounded-xl flex items-center justify-center shrink-0">
              <Tv className="w-6 h-6 text-[var(--iptv-primary)]" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold truncate">{profile.name}</p>
              <p className="text-white/40 text-sm">
                {profile.type === 'xtream' ? 'Xtream Codes' : 'M3U Playlist'} • {formatDate(profile.createdAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => handleDelete(e, profile.id)}
                className="text-white/40 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="w-8 h-8 bg-[var(--iptv-primary)] rounded-full flex items-center justify-center">
                <Play className="w-4 h-4 text-white ml-0.5" />
              </div>
            </div>
          </div>
        ))}

        {/* Add New Service Button */}
        <button
          onClick={onAddNew}
          className="flex items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed border-white/10 hover:border-[var(--iptv-primary)]/50 hover:bg-[var(--iptv-primary)]/5 transition-all text-white/60 hover:text-white"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Yeni Hizmet Ekle</span>
        </button>
      </div>
    </div>
  );
}
