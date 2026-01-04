'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export function MagicLink() {
  const { t } = useTranslation();
  const ml = t.landing.magicLink;

  return (
    <section className="relative py-20 bg-gradient-to-b from-[var(--iptv-background)] to-[var(--iptv-surface-dark)]">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--iptv-primary)]/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-cyan-400 text-sm font-medium">{ml.badge}</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {ml.title}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[var(--iptv-primary)]">
              {ml.titleHighlight}
            </span>
          </h2>
          
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            {ml.subtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Benefit 1 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-white font-semibold mb-2 text-lg">{ml.benefit1Title}</h3>
            <p className="text-white/60 text-sm">
              {ml.benefit1Desc}
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-[var(--iptv-primary)]/20 rounded-xl flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-[var(--iptv-primary)]" />
            </div>
            <h3 className="text-white font-semibold mb-2 text-lg">{ml.benefit2Title}</h3>
            <p className="text-white/60 text-sm">
              {ml.benefit2Desc}
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4">
              <ArrowRight className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-semibold mb-2 text-lg">{ml.benefit3Title}</h3>
            <p className="text-white/60 text-sm">
              {ml.benefit3Desc}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/magic-link">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-[var(--iptv-primary)] hover:opacity-90 text-white shadow-lg shadow-cyan-500/25 px-8 h-14 text-lg font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {ml.ctaCreate}
            </Button>
          </Link>
          
          <Link href="/magic-link-faq">
            <Button 
              size="lg"
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 px-8 h-14 text-lg"
            >
              {ml.ctaLearnMore}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
