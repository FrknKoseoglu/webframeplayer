'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Download, ExternalLink, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePlayerStore } from '@/store/usePlayerStore';

interface WebLimitationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Placeholder URL - update with your actual GitHub releases URL
const GITHUB_RELEASES_URL = 'https://github.com/webframeplayer/webframeplayer/releases/tag/preview';

export function WebLimitationModal({ isOpen, onClose }: WebLimitationModalProps) {
  const router = useRouter();
  const language = usePlayerStore((state) => state.language);

  if (!isOpen) return null;

  const handleContinueWeb = () => {
    onClose();
    router.push('/login');
  };

  const handleDownload = () => {
    window.open(GITHUB_RELEASES_URL, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-[var(--iptv-surface-dark)] border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-orange-400" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-bold text-white text-center mb-4">
          {language === 'tr' 
            ? 'Web Player Sınırlamaları Hakkında' 
            : 'About Web Player Limitations'}
        </h2>

        {/* Body */}
        <p className="text-white/70 text-center mb-8 leading-relaxed">
          {language === 'tr'
            ? 'Tarayıcıların güvenlik politikaları (CORS) nedeniyle bazı IPTV yayınları web sürümünde açılmayabilir. Kesintisiz deneyim için Masaüstü Uygulamasını öneriyoruz.'
            : 'Due to browser security policies (CORS), some IPTV streams may not work in the web version. We recommend the Desktop App for a seamless experience.'}
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleDownload}
            className="w-full bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white py-6 text-lg rounded-xl shadow-lg shadow-red-500/25"
          >
            <Download className="w-5 h-5 mr-2" />
            {language === 'tr' ? 'Uygulamayı İndir' : 'Download App'}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleContinueWeb}
            className="w-full border-white/20 text-white/70 hover:text-white hover:bg-white/5 py-6 text-lg rounded-xl"
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            {language === 'tr' ? 'Yine de Web\'de Dene' : 'Try Web Anyway'}
          </Button>
        </div>

        {/* Disclaimer */}
        <p className="text-xs text-white/40 text-center mt-6">
          {language === 'tr'
            ? 'Masaüstü uygulaması Windows, macOS ve Linux destekler.'
            : 'Desktop app supports Windows, macOS, and Linux.'}
        </p>
      </div>
    </div>
  );
}
