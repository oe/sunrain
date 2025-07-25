/**
 * 多语言内容索引文件
 * 导出所有页面的翻译内容
 *
 * @format
 */

import type { Language } from '@sunrain/shared';

// 导入各页面翻译模块
import sharedTranslations, { getSharedTranslations } from './shared';
import homeTranslations, { getHomeTranslations } from './home';
import guideTranslations, { getGuideTranslations } from './guide';
import resourcesTranslations, { getResourcesTranslations } from './resources';
import aboutTranslations, { getAboutTranslations } from './about';

// 导出翻译映射
export {
  sharedTranslations,
  homeTranslations,
  guideTranslations,
  resourcesTranslations,
  aboutTranslations
};

// 导出获取翻译的函数
export {
  getSharedTranslations,
  getHomeTranslations,
  getGuideTranslations,
  getResourcesTranslations,
  getAboutTranslations
};

// 类型导出
export type { ISharedTranslations } from './shared';
export type { IHomeTranslations } from './home';
export type { IGuideTranslations } from './guide';
export type { IResourcesTranslations } from './resources';
export type { IAboutTranslations } from './about';
