/**
 * 资源页翻译内容索引文件
 */
import type { Language } from '../../i18n/config';
import type { IResourcesTranslations } from './types';

// 导入所有语言的翻译
import resourcesEn from './en';
import resourcesZh from './zh';

/**
 * 资源页翻译内容映射
 */
export const resourcesTranslations = {
  en: resourcesEn,
  zh: resourcesZh,
} as const;

/**
 * 获取指定语言的资源页翻译内容
 */
export function getResourcesTranslations(lang: Language): IResourcesTranslations {
  return resourcesTranslations[lang] || resourcesTranslations.en;
}

// 导出类型和所有语言的翻译
export type { IResourcesTranslations } from './types';
export { resourcesEn, resourcesZh };
export default resourcesTranslations;