import { useEffect } from 'react';
import { AlertTriangle, X, Download, Monitor, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CorsErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainName: string;
}

export function CorsErrorModal({ isOpen, onClose, domainName }: CorsErrorModalProps) {
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
    window.open('https://github.com/webframeplayer/webframeplayer/releases/tag/preview', '_blank', 'noopener,noreferrer');
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
            <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Yayın Açılamadı</h2>
              <p className="text-white/50 text-sm">Tarayıcı kısıtlaması (CORS)</p>
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
          <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4">
            <p className="text-amber-200/80 text-sm leading-relaxed">
              Bu yayın tarayıcı güvenlik politikaları (CORS) nedeniyle web&apos;de açılamıyor. 
              <span className="font-semibold text-amber-200"> Masaüstü uygulamasını indirerek bu sorunu çözebilirsiniz.</span>
            </p>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Monitor className="w-4 h-4 text-green-400" />
              </div>
              <span>Tüm yayınlar sorunsuz açılır</span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Download className="w-4 h-4 text-blue-400" />
              </div>
              <span>Ücretsiz, hızlı kurulum</span>
            </div>
            <div className="flex items-center gap-3 text-white/70 text-sm">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <ExternalLink className="w-4 h-4 text-purple-400" />
              </div>
              <span>Windows, macOS ve Linux desteği</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-zinc-900/50">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            Daha Sonra
          </Button>
          <Button
            onClick={handleDownload}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white gap-2"
          >
            <Download className="w-4 h-4" />
            Uygulamayı İndir
          </Button>
        </div>
      </div>
    </div>
  );
}
