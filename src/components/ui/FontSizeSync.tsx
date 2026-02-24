'use client';

import { useEffect } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';

export function FontSizeSync() {
  const fontSize = usePlayerStore((s) => s.fontSize);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  return null;
}
