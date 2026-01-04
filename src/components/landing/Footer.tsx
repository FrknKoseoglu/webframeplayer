'use client';

import Link from 'next/link';
import { Tv, Github, Mail } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { usePlayerStore } from '@/store/usePlayerStore';

export function Footer() {
  const { t } = useTranslation();
  const f = t.landing.footer;
  const language = usePlayerStore((s) => s.language);

  return (
    <footer className="py-12 bg-[var(--iptv-background)] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--iptv-primary)] flex items-center justify-center">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold tracking-[0.2em]">FRAME</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-sm text-white/60">
            <Link href="/legal/terms" className="hover:text-white transition-colors">
              {language === 'tr' ? 'Kullanım Şartları' : 'Terms of Service'}
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/legal/privacy" className="hover:text-white transition-colors">
              {language === 'tr' ? 'Gizlilik Politikası' : 'Privacy Policy'}
            </Link>
            <span className="text-white/20">·</span>
            <Link href="/legal/faq" className="hover:text-white transition-colors">
              {language === 'tr' ? 'Sıkça Sorulan Sorular' : 'FAQ'}
            </Link>
          </div>

          {/* Social */}
          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Github className="w-5 h-5 text-white/60" />
            </a>
            <a
              href="mailto:contact@example.com"
              className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
            >
              <Mail className="w-5 h-5 text-white/60" />
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 pt-6 mt-6 text-center">
          <p className="text-sm text-white/40">
            &copy; 2025 FRAME. {language === 'tr' ? 'Tüm hakları saklıdır' : 'All rights reserved'}.
          </p>
        </div>
      </div>
    </footer>
  );
}
