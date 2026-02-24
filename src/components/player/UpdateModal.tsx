'use client';

import { useEffect, useState } from 'react';
import { Download, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentVersion: string;
  latestVersion: string;
}

export function UpdateModal({ isOpen, onClose, currentVersion, latestVersion }: UpdateModalProps) {
  const { t, language } = useTranslation();

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

  const handleDownload = () => {
    window.open('https://github.com/webframeplayer/webframeplayer/releases/latest', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
            <div className="p-3 rounded-full bg-blue-500/10 border border-blue-500/20">
              <Info className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {language === 'tr' ? 'Güncelleme Mevcut' : 'Update Available'}
              </h2>
              <p className="text-white/50 text-sm">
                v{currentVersion} → v{latestVersion}
              </p>
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
        <div className="p-6 space-y-5">
          <div className="bg-blue-500/5 border border-blue-500/10 rounded-xl p-4">
            <p className="text-blue-200/80 text-sm leading-relaxed">
              {language === 'tr' 
                ? 'Masaüstü uygulamasının yeni bir sürümü yayınlandı. Daha iyi performans ve yeni özellikler için uygulamanızı güncellemeniz önerilir.'
                : 'A new version of the desktop application is available. We recommend updating your app for better performance and new features.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-zinc-900/50">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            {language === 'tr' ? 'Daha Sonra' : 'Later'}
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white gap-2"
          >
            <Download className="w-4 h-4" />
            {language === 'tr' ? 'Hemen İndir' : 'Download Now'}
          </Button>
        </div>
      </div>
    </div>
  );
}
