import copy from '@/data/platform-copy.json';
import type { Language } from './i18n';

// Presentation copy is separate from the source-backed questionnaire content.
export function getPlatformCopy(lang: Language) {
  return copy[lang];
}
