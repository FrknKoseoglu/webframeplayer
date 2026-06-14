import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--frame-background)] text-white">
      {/* Simple Header */}
      <header className="border-b border-white/10 bg-[var(--frame-surface)]">
        <div className="container mx-auto px-4 py-4">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
            <span className="text-sm">Ana Sayfa'ya Dön</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {children}
      </main>

      {/* Simple Footer */}
      <footer className="border-t border-white/10 bg-[var(--frame-surface)] mt-16">
        <div className="container mx-auto px-4 py-6 text-center">
          <p className="text-white/40 text-sm">
            © 2025 Frame. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  );
}
