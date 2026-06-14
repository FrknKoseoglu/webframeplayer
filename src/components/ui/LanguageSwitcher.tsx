'use client';

import { usePlayerStore } from '@/store/usePlayerStore';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function LanguageSwitcher({ className }: { className?: string }) {
  const language = usePlayerStore((state) => state.language);
  const setLanguage = usePlayerStore((state) => state.setLanguage);

  return (
    <div className={cn('flex items-center gap-1 p-1 rounded-lg bg-white/5', className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('tr')}
        className={cn(
          'px-3 py-1 h-8 text-sm font-medium rounded-md transition-all',
          language === 'tr'
            ? 'bg-[var(--frame-primary)] text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        )}
      >
        TR
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setLanguage('en')}
        className={cn(
          'px-3 py-1 h-8 text-sm font-medium rounded-md transition-all',
          language === 'en'
            ? 'bg-[var(--frame-primary)] text-white'
            : 'text-white/60 hover:text-white hover:bg-white/10'
        )}
      >
        EN
      </Button>
    </div>
  );
}
