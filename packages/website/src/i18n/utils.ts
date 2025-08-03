import { getAssessmentTranslations } from "@/locales";
import { getAboutTranslations } from "@/locales";
import { getResourcesTranslations } from "@/locales";
import { getGuideTranslations } from "@/locales";
import { getHomeTranslations } from "@/locales";
import { getSharedTranslations } from "@/locales";
import type { IAboutTranslations } from "@/locales";
import type { IResourcesTranslations } from "@/locales";
import type { IGuideTranslations } from "@/locales";
import type { IHomeTranslations } from "@/locales";
import type { ISharedTranslations } from "@/locales";
import { type Language, type PageType } from "@sunrain/shared";

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
 * SSG翻译函数 - 直接在Astro组件中调用，不使用React hooks
 * @param lang 语言代码
 * @param pageType 页面类型，如果不提供则只使用共享翻译
 * @returns 翻译函数
 */
export function createSSGTranslations(lang: Language, pageType?: PageType) {
  // 直接使用现有的翻译获取函数
  const sharedTranslations = getSharedTranslations(lang);

  // 根据页面类型获取对应的页面翻译
  let pageTranslations: any = undefined;

  if (pageType) {
    switch (pageType) {
      case "home":
        pageTranslations = getHomeTranslations(lang);
        break;
      case "guide":
        pageTranslations = getGuideTranslations(lang);
        break;
      case "resources":
        pageTranslations = getResourcesTranslations(lang);
        break;
      case "about":
        pageTranslations = getAboutTranslations(lang);
        break;
      case "assessment":
        pageTranslations = getAssessmentTranslations(lang);
        break;
    }
  }

  return function t(key: string, params?: Record<string, any>): string {
    const keys = key.split(".");

    // 首先尝试从页面特定翻译中获取
    if (pageTranslations) {
      let pageValue: any = pageTranslations;
      let pageValid = true;

      for (const k of keys) {
        if (pageValue && typeof pageValue === "object" && k in pageValue) {
          pageValue = pageValue[k];
        } else {
          pageValid = false;
          break;
        }
      }

      if (pageValid && typeof pageValue === "string") {
        // 简单的参数替换
        if (params && typeof pageValue === "string") {
          return pageValue.replace(/\{(\w+)\}/g, (match, key) => {
            const value = params[key];
            return value !== undefined ? String(value) : match;
          });
        }
        return pageValue;
      }
    }

    // 如果页面特定翻译中没有找到，尝试从共享翻译中获取
    let sharedValue: any = sharedTranslations;
    let sharedValid = true;

    for (const k of keys) {
      if (sharedValue && typeof sharedValue === "object" && k in sharedValue) {
        sharedValue = sharedValue[k];
      } else {
        sharedValid = false;
        break;
      }
    }

    if (sharedValid && typeof sharedValue === "string") {
      // 简单的参数替换
      if (params && typeof sharedValue === "string") {
        return sharedValue.replace(/\{(\w+)\}/g, (match, key) => {
          const value = params[key];
          return value !== undefined ? String(value) : match;
        });
      }
      return sharedValue;
    }

    // 如果都没找到，返回键本身
    if (process.env.NODE_ENV === "development") {
      console.warn(
        `SSG translation key "${key}" not found for language "${lang}" and page type "${pageType}"`
      );
    }
    return key;
  };
}
