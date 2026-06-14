'use client';

import Link from 'next/link';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MagicLinkFAQ() {
  return (
    <div className="min-h-screen bg-[var(--frame-background)] text-white flex flex-col">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-[var(--frame-primary)]/10 blur-[100px] rounded-full" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[var(--frame-surface)]/50 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" className="text-white/60 hover:text-white">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Ana Sayfa
            </Button>
          </Link>
          
          <Link href="/magic-code">
            <Button className="bg-gradient-to-r from-cyan-500 to-[var(--frame-primary)] hover:opacity-90 text-white">
              <Sparkles className="w-4 h-4 mr-2" />
              Magic Code Oluştur
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 text-center max-w-2xl shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />
          
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-[var(--frame-primary)] rounded-2xl mb-8 shadow-lg shadow-cyan-500/20">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-6">
            Magic Code Nedir?
          </h1>
          
          <p className="text-lg md:text-xl text-white/80 leading-relaxed font-light">
            Uzun şifre ve linklerden oluşan bilgilerinizi basit code'a çeviriyoruz, uygulamaya eklediğinizde kolaylıkla giriş yapabiliyorsunuz.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link href="/magic-code">
              <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-[var(--frame-primary)] hover:opacity-90 text-white px-8">
                Magic Code Oluştur
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
