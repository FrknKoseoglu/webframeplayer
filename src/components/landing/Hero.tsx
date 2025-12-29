'use client';

import Link from 'next/link';
import { Play, Tv, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslation } from '@/lib/i18n';

interface HeroProps {
  hasProfiles?: boolean;
  isHydrated?: boolean;
}

export function Hero({ hasProfiles = false, isHydrated = false }: HeroProps) {
  const { t } = useTranslation();
  const h = t.landing.hero;

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[var(--iptv-background)]">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <LanguageSwitcher />
      </div>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--iptv-primary)]/20 via-transparent to-purple-900/20" />
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
          {h.title1.split(',')[0]}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--iptv-primary)] to-orange-500">{h.title1.split(',')[1] || 'Anywhere.'}</span>
          <br />
          <span className="text-3xl md:text-5xl lg:text-6xl text-white/90">{h.title2}</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10">
          {h.subtitle}{' '}
          <strong className="text-white/80">{h.compatible}</strong>
        </p>

        {/* CTA Buttons - Conditional based on profile state */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {isHydrated && hasProfiles ? (
            // Returning user - show Dashboard button
            <>
              <Link href="/dashboard">
                <Button size="lg" className="bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-red-500/25 min-h-[56px]">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  {h.ctaDashboard}
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/5 px-8 py-6 text-lg rounded-xl min-h-[56px]">
                  {h.ctaNewService}
                </Button>
              </Link>
            </>
          ) : (
            // New user - show Get Started button
            <>
              <Link href="/login">
                <Button size="lg" className="bg-[var(--iptv-primary)] hover:bg-[var(--iptv-primary-dark)] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-red-500/25 min-h-[56px]">
                  <Play className="w-5 h-5 mr-2" />
                  {h.ctaStart}
                </Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg" className="border-white/20 text-white hover:bg-white/5 px-8 py-6 text-lg rounded-xl min-h-[56px]">
                  {h.ctaLearnMore}
                </Button>
              </Link>
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
            <p className="text-sm text-white/50 mt-1">{h.statBrowser}</p>
          </div>
        </div>
      </div>

      {/* Player Mockup (Decorative) */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 opacity-50 pointer-events-none hidden lg:block">
        <div className="aspect-video bg-gradient-to-t from-[var(--iptv-background)] via-zinc-900/90 to-zinc-800/50 rounded-t-2xl border border-white/10 border-b-0 shadow-2xl">
          <div className="absolute inset-4 rounded-lg bg-black/50 flex items-center justify-center">
            <Tv className="w-16 h-16 text-white/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
