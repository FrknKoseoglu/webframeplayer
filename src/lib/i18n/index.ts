import { usePlayerStore } from '@/store/usePlayerStore';
import { tr, type Translations } from './tr';
import { en } from './en';

export type Language = 'tr' | 'en';

const translations: Record<Language, Translations> = {
  tr,
  en,
};

export function useTranslation() {
  const language = usePlayerStore((state) => state.language);
  const t = translations[language];
  return { t, language };
}

export function getTranslation(language: Language): Translations {
  return translations[language];
}

export { tr, en };
export type { Translations };
