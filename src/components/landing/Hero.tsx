'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Download, Tv, ArrowRight, Globe, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { WebLimitationModal } from './WebLimitationModal';
import { useTranslation } from '@/lib/i18n';



interface HeroProps {
  hasProfiles?: boolean;
  isHydrated?: boolean;
}

export function Hero({ hasProfiles = false, isHydrated = false }: HeroProps) {
  const { t } = useTranslation();
  const h = t.landing.hero;
  const [showWebWarning, setShowWebWarning] = useState(false);
  const [isElectron, setIsElectron] = useState(false);

  // Detect if running in Electron via URL param or localStorage
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('electron') === '1') {
      localStorage.setItem('isElectronApp', 'true');
      setIsElectron(true);
    } else if (localStorage.getItem('isElectronApp') === 'true') {
      setIsElectron(true);
    }
  }, []);

  const handleDownloadClick = () => {
    window.open(`${window.location.origin}/l/indir`, '_blank', 'noopener,noreferrer');
  };

  const handleWebPlayerClick = () => {
    // If in Electron, go directly to login (no warning needed)
    if (isElectron) {
      window.location.href = '/login';
      return;
    }
    setShowWebWarning(true);
  };

  return (
    <>
      <WebLimitationModal 
        isOpen={showWebWarning} 
        onClose={() => setShowWebWarning(false)} 
      />
      
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--frame-background)]">
        {/* Language Switcher - Top Right */}
        <div className="absolute top-6 right-6 z-20">
          <LanguageSwitcher />
        </div>

        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--frame-primary)]/20 via-transparent to-purple-900/20" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-white/70">{h.badge}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            {h.headline.split('.')[0]}. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--frame-primary)] to-orange-500">{h.headline.split('.')[1]?.trim() || 'Framed Perfectly.'}</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
            {h.subheadline.split('**')[0]}
            <strong className="text-white/90">Frame</strong>
            {h.subheadline.split('**')[2] || '—the fastest, most elegant way to stream your content on any browser.'}
          </p>

          {/* CTA Buttons - Different for Electron vs Web */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isHydrated && hasProfiles ? (
              // Returning user - show Dashboard button (+ download if not Electron)
              <>
                <Link href="/dashboard">
                  <Button size="lg" className="bg-[var(--frame-primary)] hover:bg-[var(--frame-primary-dark)] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-red-500/25 min-h-[56px]">
                    <ArrowRight className="w-5 h-5 mr-2" />
                    {h.ctaDashboard}
                  </Button>
                </Link>
                {!isElectron && (
                  <Button 
                    variant="outline" 
                    size="lg" 
                    onClick={handleDownloadClick}
                    className="border-white/20 text-white hover:bg-white/5 px-8 py-6 text-lg rounded-xl min-h-[56px]"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    {t.landing.hero.ctaDownload || 'Uygulamayı İndir'}
                  </Button>
                )}
              </>
            ) : isElectron ? (
              // Electron user - show "Hizmet Ekle" button
              <Link href="/login">
                <Button size="lg" className="bg-[var(--frame-primary)] hover:bg-[var(--frame-primary-dark)] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-red-500/25 min-h-[56px]">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  {h.ctaNewService || 'Hizmet Ekle'}
                </Button>
              </Link>
            ) : (
              // Web user - Desktop App First approach
              <>
                {/* Primary CTA: Download Desktop App */}
                <Button 
                  size="lg" 
                  onClick={handleDownloadClick}
                  className="bg-[var(--frame-primary)] hover:bg-[var(--frame-primary-dark)] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-red-500/25 min-h-[56px]"
                >
                  <Download className="w-5 h-5 mr-2" />
                  {t.landing.hero.ctaDownload || 'Masaüstü Uygulamasını İndir'}
                </Button>
                
                {/* Secondary CTA: Web Player (Beta) with warning */}
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleWebPlayerClick}
                  className="border-white/20 text-white hover:bg-white/5 px-8 py-6 text-lg rounded-xl min-h-[56px] relative"
                >
                  <Globe className="w-5 h-5 mr-2" />
                  {t.landing.hero.ctaWebBeta || "Web Player'ı Aç"}
                  {/* Beta Badge */}
                  <span className="absolute -top-2 -right-2 px-2 py-0.5 text-[10px] font-bold bg-orange-500 text-white rounded-full uppercase">
                    Beta
                  </span>
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="mt-16 flex flex-wrap justify-center gap-8 md:gap-16">
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">M3U8</p>
              <p className="text-sm text-white/50 mt-1">{h.statHls}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">Xtream</p>
              <p className="text-sm text-white/50 mt-1">{h.statXtream}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-white">100%</p>
              <p className="text-sm text-white/50 mt-1">{t.landing.hero.statDesktop || 'Masaüstü Uyumlu'}</p>
            </div>
          </div>

          {/* Legal Disclaimer Link */}
          <div className="mt-8">
            <p className="text-xs text-white/30">
              Frame is a software tool only. See{' '}
              <Link href="/legal/terms" className="underline hover:text-white/50">
                Terms
              </Link>
              {' '}for legal responsibilities.
            </p>
          </div>
        </div>

        {/* Player Mockup (Decorative) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 opacity-50 pointer-events-none hidden lg:block">
          <div className="aspect-video bg-gradient-to-t from-[var(--frame-background)] via-zinc-900/90 to-zinc-800/50 rounded-t-2xl border border-white/10 border-b-0 shadow-2xl">
            <div className="absolute inset-4 rounded-lg bg-black/50 flex items-center justify-center">
              <Tv className="w-16 h-16 text-white/20" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
