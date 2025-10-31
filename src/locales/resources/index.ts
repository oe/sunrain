/**
 * 资源页翻译内容索引文件
 */
import type { Language } from '@/shared';
import type { IResourcesTranslations } from './types';

// 导入所有语言的翻译
import resourcesEn from './en';
import resourcesZh from './zh';
import resourcesEs from './es';
import resourcesJa from './ja';
import resourcesKo from './ko';
import resourcesHi from './hi';
import resourcesAr from './ar';

/**
 * 资源页翻译内容映射
 */
export const resourcesTranslations = {
  en: resourcesEn,
  zh: resourcesZh,
  es: resourcesEs,
  ja: resourcesJa,
  ko: resourcesKo,
  hi: resourcesHi,
  ar: resourcesAr,
} as const;

/**
 * 获取指定语言的资源页翻译内容
 */
export function getResourcesTranslations(lang: Language): IResourcesTranslations {
  return resourcesTranslations[lang] || resourcesTranslations.en;
}

// 导出类型和所有语言的翻译
export type { IResourcesTranslations } from './types';
export { resourcesEn, resourcesZh, resourcesEs, resourcesJa, resourcesKo, resourcesHi, resourcesAr };
export default resourcesTranslations;