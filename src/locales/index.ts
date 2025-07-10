/**
 * 多语言内容索引文件
 * 导出所有页面的翻译内容
 */
import type { Language } from '../i18n/config';

// 导入共享翻译
import sharedEn from './shared/en';
import sharedZh from './shared/zh';
import sharedEs from './shared/es';
import sharedJa from './shared/ja';
import sharedKo from './shared/ko';
import sharedHi from './shared/hi';
import sharedAr from './shared/ar';

// 导入首页翻译
import homeEn from './home/en';
import homeZh from './home/zh';

// 导入指南页翻译
import guideEn from './guide/en';
import guideZh from './guide/zh';

// 导入资源页翻译
import resourcesEn from './resources/en';
import resourcesZh from './resources/zh';

// 导入关于页翻译
import aboutEn from './about/en';
import aboutZh from './about/zh';

/**
 * 共享翻译内容映射
 */
export const sharedTranslations = {
  en: sharedEn,
  zh: sharedZh,
  es: sharedEs,
  ja: sharedJa,
  ko: sharedKo,
  hi: sharedHi,
  ar: sharedAr,
} as const;

/**
 * 首页翻译内容映射
 */
export const homeTranslations = {
  en: homeEn,
  zh: homeZh,
} as const;

/**
 * 指南页翻译内容映射
 */
export const guideTranslations = {
  en: guideEn,
  zh: guideZh,
} as const;

/**
 * 资源页翻译内容映射
 */
export const resourcesTranslations = {
  en: resourcesEn,
  zh: resourcesZh,
} as const;

/**
 * 关于页翻译内容映射
 */
export const aboutTranslations = {
  en: aboutEn,
  zh: aboutZh,
} as const;

/**
 * 获取指定语言的共享翻译内容
 */
export function getSharedTranslations(lang: Language) {
  return sharedTranslations[lang] || sharedTranslations.en;
}

/**
 * 获取指定语言的首页翻译内容
 */
export function getHomeTranslations(lang: Language) {
  return homeTranslations[lang as keyof typeof homeTranslations] || homeTranslations.en;
}

/**
 * 获取指定语言的指南页翻译内容
 */
export function getGuideTranslations(lang: Language) {
  return guideTranslations[lang as keyof typeof guideTranslations] || guideTranslations.en;
}

/**
 * 获取指定语言的资源页翻译内容
 */
export function getResourcesTranslations(lang: Language) {
  return resourcesTranslations[lang as keyof typeof resourcesTranslations] || resourcesTranslations.en;
}

/**
 * 获取指定语言的关于页翻译内容
 */
export function getAboutTranslations(lang: Language) {
  return aboutTranslations[lang as keyof typeof aboutTranslations] || aboutTranslations.en;
}

// 类型导出
export type { ISharedTranslations } from './shared/types';
export type { IHomeTranslations } from './home/types';
export type { IGuideTranslations } from './guide/types';
export type { IResourcesTranslations } from './resources/types';
export type { IAboutTranslations } from './about/types';
