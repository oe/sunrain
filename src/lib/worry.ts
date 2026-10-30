import copy from '@/data/worry-copy.json';
import type { Language } from './i18n';

export function getWorryCopy(lang:Language){
  if(!copy[lang])throw new Error(`Missing worry flow locale: ${lang}`);
  return copy[lang];
}

export const WORRY_FOCUS_IDS=['waiting','tasks','people','private'] as const;
export const WORRY_PART_IDS=['information','preparation','support','outside','unsure'] as const;
