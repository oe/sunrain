import { defaultLang, type Language, type PageType } from '@sunrain/shared';
import { 
  getSharedTranslations,
  getHomeTranslations,
  getGuideTranslations,
  getResourcesTranslations,
  getAboutTranslations,
  type ISharedTranslations,
  type IHomeTranslations,
  type IGuideTranslations,
  type IResourcesTranslations,
  type IAboutTranslations
} from '../locales';

// PageType is now imported from shared package

/**
 * 翻译内容的联合类型
 */
export type TranslationsUnion = 
  | ISharedTranslations 
  | IHomeTranslations 
  | IGuideTranslations 
  | IResourcesTranslations 
  | IAboutTranslations;

/**
 * 统一的翻译函数
 * 支持按 key 前缀自动区分页面内容和公共内容
 * @param lang 语言代码
 * @param pageType 页面类型，如果不提供则只使用共享翻译
 * @returns 翻译函数
 */
export function useTranslations(lang: Language, pageType?: PageType) {
  const sharedT = getSharedTranslations(lang);
  
  // 根据页面类型获取对应的页面翻译
  let pageT: IHomeTranslations | IGuideTranslations | IResourcesTranslations | IAboutTranslations | undefined;
  
  switch (pageType) {
    case 'home':
      pageT = getHomeTranslations(lang);
      break;
    case 'guide':
      pageT = getGuideTranslations(lang);
      break;
    case 'resources':
      pageT = getResourcesTranslations(lang);
      break;
    case 'about':
      pageT = getAboutTranslations(lang);
      break;
    default:
      pageT = undefined;
  }
  
  return function t(key: string): string {
    // 支持嵌套键访问，如 'hero.title' 或 'nav.home'
    const keys = key.split('.');
    
    // 首先尝试从页面特定翻译中获取
    if (pageT) {
      let pageValue: any = pageT;
      let pageValid = true;
      
      for (const k of keys) {
        if (pageValue && typeof pageValue === 'object' && k in pageValue) {
          pageValue = pageValue[k];
        } else {
          pageValid = false;
          break;
        }
      }
      
      if (pageValid && typeof pageValue === 'string') {
        return pageValue;
      }
    }
    
    // 如果页面特定翻译中没有找到，尝试从共享翻译中获取
    let sharedValue: any = sharedT;
    let sharedValid = true;
    
    for (const k of keys) {
      if (sharedValue && typeof sharedValue === 'object' && k in sharedValue) {
        sharedValue = sharedValue[k];
      } else {
        sharedValid = false;
        break;
      }
    }
    
    if (sharedValid && typeof sharedValue === 'string') {
      return sharedValue;
    }
    
    // 如果都没找到，返回键本身并发出警告
    console.warn(`Translation key "${key}" not found for language "${lang}" and page type "${pageType}"`);
    return key;
  };
}

/**
 * 获取首页翻译函数（向后兼容）
 * @param lang 语言代码
 * @returns 翻译函数
 */
export function useHomeTranslations(lang: Language) {
  return useTranslations(lang, 'home');
}

/**
 * 获取指南页翻译函数（向后兼容）
 * @param lang 语言代码
 * @returns 翻译函数
 */
export function useGuideTranslations(lang: Language) {
  return useTranslations(lang, 'guide');
}

/**
 * 获取资源页翻译函数（向后兼容）
 * @param lang 语言代码
 * @returns 翻译函数
 */
export function useResourcesTranslations(lang: Language) {
  return useTranslations(lang, 'resources');
}

/**
 * 获取关于页翻译函数（向后兼容）
 * @param lang 语言代码
 * @returns 翻译函数
 */
export function useAboutTranslations(lang: Language) {
  return useTranslations(lang, 'about');
}

/**
 * 获取仅共享翻译的函数
 * @param lang 语言代码
 * @returns 共享翻译函数
 */
export function useSharedTranslations(lang: Language) {
  return useTranslations(lang);
}

// Re-export utility functions from shared package
export { getRelativeLocaleUrl, getStaticPaths } from '@sunrain/shared';
