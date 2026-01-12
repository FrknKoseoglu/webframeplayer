'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Copy, Check, X, ExternalLink, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getPlaybackInstructions, getVLCUrl } from '@/lib/codec-utils';

interface UnsupportedCodecModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamUrl: string;
  title?: string;
  onTryAnyway?: () => void;
}

export function UnsupportedCodecModal({ 
  isOpen, 
  onClose, 
  streamUrl,
  title,
  onTryAnyway,
}: UnsupportedCodecModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getPlaybackInstructions(streamUrl, title));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleOpenVLC = () => {
    window.open(getVLCUrl(streamUrl), '_self');
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = streamUrl;
    link.download = title || 'video';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-yellow-500/10 border border-yellow-500/20">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Codec Desteklenmiyor</h2>
              <p className="text-white/50 text-sm">H.265/HEVC formatı algılandı</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-4">
            <p className="text-yellow-200/80 text-sm leading-relaxed">
              Bu içerik <span className="font-semibold text-yellow-200">H.265/HEVC</span> formatında, 
              tarayıcı tarafından desteklenmiyor. Aşağıdaki seçeneklerden birini kullanabilirsiniz.
            </p>
          </div>

          {/* Stream info */}
          <div className="bg-black/30 rounded-lg p-3">
            <p className="text-white/40 text-xs font-medium mb-1">Stream URL</p>
            <p className="text-white/70 text-sm font-mono truncate">{streamUrl}</p>
          </div>

          {/* Windows HEVC hint */}
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3">
            <p className="text-blue-200/80 text-xs">
              💡 <span className="font-medium">Windows 10+ İpucu:</span> Microsoft Store'dan ücretsiz 
              "HEVC Video Uzantıları" yükleyerek bu formatı destekleyebilirsiniz.
            </p>
          </div>
        </div>

        {/* Footer with actions */}
        <div className="p-6 border-t border-white/10 bg-zinc-900/50 space-y-3">
          {/* Primary actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={handleOpenVLC}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              VLC'de Aç
            </Button>
            <Button
              onClick={handleDownload}
              variant="outline"
              className="border-white/10 text-white hover:bg-white/5"
            >
              <Download className="w-4 h-4 mr-2" />
              İndir
            </Button>
          </div>

          {/* Secondary actions */}
          <div className="flex items-center gap-3">
            <Button
              onClick={handleCopyLink}
              variant="ghost"
              className="flex-1 text-white/50 hover:text-white hover:bg-white/5"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Kopyalandı
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Link Kopyala
                </>
              )}
            </Button>
            {onTryAnyway && (
              <Button
                onClick={() => {
                  onTryAnyway();
                  onClose();
                }}
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/5"
              >
                Yine de Dene
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
