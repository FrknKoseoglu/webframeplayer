import { useState, useEffect } from 'react';
import { AlertTriangle, Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface CorsErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainName: string;
}

export function CorsErrorModal({ isOpen, onClose, domainName }: CorsErrorModalProps) {
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

  const messageTemplate = `Merhaba, satın aldığım yayını Web Player üzerinden izlemek istiyorum ancak sunucunuzun güvenlik ayarları (CORS) nedeniyle yayın tarayıcıda engelleniyor.

Lütfen yayın sunucunuzda aşağıdaki domain için CORS iznini aktif eder misiniz?

İzin Verilecek Domain: ${domainName}

Teknik Bilgi: Response Header'a "Access-Control-Allow-Origin: ${domainName}" eklenmelidir.`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(messageTemplate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy logic', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Yayın Açılamadı (CORS Hatası)</h2>
              <p className="text-white/50 text-sm">Yayın sağlayıcı kaynaklı engelleme</p>
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
        <div className="p-6 space-y-6">
          <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4">
            <p className="text-red-200/80 text-sm leading-relaxed">
              Bu hata bizden değil, <span className="font-semibold text-red-200">yayın sağlayıcınızın web izni vermemesinden</span> kaynaklanıyor. 
              Sorunu çözmek için yayın aldığınız kişiye aşağıdaki mesajı gönderebilirsiniz.
            </p>
          </div>

          <div className="relative">
            <pre className="w-full h-[240px] p-5 rounded-xl bg-black/50 border border-white/10 text-white/70 font-mono text-sm resize-none focus:outline-none overflow-auto whitespace-pre-wrap leading-relaxed">
              {messageTemplate}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-zinc-900/50">
          <Button
            variant="ghost"
            onClick={onClose}
            className="text-white/50 hover:text-white hover:bg-white/5"
          >
            Kapat
          </Button>
          <Button
            onClick={handleCopy}
            className="bg-white text-black hover:bg-white/90"
          >
            {copied ? 'Kopyalandı' : 'Mesajı Kopyala'}
          </Button>
        </div>
      </div>
    </div>
  );
}
