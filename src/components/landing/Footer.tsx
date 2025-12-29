import Link from 'next/link';
import { Tv, Github, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 bg-[var(--iptv-background)] border-t border-white/10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--iptv-primary)] flex items-center justify-center">
              <Tv className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold">Web IPTV Player</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 text-sm text-white/60">
            <Link href="/login" className="hover:text-white transition-colors">
              Login
            </Link>
            <Link href="#features" className="hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#" className="hover:text-white transition-colors">
              Privacy
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
        <div className="mt-8 pt-8 border-t border-white/5 text-center">
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Web IPTV Player. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
