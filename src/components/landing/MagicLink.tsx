'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/lib/i18n';

export function MagicLink() {
  const { t } = useTranslation();
  const ml = t.landing.magicLink;

  return (
    <section className="relative py-20 bg-gradient-to-b from-[var(--frame-background)] to-[var(--frame-surface-dark)]">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--frame-primary)]/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {ml.title}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-[var(--frame-primary)]">
            {ml.titleHighlight}
          </span>
        </h2>
        
        <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          {ml.subtitle}
        </p>

        <div className="flex justify-center">
          <Link href="/magic-code">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-cyan-500 to-[var(--frame-primary)] hover:opacity-90 text-white shadow-lg shadow-cyan-500/25 px-10 h-14 text-lg font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              {ml.ctaCreate}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
